export class Multiplayer {
    constructor(game) {
        this.game = game;
        this.useServer = true; // Only server relay
        this.matchmaker = null;
        this.localId = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
        this.peer = null;
        this.peerId = null;
        this.isHost = false;
        this.roomCode = null;
        this.connections = [];
        this.players = [];
        this.onGameStart = null;
        this.onPlayerUpdate = null;
        this.onGameStateUpdate = null; // NEW: for receiving game states
        this.onProjectilesReceived = null; // NEW: for receiving projectiles
        this.onDamageReceived = null; // NEW: for receiving damage
        // Additional callbacks used by main.js
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onPlayerData = null;
        this.onProjectileFired = null;
        this.onWeaponPickupSpawn = null; // NEW: Callback for spawning pickups

        // Max players in a match
        this.maxPlayers = 6;
    }

    // Initialize PeerJS with explicit configuration for better compatibility
    init() {
        // No P2P used; just return localId
        return Promise.resolve(this.localId);
    }

    // Host a new game
    async hostGame() {
        console.log('[Multiplayer] hostGame called');
        
        // Wait for matchmaker connection if not connected
        if (!this.matchmaker || !this.matchmaker.ws || this.matchmaker.ws.readyState !== WebSocket.OPEN) {
            console.log('[Multiplayer] Matchmaker not connected, attempting to connect...');
            try {
                await this.waitForMatchmakerConnection();
            } catch (error) {
                console.log('[Multiplayer] Failed to connect to matchmaker:', error);
                throw new Error('Failed to connect to matchmaker: ' + error.message);
            }
        }
        
        if (!this.matchmaker || !this.matchmaker.ws) {
            console.log('[Multiplayer] Matchmaker not connected');
            throw new Error('Matchmaker not connected. Please check your internet connection and try again.');
        }
        
        this.isHost = true;
        const roomId = `room_${Date.now().toString(36)}`;
        console.log('[Multiplayer] Generated room ID:', roomId);
        this.roomCode = roomId;
        this.players = [{ id: this.localId, name: this.localPlayerName || 'Host', isHost: true }];
        
        // Create a promise to wait for HOST_ROOM_ACK
        return new Promise((resolve, reject) => {
            console.log('[Multiplayer] Creating promise to wait for HOST_ROOM_ACK');
            // Set up temporary handler for HOST_ROOM_ACK
            const originalHandler = this.handleData;
            let ackReceived = false;
            let retryInterval = null;
            
            // Create a wrapper function to ensure proper handling
            const tempHandler = (data) => {
                console.log(`[Multiplayer] Handling message in tempHandler: ${data.type}`, data);
                
                if (data.type === 'HOST_ROOM_ACK') {
                    console.log('[Multiplayer] Received HOST_ROOM_ACK in tempHandler, room created successfully');
                    ackReceived = true;
                    // Stop retrying
                    if (retryInterval) clearInterval(retryInterval);
                    
                    // Restore original handler immediately
                    this.handleData = originalHandler;
                    try {
                        // Call original handler for this message
                        originalHandler.call(this, data);
                    } catch (e) {
                        console.error('[Multiplayer] Error calling original handler:', e);
                    }
                    resolve(roomId);
                    return;
                }
                
                // Handle errors
                if (data.type === 'ERROR') {
                    console.log('[Multiplayer] Received ERROR during hostGame:', data.message);
                    ackReceived = true;
                    if (retryInterval) clearInterval(retryInterval);
                    
                    // Restore original handler immediately
                    this.handleData = originalHandler;
                    reject(new Error(data.message || 'Failed to create room. Please try again.'));
                    return;
                }
                
                // Call original handler for other messages
                try {
                    originalHandler.call(this, data);
                } catch (e) {
                    console.error('[Multiplayer] Error calling original handler for other message:', e);
                }
            };
            
            // Set the temporary handler
            this.handleData = tempHandler;
            
            const sendHostRequest = () => {
                 if (ackReceived) return;
                 console.log('[Multiplayer] Sending HOST_ROOM message to matchmaker...');
                 try {
                     this.matchmaker.send({ type: 'HOST_ROOM', roomId: roomId, peerId: this.localId, meta: { name: this.localPlayerName, avatar: this.localAvatar || null } });
                 } catch (e) {
                     console.warn('[Multiplayer] Failed to send HOST_ROOM, will retry.', e);
                 }
            };

            // Send immediately
            setTimeout(sendHostRequest, 10);
            
            // RETRY MECHANISM: Retry every 3 seconds if no ACK received (handles packet loss/server wake up)
            retryInterval = setInterval(() => {
                if (!ackReceived) {
                    console.log('[Multiplayer] Retrying HOST_ROOM request...');
                    sendHostRequest();
                }
            }, 3000);
            
            // Set timeout - increased for itch.io deployment and Render cold starts
            setTimeout(() => {
                if (!ackReceived) {
                    console.log('[Multiplayer] HOST_ROOM_ACK timeout');
                    if (retryInterval) clearInterval(retryInterval);
                    // Restore original handler
                    this.handleData = originalHandler;
                    reject(new Error('Timeout waiting for room creation confirmation. The server may be busy or unreachable. Please try again.'));
                }
            }, 15000); // Increased timeout to 15 seconds
        });
    }
    // Join existing game
    async joinGame(roomCode) {
        await this.init();
        this.isHost = false;
        roomCode = (roomCode || '').trim();
        if (!roomCode) throw new Error('Please enter a room code');
        console.log(`[Multiplayer] Joining via server relay room ${roomCode}`);
        
        // Wait for matchmaker connection if not connected
        if (!this.matchmaker || !this.matchmaker.ws || this.matchmaker.ws.readyState !== WebSocket.OPEN) {
            console.log('[Multiplayer] Matchmaker not connected, attempting to connect...');
            try {
                await this.waitForMatchmakerConnection();
            } catch (error) {
                console.log('[Multiplayer] Failed to connect to matchmaker:', error);
                throw new Error('Failed to connect to matchmaker: ' + error.message);
            }
        }
        
        if (!this.matchmaker || !this.matchmaker.ws) throw new Error('Matchmaker not connected');
        this.roomCode = roomCode;

        // Create a promise to handle the join process
        return new Promise((resolve, reject) => {
            let playerListReceived = false;
            let errorReceived = false;
            
            // Store original handler
            const originalHandler = this.handleData;
            
            // Override handler to capture PLAYER_LIST or ERROR
            this.handleData = (data) => {
                console.log(`[Multiplayer] Handling message in joinGame: ${data.type}`, data);
                
                if (data.type === 'PLAYER_LIST') {
                    console.log('[Multiplayer] Received PLAYER_LIST in joinGame:', data.players);
                    playerListReceived = true;
                    // Restore original handler
                    this.handleData = originalHandler;
                    // Call original handler for this message
                    originalHandler.call(this, data);
                    resolve(true);
                    return;
                }
                
                if (data.type === 'ERROR') {
                    console.log('[Multiplayer] Received ERROR in joinGame:', data.message);
                    errorReceived = true;
                    // Restore original handler
                    this.handleData = originalHandler;
                    // Call original handler for this message
                    originalHandler.call(this, data);
                    reject(new Error(data.message || 'Failed to join room'));
                    return;
                }
                
                // Call original handler for other messages
                originalHandler.call(this, data);
            };

            const sendJoin = () => {
                try {
                    console.log(`[Multiplayer] Sending JOIN_ROOM request for room: ${roomCode}`);
                    this.matchmaker.send({ type: 'JOIN_ROOM', roomId: roomCode, peerId: this.localId, meta: { name: this.localPlayerName, avatar: this.localAvatar || null } });
                } catch (e) {
                    console.warn('[Multiplayer] Failed to send JOIN_ROOM, will retry if pending', e);
                }
            };

            // initial attempt
            sendJoin();

            // retry once after 2s if still pending
            this._joinRetryTimer1 = setTimeout(() => {
                if (!playerListReceived && !errorReceived) {
                    console.log('[Multiplayer] No PLAYER_LIST yet, retrying JOIN_ROOM...');
                    sendJoin();
                }
            }, 2000);

            // retry again after 5s if still pending
            this._joinRetryTimer2 = setTimeout(() => {
                if (!playerListReceived && !errorReceived) {
                    console.log('[Multiplayer] Still pending, retrying JOIN_ROOM again...');
                    sendJoin();
                }
            }, 5000);

            // overall timeout
            setTimeout(() => {
                if (!playerListReceived && !errorReceived) {
                    console.log('[Multiplayer] Join timeout reached, rejecting promise');
                    // Restore original handler
                    this.handleData = originalHandler;
                    if (this._joinRetryTimer1) { clearTimeout(this._joinRetryTimer1); this._joinRetryTimer1 = null; }
                    if (this._joinRetryTimer2) { clearTimeout(this._joinRetryTimer2); this._joinRetryTimer2 = null; }
                    reject(new Error('Join timeout - room may not exist or server is not responding'));
                }
            }, 25000);
        });
    }

