export class Multiplayer {
    constructor(game) {
        this.game = game;
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

    // Initialize PeerJS
    init() {
        return new Promise((resolve, reject) => {
            this.peer = new Peer();

            this.peer.on('open', (id) => {
                this.peerId = id;
                console.log('Peer ID:', id);
                resolve(id);
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                reject(err);
            });
        });
    }

    // Host a new game
    async hostGame() {
        if (!this.peer) {
            await this.init();
        }

        this.isHost = true;
        this.roomCode = this.generateRoomCode();
        this.players = [{ id: this.peerId, name: this.localPlayerName || 'Host', isHost: true }];

        // Listen for incoming connections
        this.peer.on('connection', (conn) => {
            this.handleIncomingConnection(conn);
        });

        console.log('[Multiplayer] Hosting game with room code:', this.roomCode);
        return this.roomCode;
    }

    // Join existing game
    async joinGame(roomCode) {
        if (!this.peer) {
            await this.init();
        }

        this.isHost = false;

        // Clean up the room code (remove spaces, convert to uppercase)
        roomCode = roomCode.trim().toUpperCase();

        if (!roomCode) {
            throw new Error('Please enter a room code');
        }

        // Validate room code format (6 characters, alphanumeric)
        if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
            throw new Error('Invalid room code format. Room code should be 6 alphanumeric characters.');
        }

        console.log(`[Multiplayer] Trying to join room ${roomCode}`);

        // In a proper implementation, we would contact the matchmaking server
        // to resolve the room code to a peer ID. For now, we'll assume the 
        // room code IS the host's peer ID for simplicity.
        // 
        // IMPORTANT: For this to work, the host must:
        // 1. Have created a game room
        // 2. Be currently online and connected to PeerJS
        // 3. Have the same PeerJS server configuration
        
        const hostPeerId = roomCode;

        try {
            console.log(`[Multiplayer] Attempting to connect to peer ${hostPeerId} for room ${roomCode}`);
            
            // Connect to host using peer ID
            const conn = this.peer.connect(hostPeerId, {
                reliable: true
            });

            return new Promise((resolve, reject) => {
                let connectionTimeout;

                conn.on('open', () => {
                    clearTimeout(connectionTimeout);
                    console.log('[Multiplayer] Successfully connected to host!');
                    this.handleHostConnection(conn);
                    resolve(true);
                });

                conn.on('error', (err) => {
                    clearTimeout(connectionTimeout);
                    console.error('[Multiplayer] Connection error:', err);
                    console.error('[Multiplayer] Full error details:', {
                        type: err.type,
                        message: err.message
                    });
                    
                    // Provide specific error messages based on error type
                    let errorMsg = 'Failed to connect to room.';
                    if (err.type === 'peer-unavailable') {
                        errorMsg = `Room "${roomCode}" not found. Please check that:\n1. The room code is correct\n2. The host is still online\n3. Both players are using the same server`;
                    } else if (err.type === 'network') {
                        errorMsg = 'Network error. Please check your internet connection.';
                    } else {
                        errorMsg = `Connection failed: ${err.message}`;
                    }
                    
                    reject(new Error(errorMsg));
                });

                // Timeout after 15 seconds with a clearer message
                connectionTimeout = setTimeout(() => {
                    if (!conn.open) {
                        conn.close();
                        console.error(`[Multiplayer] Connection timeout after 15 seconds. Could not reach peer ${hostPeerId}`);
                        reject(new Error(`Connection timeout. Host may be offline or unreachable. Please check that:\n1. The room code "${roomCode}" is correct\n2. The host is still online\n3. Both players can access the matchmaking server`));
                    }
                }, 15000);
            });
        } catch (err) {
            console.error('[Multiplayer] Join error:', err);
            throw new Error(`Failed to join room: ${err.message}`);
        }
    }

    handleIncomingConnection(conn) {
        console.log('New player connected:', conn.peer);

        conn.on('open', () => {
            this.connections.push(conn);

            // Send current player list
            conn.send({
                type: 'PLAYER_LIST',
                players: this.players
            });
            // Send host's player data to the newly connected player
            conn.send({
                type: 'PLAYER_JOINED',
                player: {
                    id: this.peerId,
                    name: this.localPlayerName || 'Host',
                    isHost: true,
                    characterId: this.game.shop.getEquippedCharacter(), // Sync character ID in game state
                    aimAngle: this.game.player ? this.game.player.angle : 0,
                    weapon: this.game.player ? this.game.player.weapon : 'pistol',
                    avatar: (this.game.player && this.game.player.avatar) || null,
                    color: this.game.player ? this.game.player.color : '#FFFFFF'
                }
            });
        });

        conn.on('data', (data) => {
            this.handleData(data, conn);
        });

        conn.on('close', () => {
            console.log('Player disconnected:', conn.peer);
            this.removePlayer(conn.peer);
        });
    }

