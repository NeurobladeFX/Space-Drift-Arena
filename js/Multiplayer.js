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
        if (!this.matchmaker || !this.matchmaker.ws) throw new Error('Matchmaker not connected');
        this.isHost = true;
        const roomId = `room_${Date.now().toString(36)}`;
        this.roomCode = roomId;
        this.players = [{ id: this.localId, name: this.localPlayerName || 'Host', isHost: true }];
        // Inform server to create room
        this.matchmaker.send({ type: 'HOST_ROOM', roomId: roomId, peerId: this.localId, meta: { name: this.localPlayerName, avatar: this.localAvatar || null } });
        console.log('[Multiplayer] Hosting room via server:', roomId);
        return roomId;
    }

    // Join existing game
    async joinGame(roomCode) {
        await this.init();
        this.isHost = false;
        roomCode = (roomCode || '').trim();
        if (!roomCode) throw new Error('Please enter a room code');
        console.log(`[Multiplayer] Joining via server relay room ${roomCode}`);
        if (!this.matchmaker || !this.matchmaker.ws) throw new Error('Matchmaker not connected');
        this.roomCode = roomCode;
        this.matchmaker.send({ type: 'JOIN_ROOM', roomId: roomCode, peerId: this.localId, meta: { name: this.localPlayerName, avatar: this.localAvatar || null } });
        return new Promise((resolve, reject) => {
            this._joinResolve = (ok) => {
                this._joinResolve = null;
                if (ok) resolve(true); else reject(new Error('Join failed'));
            };
            setTimeout(() => {
                if (this._joinResolve) {
                    this._joinResolve = null;
                    reject(new Error('Join timeout'));
                }
            }, 15000);
        });
    }

    // Handle messages coming from the matchmaker/relay server (Render)
    handleData(data) {
        if (!data || !data.type) return;

        switch (data.type) {
            case 'PLAYER_LIST': {
                // Normalize player list and remove duplicates
                const byId = new Map();
                for (const p of (data.players || [])) {
                    if (!p || !p.id) continue;
                    byId.set(p.id, p);
                }
                this.players = Array.from(byId.values());
                if (this.onPlayerUpdate) this.onPlayerUpdate(this.players);
                // Resolve pending join promise if waiting
                if (this._joinResolve) { this._joinResolve(true); this._joinResolve = null; }
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
                            owner: data.playerId,
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
            color: p.color
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
}