    // Handle messages coming from the matchmaker/relay server (Render)
    handleData(data) {
        console.log(`[Multiplayer] Received message in handleData: ${data.type}`, data);
        if (!data || !data.type) {
            console.log('[Multiplayer] Invalid message data, returning early');
            return;
        }

        switch (data.type) {
            case 'HOST_ROOM_ACK': {
                console.log('[Multiplayer] Processing HOST_ROOM_ACK in handleData:', data);
                // Host confirmation; ensure our roomCode is set
                if (data.roomId) this.roomCode = data.roomId;
                console.log('[Multiplayer] HOST_ROOM_ACK processed, roomCode set to:', this.roomCode);
                break;
            }

            case 'PLAYER_LIST': {
                console.log('[Multiplayer] Received PLAYER_LIST:', data.players);
                // Normalize player list and remove duplicates
                const byId = new Map();
                for (const p of (data.players || [])) {
                    if (!p || !p.id) continue;
                    byId.set(p.id, p);
                }
                this.players = Array.from(byId.values());
                if (this.onPlayerUpdate) this.onPlayerUpdate(this.players);
                // Resolve pending join promise if waiting
                if (this._joinResolve) { 
                    console.log('[Multiplayer] Resolving join promise with PLAYER_LIST');
                    this._joinResolve(true); 
                    this._joinResolve = null; 
                }
                break;
            }

            case 'PLAYER_JOINED': {
                if (data.player && data.player.id && !this.players.some(p => p.id === data.player.id)) {
                    this.players.push(data.player);
                }
                if (this.onPlayerUpdate) this.onPlayerUpdate(this.players);
                if (this.onPlayerJoined) this.onPlayerJoined(data.player);
                break;
            }

            case 'PLAYER_LEFT': {
                if (data.playerId) this.removePlayer(data.playerId);
                break;
            }

            case 'START_GAME': {
                if (this.onGameStart) this.onGameStart(data.settings || {});
                break;
            }

            case 'GAME_STATE': {
                if (this.onGameStateUpdate) this.onGameStateUpdate(data.playerId, data.player);
                if (this.onPlayerData) this.onPlayerData(Object.assign({ id: data.playerId }, data.player));
                break;
            }

            case 'PROJECTILES': {
                if (this.onProjectilesReceived) this.onProjectilesReceived(data.playerId, data.projectiles);
                if (this.onProjectileFired && Array.isArray(data.projectiles)) {
                    data.projectiles.forEach(p => {
                        this.onProjectileFired({
                            id: p.id || `${data.playerId}_${Date.now()}`,
                            x: p.x, y: p.y, vx: p.vx, vy: p.vy,
                            angle: p.angle || Math.atan2(p.vy || 0, p.vx || 1),
                            ownerId: p.ownerId || data.playerId, // Use the actual owner ID if available
                            weaponId: p.weaponId || p.weapon || null,
                            color: p.color || null
                        });
                    });
                }
                break;
            }

            case 'DAMAGE': {
                if (this.onDamageReceived) this.onDamageReceived(data);
                break;
            }

            case 'PLAYER_DEATH': {
                if (this.onPlayerDeath) this.onPlayerDeath(data.victimId, data.killerId);
                break;
            }

            case 'SPAWN_PICKUP': {
                if (this.onWeaponPickupSpawn) this.onWeaponPickupSpawn(data.pickup);
                break;
            }

            case 'MATCH_TIMER': {
                if (!this.isHost && typeof data.timeLeft === 'number' && this.game) {
                    this.game.matchTimeLeft = data.timeLeft;
                    this.game.matchTimerActive = true;
                }
                break;
            }
            
            case 'PLAY_SOUND': {
                if (this.onPlaySound) this.onPlaySound(data.sound, data.volume);
                break;
            }

            case 'ERROR': {
                console.log('[Multiplayer] Received ERROR from server:', data.message);
                // Relay error from server (e.g., room not found) to pending join
                if (this._joinReject) {
                    this._joinReject(new Error(data.message || 'Server error'));
                }
                break;
            }
        }
    }