    handleHostConnection(conn) {
        console.log('Connected to host');
        this.connections = [conn];

        conn.on('data', (data) => {
            this.handleData(data, conn);
        });

        conn.on('close', () => {
            console.log('Disconnected from host');
            alert('Connection to host lost');
        });

        // Send join request
        conn.send({
            type: 'JOIN_REQUEST',
            playerId: this.peerId,
            playerName: this.localPlayerName || 'Player',
            characterId: this.game.shop.getEquippedCharacter() // Send equipped character ID
        });
    }

    handleData(data, conn) {
        const uniqueById = (arr) => {
            const seen = new Set();
            return arr.filter(p => {
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
            });
        };

        switch (data.type) {
            case 'JOIN_REQUEST':
                if (this.isHost && this.players.length < this.maxPlayers) {
                    const newPlayer = {
                        id: data.playerId,
                        name: data.playerName,
                        characterId: data.characterId || 'default_soldier', // Sync character ID
                        isHost: false,
                        x: 400, // Default spawn position
                        y: 300,
                        hp: 100,
                        alive: true,
                        weapon: 'pistol',
                        ammo: Infinity
                    };
                    
                    // Prevent duplicates
                    const existingPlayerIndex = this.players.findIndex(p => p.id === newPlayer.id);
                    if (existingPlayerIndex !== -1) {
                        // Update existing player
                        this.players[existingPlayerIndex] = newPlayer;
                        console.log('[Multiplayer] Updated existing player:', newPlayer.id);
                    } else {
                        // Add new player
                        this.players.push(newPlayer);
                        console.log('[Multiplayer] Added new player:', newPlayer.id);
                    }

                    // Notify all players about the new player
                    this.broadcast({ type: 'PLAYER_JOINED', player: newPlayer });

                    // Send updated player list to the newly joined player
                    if (conn && conn.open) {
                        conn.send({
                            type: 'PLAYER_LIST',
                            players: this.players
                        });
                    }

                    // Update UI
                    if (this.onPlayerUpdate) {
                        this.onPlayerUpdate(this.players);
                    }
                    
                    // Notify runtime listeners about new player
                    if (this.onPlayerJoined) {
                        this.onPlayerJoined(newPlayer);
                    }
                    
                    console.log('[Multiplayer] Player joined. Total players:', this.players.length);
                } else if (this.players.length >= this.maxPlayers) {
                    // Send error to client if room is full
                    if (conn && conn.open) {
                        conn.send({ type: 'ERROR', message: 'Room is full' });
                    }
                }
                break;

            case 'PLAYER_LIST':
                // Normalize player list and remove duplicates
                this.players = uniqueById(data.players);
                if (this.onPlayerUpdate) {
                    this.onPlayerUpdate(this.players);
                }
                break;

            case 'PLAYER_JOINED':
                // Check if player already exists
                if (!this.players.some(p => p.id === data.player.id)) {
                    this.players.push(data.player);
                }
                if (this.onPlayerUpdate) {
                    this.onPlayerUpdate(this.players);
                }
                if (this.onPlayerJoined) {
                    this.onPlayerJoined(data.player);
                }
                break;

            case 'START_GAME':
                if (this.onGameStart) {
                    this.onGameStart(data.settings || {});
                }
                break;

            case 'GAME_STATE':
                // Receive other player's game state
                if (this.onGameStateUpdate) {
                    this.onGameStateUpdate(data.playerId, data.player);
                }
                
                // Backwards-compatible hook used by main.js
                if (this.onPlayerData) {
                    // Fix: Access remotePlayers object instead of non-existent players array
                    const player = this.game.remotePlayers ? this.game.remotePlayers[data.playerId] : null;
                    const playerData = data.player;
                    if (player) {
                        if (playerData.x !== undefined) player.x = playerData.x;
                        if (playerData.y !== undefined) player.y = playerData.y;
                        if (playerData.vx !== undefined) player.vx = playerData.vx;
                        if (playerData.vy !== undefined) player.vy = playerData.vy;
                        if (playerData.angle !== undefined) player.angle = playerData.angle;
                        if (playerData.aimAngle !== undefined) player.aimAngle = playerData.aimAngle; // Sync aim angle
                        if (playerData.hp !== undefined) player.hp = playerData.hp;
                        if (playerData.alive !== undefined) player.alive = playerData.alive;
                        if (playerData.weapon) player.weapon = playerData.weapon;
                        if (playerData.ammo !== undefined) player.ammo = playerData.ammo;
                        if (playerData.name) player.name = playerData.name;
                        if (playerData.avatar) player.avatar = playerData.avatar;
                        if (playerData.characterId && player.characterId !== playerData.characterId) {
                            player.characterId = playerData.characterId;
                            this.loadCharacterSprite(player); // Load the correct sprite
                        }
                    }
                    this.onPlayerData(Object.assign({ id: data.playerId }, data.player));
                }
                
                // If we're host, forward this game state to all other connected peers
                if (this.isHost) {
                    this.broadcast({ type: 'GAME_STATE', playerId: data.playerId, player: data.player });
                }
                break;

            case 'PROJECTILES':
                // Receive projectile spawn from other player
                if (this.onProjectilesReceived) {
                    this.onProjectilesReceived(data.playerId, data.projectiles);
                }
                if (this.onProjectileFired) {
                    // Convert to a compatible payload for older handlers
                    data.projectiles.forEach(p => {
                        this.onProjectileFired({
                            id: p.id || `${data.playerId}_${Date.now()}`,
                            x: p.x,
                            y: p.y,
                            vx: p.vx,
                            vy: p.vy,
                            angle: p.angle || Math.atan2(p.vy || 0, p.vx || 1),
                            owner: data.playerId,
                            weaponId: p.weaponId || p.weapon || null,
                            color: p.color || null
                        });
                    });
                }
                // If host, forward projectile spawns to all connected peers
                if (this.isHost) {
                    this.broadcast({ type: 'PROJECTILES', playerId: data.playerId, projectiles: data.projectiles });
                }
                break;

            case 'DAMAGE':
                // Receive damage
                if (this.onDamageReceived) {
                    this.onDamageReceived(data);
                }
                break;

            case 'PLAYER_DEATH':
                // Handle remote player death event
                const { killerId, victimId } = data;

                // Update victim status locally if they exist
                if (this.game && this.game.remotePlayers[victimId]) {
                    this.game.remotePlayers[victimId].alive = false;
                }

                // If WE are the killer, update our stats
                if (killerId === this.peerId) {
                    console.log('👑 I killed a player!');
                    if (this.game && this.game.player) {
                        this.game.player.kills++;
                        // Save stats
                        if (this.game.shop) {
                            this.game.shop.updateStats(1, 0, false, false);
                        }
                    }
                }
                // If someone else was the killer, update their kill count in our view
                else if (this.game && this.game.remotePlayers[killerId]) {
                    this.game.remotePlayers[killerId].kills = (this.game.remotePlayers[killerId].kills || 0) + 1;
                }

                // Trigger callback if needed
                if (this.onPlayerDeath) {
                    this.onPlayerDeath(victimId, killerId);
                }
                break;

            case 'SPAWN_PICKUP':
                if (this.onWeaponPickupSpawn) {
                    this.onWeaponPickupSpawn(data.pickup);
                }
                break;

            case 'INPUT':
                // Handle player input (host processes this)
                break;

            case 'MATCH_TIMER':
                // Update local timer from host
                if (!this.isHost && typeof data.timeLeft === 'number') {
                    // Directly update game timer
                    if (this.game) {
                        this.game.matchTimeLeft = data.timeLeft;
                        this.game.matchTimerActive = true;
                    }
                }
                break;
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

        this.broadcast({ type: 'START_GAME', settings });

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
        if (!this.peer) return;

        const data = {
            type: 'GAME_STATE',
            playerId: this.peerId,
            player: playerData
        };

        this.broadcast(data);
        
        // Log for debugging
        if (this.isHost) {
            console.log('[Multiplayer] Host broadcasting game state to', this.connections.length, 'peers');
        } else {
            console.log('[Multiplayer] Client sending game state to host');
        }
    }

    // NEW: Send projectile spawn event
    sendProjectiles(projectiles) {
        if (!this.peer) return;

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
            color: p.color
        }));

        const data = {
            type: 'PROJECTILES',
            playerId: this.peerId,
            projectiles: projectileData
        };

        this.broadcast(data);
    }

    // Send damage notification to specific player
    sendDamage(targetId, damage) {
        if (!this.peer) return;
        const conn = this.connections.find(c => c.peer === targetId);
        if (conn) {
            conn.send({
                type: 'DAMAGE',
                damage: damage,
                attackerId: this.peerId, // Send who attacked
                timestamp: Date.now()
            });
        }
    }

    sendPlayerDeath(killerId) {
        if (!this.peer) return;
        this.broadcast({
            type: 'PLAYER_DEATH',
            victimId: this.peerId,
            killerId: killerId
        });
    }

    sendWeaponPickup(pickupData) {
        if (!this.peer) return;
        this.broadcast({
            type: 'SPAWN_PICKUP',
            pickup: pickupData
        });
    }

    disconnect() {
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
        if (!this.peer || !this.isHost) return;
        this.broadcast({
            type: 'MATCH_TIMER',
            timeLeft: timeLeft
        });
    }
}