    broadcast(data) {
        for (let conn of this.connections) {
            if (conn.open) {
                conn.send(data);
            }
        }
    }

    startGame(settings = {}) {
        if (!this.isHost) return;

        const data = {
            type: 'START_GAME',
            roomId: this.roomCode,
            settings
        };

        if (this.useServer && this.matchmaker && this.matchmaker.ws) {
            this.matchmaker.send(data);
        } else {
            this.broadcast({ type: 'START_GAME', settings });
        }

        if (this.onGameStart) {
            this.onGameStart(settings);
        }
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        this.connections = this.connections.filter(c => c.peer !== playerId);

        if (this.onPlayerUpdate) {
            this.onPlayerUpdate(this.players);
        }

        // Notify remaining players
        this.broadcast({ type: 'PLAYER_LEFT', playerId });
        if (this.onPlayerLeft) {
            this.onPlayerLeft(playerId);
        }
    }

    // NEW: Send game state update to all connected players
    sendGameState(playerData) {
        const data = {
            type: 'GAME_STATE',
            playerId: this.useServer ? this.localId : this.peerId,
            roomId: this.roomCode,
            player: playerData
        };

        if (this.useServer && this.matchmaker && this.matchmaker.ws) {
            this.matchmaker.send(data);
            return;
        }

        if (!this.peer) return;
        this.broadcast(data);
        if (this.isHost) {
            console.log('[Multiplayer] Host broadcasting game state to', this.connections.length, 'peers');
        } else {
            console.log('[Multiplayer] Client sending game state to host');
        }
    }

    // NEW: Send projectile spawn event
    sendProjectiles(projectiles) {
        const projectileData = projectiles.map(p => ({
            id: p.id || null,
            x: p.x,
            y: p.y,
            vx: p.vx,
            vy: p.vy,
            angle: p.angle || Math.atan2(p.vy || 0, p.vx || 1),
            weaponId: p.weaponId || p.weapon || null,
            damage: p.damage,
            radius: p.radius,
            color: p.color,
            // Include owner information
            ownerId: p.owner ? p.owner.id : null
        }));

        const data = {
            type: 'PROJECTILES',
            playerId: this.useServer ? this.localId : this.peerId,
            roomId: this.roomCode,
            projectiles: projectileData
        };

        if (this.useServer && this.matchmaker && this.matchmaker.ws) {
            this.matchmaker.send(data);
            return;
        }

        if (!this.peer) return;
        this.broadcast(data);
    }

    // Send damage notification to specific player
    sendDamage(targetId, damage) {
        if (this.useServer && this.matchmaker && this.matchmaker.ws) {
            this.matchmaker.send({ type: 'DAMAGE', roomId: this.roomCode, playerId: this.localId, targetId, damage, timestamp: Date.now() });
            return;
        }
        if (!this.peer) return;
        const conn = this.connections.find(c => c.peer === targetId);
        if (conn) {
            conn.send({
                type: 'DAMAGE',
                damage: damage,
                attackerId: this.peerId,
                timestamp: Date.now()
            });
        }
    }

    sendPlayerDeath(killerId) {
        if (this.useServer && this.matchmaker && this.matchmaker.ws) {
            this.matchmaker.send({ type: 'PLAYER_DEATH', roomId: this.roomCode, victimId: this.localId, killerId });
            return;
        }
        if (!this.peer) return;
        this.broadcast({ type: 'PLAYER_DEATH', victimId: this.peerId, killerId: killerId });
    }

    sendWeaponPickup(pickupData) {
        if (this.useServer && this.matchmaker && this.matchmaker.ws) {
            this.matchmaker.send({ type: 'SPAWN_PICKUP', roomId: this.roomCode, pickup: pickupData });
            return;
        }
        if (!this.peer) return;
        this.broadcast({ type: 'SPAWN_PICKUP', pickup: pickupData });
    }

    disconnect() {
        if (this.useServer && this.matchmaker && this.roomCode) {
            try { this.matchmaker.send({ type: 'LEAVE_ROOM', roomId: this.roomCode, peerId: this.localId }); } catch (e) {}
            this.roomCode = null;
            this.players = [];
            this.connections = [];
            return;
        }
        for (let conn of this.connections) {
            conn.close();
        }
        this.connections = [];
        this.players = [];
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }

    generateRoomCode() {
        // Generate a unique 6-character room code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Get full room code for copying
    getFullCode() {
        return this.roomCode || '';
    }

    // Simplified display code (first 8 chars)
    getDisplayCode() {
        if (!this.roomCode) return '--------';
        // Show first 8 characters for display
        return this.roomCode.substring(0, 8).toUpperCase() + '...';
    }

    sendMatchTimer(timeLeft) {
        if (this.useServer && this.matchmaker && this.isHost) {
            this.matchmaker.send({ type: 'MATCH_TIMER', roomId: this.roomCode, timeLeft });
            return;
        }
        if (!this.peer || !this.isHost) return;
        this.broadcast({ type: 'MATCH_TIMER', timeLeft: timeLeft });
    }

    // NEW: Send sound event to other players
    sendSound(sound, volume = 0.5) {
        if (this.useServer && this.matchmaker) {
            this.matchmaker.send({ 
                type: 'PLAY_SOUND', 
                roomId: this.roomCode, 
                playerId: this.useServer ? this.localId : this.peerId,
                sound: sound,
                volume: volume
            });
            return;
        }
        if (!this.peer) return;
        this.broadcast({ 
            type: 'PLAY_SOUND', 
            playerId: this.peerId,
            sound: sound,
            volume: volume
        });
    }

    // Helper method to wait for matchmaker connection
    waitForMatchmakerConnection() {
        return new Promise((resolve, reject) => {
            if (!this.matchmaker) {
                reject(new Error('Matchmaker not initialized'));
                return;
            }
            
            // If already connected, resolve immediately
            if (this.matchmaker.ws && this.matchmaker.ws.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }
            
            // Try to connect if not already connecting
            if (!this.matchmaker.ws || this.matchmaker.ws.readyState !== WebSocket.CONNECTING) {
                this.matchmaker.connect();
            }
            
            // Set up connection listeners
            const onConnected = () => {
                console.log('[Multiplayer] Matchmaker connected successfully');
                cleanup();
                resolve();
            };
            
            const onDisconnected = () => {
                console.log('[Multiplayer] Matchmaker disconnected during connection wait');
                cleanup();
                reject(new Error('Matchmaker disconnected'));
            };
            
            const onError = (error) => {
                console.log('[Multiplayer] Matchmaker connection error:', error);
                cleanup();
                reject(new Error('Matchmaker connection error: ' + error.message));
            };
            
            // Clean up listeners
            const cleanup = () => {
                if (this.matchmaker) {
                    this.matchmaker.onConnected = null;
                    this.matchmaker.onDisconnected = null;
                }
            };
            
            // Set up temporary listeners
            this.matchmaker.onConnected = onConnected;
            this.matchmaker.onDisconnected = onDisconnected;
            
            // Set timeout
            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('Matchmaker connection timeout'));
            }, 5000); // 5 second timeout
            
            // Clean up timeout in cleanup function
            const originalCleanup = cleanup;
            cleanup = () => {
                clearTimeout(timeout);
                originalCleanup();
            };
        });
    }
}