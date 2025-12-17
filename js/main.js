import { GAME_CONFIG, SPAWN_POINTS, WEAPONS, COLORS } from './config.js';
import { Player } from './Player.js';
import { BotAI } from './BotAI.js';
import { Camera } from './Camera.js';
import { Map } from './Map.js';
import { Input } from './Input.js';
import { UI } from './UI.js';
import { Multiplayer } from './Multiplayer.js';
import { Shop } from './Shop.js';
import { Matchmaker } from './Matchmaker.js';
import { Projectile } from './Projectile.js';
import { checkCircleCollision, randomChoice } from './physics.js';
import { WeaponPickup } from './WeaponPickup.js';
import { SoundManager } from './SoundManager.js';

class Game {
    constructor() {
        // Game systems
        this.shop = new Shop();
        this.ui = new UI(); // UI handles profile updates
        this.gameCanvas = document.getElementById('gameCanvas');
        this.soundManager = new SoundManager(); // Initialize Sound Manager

        // Debug flags
        this._canvasSizeLogged = false;
        // Initialize camera first
        this.camera = new Camera(window.innerWidth, window.innerHeight); // Use Camera class instead of simple object
        this.input = new Input(this.gameCanvas, this.camera); // Pass canvas and camera to Input constructor
        this.multiplayer = new Multiplayer(this); // Pass game instance to multiplayer
        // ensure multiplayer has local player name
        this.multiplayer.localPlayerName = this.shop.getProfile().name || 'Player';
        this.map = new Map(); // Initialize the map
        this.remotePlayers = {};

        // Matchmaker (connects to server dynamically based on environment)
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        // For local development, use ws://localhost:3000
        // For production deployment on Render, use wss://space-drift-arena.onrender.com (standard port 443)
        const matchmakerUrl = isLocal ? 'ws://localhost:3000' : 'wss://space-drift-arena.onrender.com';
        // Ensure HTTPS submissions when running on itch.io or any HTTPS host
        this.serverBase = isLocal ? 'http://localhost:3000' : 'https://space-drift-arena.onrender.com';        
        // Diagnostic logging for deployment troubleshooting
        console.log('[Main] Deployment diagnostics:');
        console.log('[Main]  - window.location.hostname:', window.location.hostname);
        console.log('[Main]  - isLocal:', isLocal);
        console.log('[Main]  - matchmakerUrl:', matchmakerUrl);
        console.log('[Main]  - serverBase:', this.serverBase);
        
        this.matchmaker = new Matchmaker(matchmakerUrl, this.multiplayer, this.ui);        // Use server-mediated multiplayer rather than P2P when matchmaker is present
        this.multiplayer.useServer = true;
        this.multiplayer.matchmaker = this.matchmaker;

        // Connect matchmaker socket early (needed for server-mediated rooms)
        try { 
            console.log('[Main] Connecting to matchmaker at:', matchmakerUrl);
            this.matchmaker.connect(); 
        } catch (e) { 
            console.warn('[Main] Matchmaker connect failed', e); 
            this.ui.showJoinError('Failed to connect to matchmaker service. Please check your internet connection.');
        }

        // Initialize Peer early so we can register with matchmaker
        this.multiplayer.init().then(id => {
            console.log('[Main] Peer initialized:', id);
            this.matchmaker.setPeerId(id);
        }).catch(err => console.error('Peer init failed', err));

        // Set up profile click handler
        document.getElementById('inGameProfile').addEventListener('click', () => {
            this.ui.showProfile();
        });

        // UI callbacks
        this.ui.onPlayClick = (mode) => {
            // Show mode selection screen instead of starting game directly
            this.ui.showModeSelection();
        };

        this.ui.onStartGame = (mode) => {
            console.log(`ðŸŽ® Starting game in ${mode} mode`);
            this.gameMode = mode;
            this.initializeGame();
        };
        this.ui.onHostClick = async () => {
            try {
                this.gameMode = 'multiplayer';
                // Add small delay to account for iframe load timing issues on itch.io
                await new Promise(resolve => setTimeout(resolve, 500));
                const roomCode = await this.multiplayer.hostGame();
                this.ui.showHostLobby(roomCode);
            } catch (error) {
                console.error('Failed to host game:', error);
                this.ui.showJoinError('Failed to host game: ' + error.message);
            }
        };
        this.ui.onJoinRoomClick = async (code) => {
            try {
                this.gameMode = 'multiplayer';
                console.log(`[Main] Attempting to join room with code: ${code}`);
                await this.multiplayer.joinGame(code);
                // Show host lobby view as a waiting room for joined players (USING JOINED VIEW)
                this.ui.showJoinedLobby(code);
                // Ensure we populate the player list UI with current known players
                if (this.multiplayer && this.multiplayer.players) {
                    this.ui.updatePlayerList(this.multiplayer.players);
                }
                console.log(`[Main] Successfully joined room: ${code}`);
            } catch (err) {
                console.error('Join failed', err);
                // Show a more detailed error message to the user
                const errorMessage = err.message || 'Failed to join room';
                this.ui.showJoinError(`Connection Error: ${errorMessage}`);
            }
        };
        this.ui.onStartMatchClick = () => {
            const isRandom = this.multiplayer.isRandomMatch;
            const duration = isRandom ? 240 : (this.ui.getMatchDuration() || 300); // Duration is already in seconds from UI
            console.log('Starting match with duration:', duration, 's (Random:', isRandom, ')');
            this.multiplayer.startGame({ duration });
        };
        this.ui.onCancelHostClick = () => {
            this.multiplayer.disconnect();
            this.ui.showFriendMode();
        };
        this.ui.onRandomMatchClick = () => this.findRandomMatch();
        this.ui.onCancelMatchClick = () => {
            // cancel matchmaking search
            if (this.matchmaker) this.matchmaker.cancelMatch();
            this.ui.showMultiplayerOptions();
        };
        this.ui.onShopClick = () => {
            this.ui.showShop();
            this.ui.updateShop(this.shop);
        };
        this.ui.onProfileUpdate = () => this.updateProfileDisplay();
        this.ui.onSaveProfileName = (name) => {
            // Save name to profile and update UI
            const profile = this.shop.getProfile();
            if (profile.lockName) return; // do not allow change if locked
            profile.name = name;
            this.shop.saveProfile();
            // Update displayed name
            this.updateProfileDisplay();
            // Update multiplayer and matchmaker
            if (this.multiplayer) this.multiplayer.localPlayerName = name;
        };

        this.ui.onSaveProfileAvatar = (dataUrl) => {
            const profile = this.shop.getProfile();
            profile.avatar = dataUrl;
            this.shop.saveProfile();
            this.updateProfileDisplay();
            // update local player avatar when in-game
            if (this.player) this.player.avatar = dataUrl;
        };

        this.ui.onToggleProfileLock = (locked) => {
            const profile = this.shop.getProfile();
            profile.lockName = Boolean(locked);
            this.shop.saveProfile();
            this.ui.setProfileLocked(Boolean(locked));
        };

        this.ui.onRequestProfileState = () => {
            return this.shop.getProfile();
        };


        // Multiplayer callbacks
        this.multiplayer.onPlayerUpdate = (players) => {
            if (this.ui.hostLobbyScreen.classList.contains('active')) {
                this.ui.updatePlayerList(players);
            }
        };

        this.multiplayer.onGameStart = (settings) => {
            this.gameState = 'playing';
            this.ui.showGame();
            this.initializeGame(settings);
        };

        this.multiplayer.onPlayerJoined = (playerData) => {
            // Always register remote player info (lobby or in-game)
            if (!this.remotePlayers[playerData.id]) {
                // Use default spawn position if not provided
                const spawnX = playerData.x || 400;
                const spawnY = playerData.y || 300;
                this.remotePlayers[playerData.id] = new Player(spawnX, spawnY, false);
                this.remotePlayers[playerData.id].isRemote = true; // Enable interpolation
            }
            
            const remotePlayer = this.remotePlayers[playerData.id];

            // Set properties from received data
            remotePlayer.id = playerData.id;
            remotePlayer.name = playerData.name || 'Player';
            remotePlayer.hp = typeof playerData.hp === 'number' ? playerData.hp : (remotePlayer.hp || 100);
            remotePlayer.maxHp = typeof playerData.maxHp === 'number' ? playerData.maxHp : (remotePlayer.maxHp || 100);
            remotePlayer.kills = playerData.kills || remotePlayer.kills || 0;
            remotePlayer.deaths = playerData.deaths || remotePlayer.deaths || 0;
            remotePlayer.weapon = playerData.weapon || remotePlayer.weapon || 'pistol';
            remotePlayer.ammo = typeof playerData.ammo === 'number' ? playerData.ammo : (remotePlayer.ammo || Infinity);
            remotePlayer.alive = playerData.alive !== undefined ? playerData.alive : (remotePlayer.alive !== undefined ? remotePlayer.alive : true);
            
            // Set initial position if provided
            if (playerData.x !== undefined) remotePlayer.x = playerData.x;
            if (playerData.y !== undefined) remotePlayer.y = playerData.y;
            
            // Set initial velocity if provided
            if (playerData.vx !== undefined) remotePlayer.vx = playerData.vx;
            if (playerData.vy !== undefined) remotePlayer.vy = playerData.vy;
            
            // Set angle if provided
            if (playerData.angle !== undefined) remotePlayer.angle = playerData.angle;
            if (playerData.aimAngle !== undefined) remotePlayer.targetAngle = playerData.aimAngle;

            // Load weapon sprite if provided
            if (remotePlayer.weapon) {
                remotePlayer.loadWeaponSprite(remotePlayer.weapon);
            }

            // Load character sprite if provided
            if (playerData.characterId) {
                remotePlayer.characterId = playerData.characterId;
                this.loadCharacterSprite(remotePlayer);
            }
        };

        this.multiplayer.onPlayerLeft = (playerId) => {
            if (this.remotePlayers[playerId]) {
                delete this.remotePlayers[playerId];
                console.log(`[Main] Remote player left: ${playerId}`);
            }
        };

        // onPlayerData handler removed to prevent conflict with onGameStateUpdate + Interpolation
        this.multiplayer.onWeaponPickupSpawn = (pickupData) => {
            if (this.gameMode === 'multiplayer') {
                // Safety check: ensure weaponPickups array exists
                if (!this.weaponPickups) {
                    console.warn('[Main] weaponPickups array not initialized yet, ignoring pickup spawn');
                    return;
                }
                
                // Check if pickup already exists (by ID or position overlap)
                const exists = this.weaponPickups.some(p =>
                    Math.abs(p.x - pickupData.x) < 1 && Math.abs(p.y - pickupData.y) < 1
                );

                if (!exists) {
                    const pickup = new WeaponPickup(pickupData.x, pickupData.y, pickupData.type);
                    this.weaponPickups.push(pickup);
                    console.log(`[Main] Received weapon pickup: ${pickupData.type} at (${Math.floor(pickupData.x)}, ${Math.floor(pickupData.y)})`);
                }
            }
        };
        this.multiplayer.onProjectileFired = (projectileData) => {
            if (this.gameState === 'playing') {
                // Skip projectiles fired by the local player (they're already in the local projectiles array)
                if (projectileData.ownerId === this.multiplayer.localId) {
                    return;
                }
                
                // Create a Projectile instance for remote bullets
                const ownerPlayer = this.remotePlayers[projectileData.ownerId] || null;
                const weaponId = projectileData.weaponId || projectileData.weapon || 'pistol';
                const angle = typeof projectileData.angle === 'number' ? projectileData.angle : Math.atan2(projectileData.vy || 0, projectileData.vx || 1);
                const proj = new Projectile(projectileData.x, projectileData.y, angle, weaponId, ownerPlayer);
                // override velocities if provided
                if (typeof projectileData.vx === 'number') proj.vx = projectileData.vx;
                if (typeof projectileData.vy === 'number') proj.vy = projectileData.vy;
                if (projectileData.id) proj.id = projectileData.id;
                if (projectileData.color) proj.color = projectileData.color;
                proj.createdAt = Date.now();

                this.projectiles.push(proj);

                // Sound is now handled via PLAY_SOUND messages, so we don't play it locally here
            }
        };

        // Handle remote player game state updates
        this.multiplayer.onGameStateUpdate = (playerId, playerData) => {
            if (this.gameState === 'playing' && this.remotePlayers[playerId]) {
                const player = this.remotePlayers[playerId];

                // Update position (Target interpolation)
                if (playerData.x !== undefined) player.targetX = playerData.x;
                if (playerData.y !== undefined) player.targetY = playerData.y;

                // Snap if too far (increased threshold for smoother gameplay)
                if (player.targetX !== undefined && Math.abs(player.x - player.targetX) > 300) player.x = player.targetX;
                if (player.targetY !== undefined && Math.abs(player.y - player.targetY) > 300) player.y = player.targetY;

                // Update other properties
                if (playerData.hp !== undefined) player.hp = playerData.hp;
                if (playerData.alive !== undefined) {
                    player.alive = playerData.alive;
                }
                if (playerData.aimAngle !== undefined) player.targetAngle = playerData.aimAngle; // Interpolate rotation
                if (playerData.vx !== undefined) player.vx = playerData.vx;
                if (playerData.vy !== undefined) player.vy = playerData.vy;

                // Handle weapon updates
                if (playerData.weapon && player.weapon !== playerData.weapon) {
                    player.switchToWeapon(playerData.weapon);
                }

                if (playerData.ammo !== undefined) player.ammo = playerData.ammo;
                if (playerData.name) player.name = playerData.name;
                if (playerData.avatar) player.avatar = playerData.avatar;
                if (playerData.characterId && player.characterId !== playerData.characterId) {
                    player.characterId = playerData.characterId;
                    this.loadCharacterSprite(player);
                }
            } else if (this.gameState === 'playing') {
                console.warn(`[Main] Received game state update for unknown player: ${playerId}`);
            }
        };

        // Set up main menu profile click handler
        document.getElementById('mainMenuProfile').addEventListener('click', () => {
            this.ui.showProfile();
        });

        // Set up watch ad buttons
        document.getElementById('watchAdCoinsBtn').addEventListener('click', () => {
            this.watchAdForCoins();
        });

        document.getElementById('watchAdDiamondsBtn').addEventListener('click', () => {
            this.watchAdForDiamonds();
        });

        // Initialize main menu profile display
        this.updateMainMenuProfile();

        // Generate lobby particles
        this.generateLobbyParticles();

        // Register multiplayer damage handler
        this.multiplayer.onDamageReceived = (data) => {
            if (this.player && this.player.alive) {
                // Find attacker
                const attacker = this.remotePlayers[data.attackerId] || null;
                const killed = this.player.takeDamage(data.damage, attacker);

                // Play hit sound
                // this.soundManager.play('hit');

                if (killed) {
                    console.log('ðŸ’€ Killed by', data.attackerId);
                    // Broadcast death so killer gets credit
                    this.multiplayer.sendPlayerDeath(data.attackerId);
                    // Play death sound in multiplayer
                    if (this.gameMode === 'multiplayer') {
                        this.multiplayer.sendSound('die', 0.5);
                    }
                }
            }
        };

        // Register player death handler
        this.multiplayer.onPlayerDeath = (victimId, killerId) => {
            console.log(`[Main] Player death event: Victim: ${victimId}, Killer: ${killerId}`);

            // If the local player is the killer, increment their kill count
            if (this.player && killerId === this.multiplayer.localId) {
                this.player.kills++;
                this.ui.updateHUD(this.player);
                console.log(`[Main] Local player got a kill! Total kills: ${this.player.kills}`);
            }
            // If a remote player is the killer, update their stats
            else if (this.remotePlayers[killerId]) {
                this.remotePlayers[killerId].kills++;
                console.log(`[Main] Remote player ${killerId} got a kill! Total kills: ${this.remotePlayers[killerId].kills}`);
            }

            // If the local player died, update their stats
            if (this.player && victimId === this.multiplayer.localId) {
                this.player.deaths++;
                this.ui.updateHUD(this.player);
                this.soundManager.play('die');
                console.log(`[Main] Local player died! Total deaths: ${this.player.deaths}`);
            }
            // If a bot died
            else {
                const deadBot = this.bots.find(b => b.id === victimId);
                if (deadBot) {
                    deadBot.deaths++;
                    console.log(`[Main] Bot ${victimId} died.`);
                }
            }
        };
        
        // Register sound playback handler
        this.multiplayer.onPlaySound = (sound, volume) => {
            // Play sound for remote events
            this.soundManager.play(sound, volume);
        };
        // Start game loop
        this.gameLoop();
    }

    generateLobbyParticles() {
        const container = document.getElementById('lobbyParticles');
        if (!container) return;

        // Generate 50 particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'lobby-particle';

            // Random properties
            const left = Math.random() * 100;
            const delay = Math.random() * 12;
            const drift = (Math.random() - 0.5) * 100;
            const size = 2 + Math.random() * 3;

            particle.style.left = `${left}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.setProperty('--drift-x', `${drift}px`);
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            container.appendChild(particle);
        }
    }

    watchAdForCoins() {
        // Simulate watching ad (3 second delay)
        const btn = document.getElementById('watchAdCoinsBtn');
        btn.disabled = true;
        btn.style.opacity = '0.5';

        setTimeout(() => {
            const reward = 50 + Math.floor(Math.random() * 51); // 50-100 coins
            this.shop.addCoins(reward);
            this.updateMainMenuProfile();

            // Show reward notification
            this.showRewardNotification(`+${reward} ðŸ’° Coins!`, '#FFD700');

            btn.disabled = false;
            btn.style.opacity = '1';
        }, 3000);
    }

    watchAdForDiamonds() {
        // Simulate watching ad (3 second delay)
        const btn = document.getElementById('watchAdDiamondsBtn');
        btn.disabled = true;
        btn.style.opacity = '0.5';

        setTimeout(() => {
            const reward = 5 + Math.floor(Math.random() * 6); // 5-10 diamonds
            this.shop.addDiamonds(reward);
            this.updateMainMenuProfile();

            // Show reward notification
            this.showRewardNotification(`+${reward} ðŸ’Ž Diamonds!`, '#00D4FF');

            btn.disabled = false;
            btn.style.opacity = '1';
        }, 3000);
    }

    showRewardNotification(message, color) {
        const notification = document.createElement('div');
        notification.className = 'reward-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
            color: ${color};
            padding: 30px 50px;
            border-radius: 20px;
            font-size: 32px;
            font-weight: 900;
            z-index: 10000;
            box-shadow: 0 0 50px ${color}, 0 0 100px ${color};
            border: 3px solid ${color};
            text-shadow: 0 0 20px ${color};
            animation: rewardPop 2s ease-out forwards;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    updateCameraZoom() {
        if (!this.player || !this.camera) return;

        // Sniper zoom out effect
        if (this.player.weapon === 'sniper') {
            this.camera.setZoom(0.7); // Zoom out to 70%
        } else {
            this.camera.setZoom(1); // Normal zoom
        }
    }

    initializeGame(settings = {}) {
        console.log('ðŸ”„ Initializing game...');

        // Start background music
        this.soundManager.play('background', 0.3, true);

        // Reset game state
        this.projectiles = [];
        this.obstacles = [];
        this.stars = [];
        this.weaponPickups = [];
        this.weaponSpawnTimer = 0;

        // Safety: Clear remote players to prevent ghosts
        this.remotePlayers = {};
        // Re-register known multiplayer peers if in multiplayer mode
        if (this.gameMode === 'multiplayer' && this.multiplayer && this.multiplayer.players) {
            this.multiplayer.players.forEach(p => {
                // IMPORTANT: Fix visibility - recreate player objects for everyone in the list
                if (p.id !== this.multiplayer.localId) {
                    this.remotePlayers[p.id] = new Player(p.x || 0, p.y || 0, false);
                    this.remotePlayers[p.id].isRemote = true; // Enable interpolation
                    const rp = this.remotePlayers[p.id];
                    rp.id = p.id;
                    rp.name = p.name || 'Player';
                    if (p.characterId) {
                        rp.characterId = p.characterId;
                        this.loadCharacterSprite(rp);
                    }
                }
            });
        }

        // Set game state to playing
        this.gameState = 'playing';
        console.log('ðŸŽ® Game state set to playing');

        // Hide all screens and show game
        this.ui.showGame();

        // Create player
        const spawnPoint = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
        this.player = new Player(spawnPoint.x, spawnPoint.y, false);
        this.player.id = this.multiplayer.localId;
        // Assign profile name and avatar to local player
        const profile = this.shop.getProfile();
        this.player.name = profile.name || 'Player';
        if (profile.avatar) this.player.avatar = profile.avatar;
        console.log(`ðŸ‘¤ Created player at (${spawnPoint.x}, ${spawnPoint.y})`);

        // Create bots only in single player mode
        this.bots = [];
        this.botAIs = []; // Initialize botAIs array
        if (this.gameMode === 'single') {
            console.log('ðŸ¤– Creating bots for single player mode');
            for (let i = 1; i < 4; i++) {
                const botSpawn = SPAWN_POINTS[(i) % SPAWN_POINTS.length];
                const bot = new Player(botSpawn.x, botSpawn.y, true);
                bot.id = `bot_${i}`;
                bot.isBot = true;

                // Assign random name
                const botNames = [
                    'John', 'Sarah', 'Mike', 'Emma', 'David', 'Jessica', // Western
                    'Rahul', 'Priya', 'Arjun', 'Anjali', 'Vikram', 'Neha' // Indian
                ];
                bot.name = botNames[Math.floor(Math.random() * botNames.length)];

                this.bots.push(bot);

                // Create BotAI for each bot
                this.botAIs.push(new BotAI(bot));

                console.log(`ðŸ¤– Created bot ${i} at (${botSpawn.x}, ${botSpawn.y})`);
            }
        }

        // Use obstacles from Map.js (no random generation to avoid invisible collisions)
        this.obstacles = this.map.obstacles;

        // Create stars for background (increased to 500 for more particles)
        for (let i = 0; i < 500; i++) {
            this.stars.push({
                x: Math.random() * GAME_CONFIG.MAP_WIDTH,
                y: Math.random() * GAME_CONFIG.MAP_HEIGHT,
                size: Math.random() * 2.5 + 0.5
            });
        }

        // Spawn initial weapons at game start
        for (let i = 0; i < 3; i++) {
            this.spawnWeaponPickup();
        }

        // Set up weapon pickup spawner
        this.lastWeaponSpawn = 0;
        this.weaponSpawnInterval = 15; // 15 seconds

        // Set up match timer (5 minutes for single player)
        if (this.gameMode === 'single') {
            this.matchTimeLeft = 300; // 5 minutes in seconds
            this.matchTimerActive = true;
        } else {
            // Multiplayer mode
            if (settings && settings.duration) {
                this.matchTimeLeft = settings.duration;
                this.matchTimerActive = true;
                console.log('â³ Multiplayer match timer set to:', this.matchTimeLeft);
            } else {
                this.matchTimeLeft = 0;
                this.matchTimerActive = false;
            }
        }

        // Mark match start time
        this.matchStartTime = Date.now();

        // Camera is now initialized in constructor, just reset position
        this.camera.x = 0;
        this.camera.y = 0;

        // Load equipped character for player
        this.loadPlayerCharacter();

        // Update in-game profile display
        this.updateInGameProfile();
        console.log('âœ… Game initialization complete');
    }

    loadPlayerCharacter() {
        if (!this.player) return;
        this.loadCharacterSprite(this.player, true);
    }

    // New Helper to load sprite for ANY player (local or remote)
    loadCharacterSprite(playerObj, isLocal = false) {
        let charId = playerObj.characterId;

        // If local, get from shop
        if (isLocal) {
            charId = this.shop.getEquippedCharacter();
            playerObj.characterId = charId;
        }

        if (!charId) return;

        const charData = this.shop.getCharacterData(charId);

        if (charData && charData.sprite) {
            console.log(`ðŸŽ­ Loading character sprite for ${playerObj.id}: ${charData.name}`);
            playerObj.sprite.src = charData.sprite;
            // Only local player needs full characterData for UI etc, but storing it on obj doesn't hurt
            playerObj.characterData = charData;

            // Store aura data if premium character
            if (charData.aura) {
                playerObj.aura = charData.aura;
                console.log(`âœ¨ Aura enabled for ${playerObj.id}`);
            } else {
                playerObj.aura = null;
            }
        }
    }

    gameLoop(currentTime) {
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }

        // Log game loop for debugging
        if (this.gameState === 'playing') {
            // console.log('ðŸ”„ Game loop running'); // Too frequent, commented out
            this.update(this.deltaTime);
            this.render();
        }

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update input
        this.input.update();

        // Handle weapon switch key (Spacebar key)
        if (this.player && this.player.alive) {
            // Debug logging to check if space key is detected
            if (this.input.isKeyPressed('Space')) {
                console.log('SPACE key is currently pressed');
            }

            if (this.input.wasKeyJustPressed('Space')) {
                console.log('SPACEBAR key pressed - switching weapon');
                this.switchToPreviousOrPistol();
            }
        }

        // Update weapon spawn timer
        if (!this.weaponSpawnTimer) this.weaponSpawnTimer = 0;
        if (!this.weaponSpawnInterval) this.weaponSpawnInterval = 15;

        this.weaponSpawnTimer += deltaTime;
        if (this.weaponSpawnTimer >= this.weaponSpawnInterval) {
            // Only spawn if we have less than 5 weapons on the map
            if (this.weaponPickups.filter(p => p.available).length < 5) {
                this.spawnWeaponPickup();
            }
            this.weaponSpawnTimer = 0;
        }

        // Update weapon pickups
        for (let i = this.weaponPickups.length - 1; i >= 0; i--) {
            const pickup = this.weaponPickups[i];
            pickup.update(deltaTime);

            // Remove pickups that are no longer needed
            if (!pickup.available && pickup.respawnTimer <= 0) {
                this.weaponPickups.splice(i, 1);
            }
        }

        // Update player aim
        if (this.player && this.player.alive) {
            const mousePos = this.input.getMouseWorld();
            this.player.aimAt(mousePos.x, mousePos.y);
            this.player.shooting = this.input.isMouseDown();
        }

        // Check weapon pickup collisions for player
        if (this.player && this.player.alive) {
            for (let pickup of this.weaponPickups) {
                if (pickup.checkCollision(this.player)) {
                    if (pickup.pickup()) {
                        // Player picks up the weapon with full ammo
                        const previousWeapon = this.player.weapon;
                        // Set previous weapon to pistol (infinite ammo weapon)
                        this.player.previousWeapon = 'pistol';
                        this.player.switchToWeapon(pickup.weaponType, true); // true = give full ammo
                        console.log(`Player picked up ${pickup.weaponType}, previous weapon was ${previousWeapon}`);

                        // Apply sniper zoom
                        this.updateCameraZoom();

                        // Update UI
                        this.ui.updateHUD(this.player);
                    }
                }
            }
        }

        // Update bot AIs and bots
        for (let i = 0; i < this.bots.length; i++) {
            const bot = this.bots[i];
            const botAI = this.botAIs[i];

            if (botAI && bot && bot.alive) {
                botAI.update(deltaTime, this.player);
            }

            if (bot) {
                bot.update(deltaTime, this.map.width, this.map.height);
                this.map.checkObstacleCollisions(bot);

                // Bot shooting
                if (bot.shooting) {
                    const newProjectiles = bot.shoot();
                    if (newProjectiles) {
                        this.projectiles.push(...newProjectiles);
                    }
                    bot.shooting = false;
                }

                // Check weapon pickup collisions for bots
                for (let pickup of this.weaponPickups) {
                    if (pickup.checkCollision(bot)) {
                        if (pickup.pickup()) {
                            // Bot picks up weapon with full ammo
                            bot.previousWeapon = 'pistol';
                            bot.switchToWeapon(pickup.weaponType, true); // true = give full ammo
                            console.log(`Bot picked up ${pickup.weaponType}`);
                        }
                    }
                }
            }
        }

        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.map.width, this.map.height);
            this.map.checkObstacleCollisions(this.player);

            // Player shooting
            if (this.player.shooting) {
                const newProjectiles = this.player.shoot();
                if (newProjectiles) {
                    this.projectiles.push(...newProjectiles);

                    // Play shoot sound based on weapon
                    let soundName, soundVolume;
                    if (this.player.weapon === 'Laser' || this.player.weapon === 'plasma_canon') {
                        soundName = 'laser';
                        soundVolume = 0.4;
                    } else if (this.player.weapon === 'rocket_launcher') {
                        soundName = 'rocker';
                        soundVolume = 0.5;
                    } else if (this.player.weapon === 'sniper') {
                        soundName = 'shoot';
                        soundVolume = 0.6; // Louder shoot for sniper
                    } else {
                        soundName = 'shoot';
                        soundVolume = 0.3;
                    }
                    
                    this.soundManager.play(soundName, soundVolume);

                    // Broadcast projectile creation and sound in multiplayer
                    if (this.gameMode === 'multiplayer') {
                        this.multiplayer.sendProjectiles(newProjectiles);
                        this.multiplayer.sendSound(soundName, soundVolume * 0.7); // Slightly quieter for remote players
                    }
                }
            }
        }

        // Update remote players (for interpolation)
        if (this.gameMode === 'multiplayer') {
            for (let peerId in this.remotePlayers) {
                const remotePlayer = this.remotePlayers[peerId];
                if (remotePlayer) {
                    remotePlayer.update(deltaTime, this.map.width, this.map.height);
                }
            }
        }

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            const alive = projectile.update(deltaTime);

            // Check bounds
            if (projectile.isOutOfBounds(this.map.width, this.map.height)) {
                return false;
            }

            // Check collision with players (LOCAL PLAYER)
            if (this.player && this.player.alive &&
                projectile.owner !== this.player &&
                checkCircleCollision(projectile, this.player)) {
                
                // CRITICAL FIX: Double Damage Glitch
                // In multiplayer, projectiles from remote players are simulated locally but should NOT cause local damage.
                // We must wait for the authoritative 'DAMAGE' message from the shooter/server.
                // If we apply damage here AND receive the message, the player takes 2x damage.
                
                const isRemoteBullet = this.gameMode === 'multiplayer' && projectile.owner && projectile.owner.isRemote;
                
                if (!isRemoteBullet) {
                    // Only apply damage locally if it's a bot (single player) or weirdly self-inflicted (rare)
                    this.player.takeDamage(projectile.damage, projectile.owner);
                } else {
                    // It's a remote bullet. We detected the hit visually, so we destroy the bullet (return false below),
                    // but we do NOT subtract HP. The network message will handle the HP subtraction.
                    console.log('Visual hit from remote bullet detected - ignoring local damage, waiting for network packet');
                }
                
                return false; // Destroy bullet on impact
            }

            // Check collision with all bots
            for (let bot of this.bots) {
                if (bot && bot.alive &&
                    projectile.owner !== bot &&
                    checkCircleCollision(projectile, bot)) {
                    bot.takeDamage(projectile.damage, projectile.owner);
                    return false;
                }
            }

            // Check collision with remote players (multiplayer)
            if (this.gameMode === 'multiplayer') {
                for (let peerId in this.remotePlayers) {
                    const remotePlayer = this.remotePlayers[peerId];
                    if (remotePlayer && remotePlayer.alive &&
                        projectile.owner !== remotePlayer &&
                        checkCircleCollision(projectile, remotePlayer)) {
                        
                        // We are the shooter (or simulating it). 
                        // If we own the bullet, WE are the authority. Send the damage command.
                        if (projectile.owner === this.player) {
                            this.multiplayer.sendDamage(peerId, projectile.damage);
                            console.log('Hit remote player:', peerId, 'for', projectile.damage, 'damage');
                        }
                        return false;
                    }
                }
            }

            return alive;
        });

        if (this.player) {
            this.camera.follow(this.player);

            // Sniper Zoom Logic
            if (this.player.weapon === 'sniper' && this.player.alive) {
                // Zoom out (0.6x) when holding sniper
                this.camera.setZoom(0.6);
            } else {
                // Reset zoom
                this.camera.setZoom(1.0);
            }
        }

        // Update HUD
        if (this.player) {
            this.ui.updateHUD(this.player);
        }

        // Update and display match timer
        if (this.matchTimerActive && this.matchTimeLeft > 0) {
            const oldTime = Math.floor(this.matchTimeLeft);
            this.matchTimeLeft -= deltaTime;
            const newTime = Math.floor(this.matchTimeLeft);

            this.ui.updateTimer(this.matchTimeLeft);

            // Broadcast timer if host (once per second)
            if (this.gameMode === 'multiplayer' && this.multiplayer.isHost && newTime !== oldTime) {
                this.multiplayer.sendMatchTimer(this.matchTimeLeft);
            }

            if (this.matchTimeLeft <= 0) {
                this.matchTimeLeft = 0;
                this.endGameByTime();
                return;
            }
        } else if (this.matchTimerActive) {
            this.ui.updateTimer(0);
        }

        // Send multiplayer state (Throttled to ~60 times per second for better responsiveness)
        const now = Date.now();
        if (this.gameMode === 'multiplayer' && this.player && (now - (this._lastNetworkUpdate || 0) > 16)) {
            this._lastNetworkUpdate = now;
            this.multiplayer.sendGameState({
                x: this.player.x,
                y: this.player.y,
                vx: this.player.vx,
                vy: this.player.vy,
                hp: this.player.hp,
                alive: this.player.alive,
                aimAngle: this.player.angle, // Send exact looking angle
                weapon: this.player.weapon,
                name: this.player.name,
                characterId: this.shop.getEquippedCharacter(),
                avatar: this.player.avatar || null,
                color: this.player.color
            });
        }

        // Check win/lose conditions
        if (this.player && !this.player.alive && this.player.respawnTimer <= 0) {
            // Player died and won't respawn
            this.endGame(false);
        }
    }

    render() {
        if (!this.gameCanvas || !this.player) return;

        const ctx = this.gameCanvas.getContext('2d');
        if (!ctx) return;

        // Focus the canvas for input handling
        this.gameCanvas.focus();

        // Update camera to follow player and handle zoom
        if (this.player && this.player.alive) {
            this.camera.follow(this.player);
            this.updateCameraZoom();
        }

        // Clear canvas
        ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        // Update canvas size to match window
        this.gameCanvas.width = window.innerWidth;
        this.gameCanvas.height = window.innerHeight;

        // Debug: Log canvas size
        if (!this._canvasSizeLogged) {
            console.log('ðŸ” [Render Debug] Canvas size:', this.gameCanvas.width, 'x', this.gameCanvas.height);
            console.log('ðŸ” [Render Debug] Canvas style display:', this.gameCanvas.style.display);
            console.log('ðŸ” [Render Debug] Canvas computed visibility:', getComputedStyle(this.gameCanvas).visibility);
            console.log('ðŸ” [Render Debug] Canvas offsetWidth/Height:', this.gameCanvas.offsetWidth, 'x', this.gameCanvas.offsetHeight);
            this._canvasSizeLogged = true;
        }

        // Duplicate rendering loop removed
        /* if (this.gameMode === 'multiplayer') {
            for (let peerId in this.remotePlayers) {
                const remote = this.remotePlayers[peerId];
                if (remote) remote.render(ctx, this.camera);
            }
        } */

        // Update camera to follow player
        if (this.player) {
            this.camera.x = this.player.x - this.gameCanvas.width / 2;
            this.camera.y = this.player.y - this.gameCanvas.height / 2;
        }

        // Draw background stars with glow
        for (let star of this.stars) {
            const screenX = star.x - this.camera.x;
            const screenY = star.y - this.camera.y;

            // Only draw stars that are on screen
            if (screenX >= -5 && screenX <= this.gameCanvas.width + 5 &&
                screenY >= -5 && screenY <= this.gameCanvas.height + 5) {
                // Add glow effect
                ctx.shadowColor = '#00F0FF';
                ctx.shadowBlur = star.size * 3;
                ctx.fillStyle = star.size > 1.5 ? '#00F0FF' : '#FFFFFF';
                ctx.beginPath();
                ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Draw planet obstacles
        for (let obstacle of this.obstacles) {
            const screenX = obstacle.x - this.camera.x;
            const screenY = obstacle.y - this.camera.y;

            // Only draw obstacles that are on screen
            if (screenX + obstacle.radius >= 0 && screenX - obstacle.radius <= this.gameCanvas.width &&
                screenY + obstacle.radius >= 0 && screenY - obstacle.radius <= this.gameCanvas.height) {

                // Draw planet with gradient
                const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, obstacle.radius);
                gradient.addColorStop(0, '#6B7280');
                gradient.addColorStop(0.7, '#4B5563');
                gradient.addColorStop(1, '#1F2937');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, obstacle.radius, 0, Math.PI * 2);
                ctx.fill();

                // Add planet border
                ctx.strokeStyle = '#374151';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Draw map boundaries
        const boundaryThickness = 20;
        const boundaryColor = 'rgba(255, 0, 85, 0.5)';

        // Left boundary
        if (this.camera.x < boundaryThickness) {
            ctx.fillStyle = boundaryColor;
            ctx.fillRect(-this.camera.x, 0, boundaryThickness, this.gameCanvas.height);
        }

        // Right boundary
        if (this.camera.x + this.gameCanvas.width > GAME_CONFIG.MAP_WIDTH - boundaryThickness) {
            ctx.fillStyle = boundaryColor;
            ctx.fillRect(GAME_CONFIG.MAP_WIDTH - this.camera.x - boundaryThickness, 0, boundaryThickness, this.gameCanvas.height);
        }

        // Top boundary
        if (this.camera.y < boundaryThickness) {
            ctx.fillStyle = boundaryColor;
            ctx.fillRect(0, -this.camera.y, this.gameCanvas.width, boundaryThickness);
        }

        // Bottom boundary
        if (this.camera.y + this.gameCanvas.height > GAME_CONFIG.MAP_HEIGHT - boundaryThickness) {
            ctx.fillStyle = boundaryColor;
            ctx.fillRect(0, GAME_CONFIG.MAP_HEIGHT - this.camera.y - boundaryThickness, this.gameCanvas.width, boundaryThickness);
        }

        // Draw weapon pickups
        for (let pickup of this.weaponPickups) {
            pickup.render(ctx, this.camera);
        }

        // Draw bots
        for (let bot of this.bots) {
            if (bot && bot.alive) {
                bot.render(ctx, this.camera);
            }
        }

        // Draw remote players (multiplayer)
        for (let peerId in this.remotePlayers) {
            const remotePlayer = this.remotePlayers[peerId];
            if (remotePlayer && remotePlayer.alive) {
                remotePlayer.render(ctx, this.camera);
            }
        }

        // Draw player
        if (this.player && this.player.alive) {
            this.player.render(ctx, this.camera);
        }

        // Draw projectiles with trails
        for (let projectile of this.projectiles) {
            // Convert world coordinates to screen coordinates
            const screenX = projectile.x - this.camera.x;
            const screenY = projectile.y - this.camera.y;

            // Only draw projectiles that are on screen
            if (screenX >= -50 && screenX <= this.gameCanvas.width + 50 &&
                screenY >= -50 && screenY <= this.gameCanvas.height + 50) {
                projectile.render(ctx, this.camera);
            }
        }

        // Update HUD
        if (this.player) {
            this.ui.updateHUD(this.player);
        }
    }

    renderRespawnTimer(player) {
        const screenPos = this.camera.worldToScreen(player.x, player.y);

        this.ctx.save();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const timeLeft = Math.ceil(player.respawnTimer);
        this.ctx.fillText('Respawning in ' + timeLeft, screenPos.x, screenPos.y);

        this.ctx.restore();
    }

    spawnWeaponPickup() {
        // Only host or single player spawns pickups
        if (this.gameMode === 'multiplayer' && !this.multiplayer.isHost) {
            return;
        }

        // Don't spawn pistol pickups (infinite ammo weapon)
        const weaponTypes = [
            'shotgun',
            'assault_rifle',
            'sniper',
            'rocket_launcher',
            'Laser',
            'plasma_canon'
        ];

        // Select a random weapon type
        const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];

        // Generate random position within map bounds (with some padding)
        const padding = 200;
        const x = padding + Math.random() * (GAME_CONFIG.MAP_WIDTH - padding * 2);
        const y = padding + Math.random() * (GAME_CONFIG.MAP_HEIGHT - padding * 2);

        // Create and add the weapon pickup
        const pickup = new WeaponPickup(x, y, weaponType);
        this.weaponPickups.push(pickup);

        // Broadcast pickup if host
        if (this.gameMode === 'multiplayer' && this.multiplayer.isHost) {
            this.multiplayer.sendWeaponPickup({
                x: x,
                y: y,
                type: weaponType
            });
        }

        console.log(`âœ… Spawned ${weaponType} weapon pickup at (${Math.floor(x)}, ${Math.floor(y)})`);
    }

    switchToPreviousOrPistol() {
        console.log('switchToPreviousOrPistol called'); // Debug logging
        if (!this.player || !this.player.alive) {
            console.log('Player not alive or not exists'); // Debug logging
            return;
        }

        console.log('Player is alive, proceeding with switch'); // Debug logging

        // Prevent rapid switching (debounce)
        if (this.lastWeaponSwitchTime && (Date.now() - this.lastWeaponSwitchTime) < 200) {
            console.log('Switch ignored due to debounce'); // Debug logging
            return; // Ignore if switched within last 200ms
        }
        this.lastWeaponSwitchTime = Date.now();

        // Determine what weapon to switch to
        let targetWeapon = 'pistol'; // Default fallback

        // If player has a previous weapon that's different from current, use that
        if (this.player.previousWeapon &&
            this.player.previousWeapon !== this.player.weapon) {
            targetWeapon = this.player.previousWeapon;
        }

        console.log(`Attempting to switch from ${this.player.weapon} to ${targetWeapon}`); // Debug logging

        // Only switch if it's different from current weapon
        if (targetWeapon !== this.player.weapon) {
            this.player.switchToWeapon(targetWeapon);
            console.log(`Switched to weapon: ${targetWeapon}`);

            // Apply sniper zoom
            this.updateCameraZoom();

            // Update UI
            this.ui.updateHUD(this.player);
        } else {
            console.log('No switch performed - target same as current'); // Debug logging
        }
    }

    updateMainMenuProfile() {
        if (!this.shop) return;

        const profile = this.shop.getProfile();

        // Update XP bar
        const xpPercent = (profile.xp / profile.xpToNext) * 100;
        document.getElementById('mainMenuXpBar').style.width = xpPercent + '%';

        // Update XP text
        document.getElementById('mainMenuXpText').textContent = profile.xp;
        document.getElementById('mainMenuXpNext').textContent = profile.xpToNext;

        // Update badge (show highest unlocked badge)
        const badgeOrder = ['beginner', 'warrior', 'champion', 'legend', 'sharpshooter', 'survivor', 'collector', 'master'];
        const badgeIcons = {
            beginner: 'ðŸ”°',
            warrior: 'âš”ï¸',
            champion: 'ðŸ†',
            legend: 'ðŸ‘‘',
            sharpshooter: 'ðŸŽ¯',
            survivor: 'ðŸ›¡ï¸',
            collector: 'ðŸ’Ž',
            master: 'â­'
        };

        let currentBadge = 'beginner';
        for (const badgeId of [...badgeOrder].reverse()) {
            if (profile.badges[badgeId].unlocked) {
                currentBadge = badgeId;
                break;
            }
        }

        document.getElementById('mainMenuBadge').textContent = badgeIcons[currentBadge];
    }

    updateInGameProfile() {
        if (!this.shop) return;

        const profile = this.shop.getProfile();

        // Update XP bar
        const xpPercent = (profile.xp / profile.xpToNext) * 100;
        document.getElementById('inGameXpBar').style.width = xpPercent + '%';

        // Update XP text
        document.getElementById('inGameXpText').textContent = profile.xp;
        document.getElementById('inGameXpNext').textContent = profile.xpToNext;

        // Update badge (show highest unlocked badge)
        const badgeOrder = ['beginner', 'warrior', 'champion', 'legend', 'sharpshooter', 'survivor', 'collector', 'master'];
        const badgeIcons = {
            beginner: 'ðŸ”°',
            warrior: 'âš”ï¸',
            champion: 'ðŸ†',
            legend: 'ðŸ‘‘',
            sharpshooter: 'ðŸŽ¯',
            survivor: 'ðŸ›¡ï¸',
            collector: 'ðŸ’Ž',
            master: 'â­'
        };

        let currentBadge = 'beginner';
        for (const badgeId of [...badgeOrder].reverse()) {
            if (profile.badges[badgeId].unlocked) {
                currentBadge = badgeId;
                break;
            }
        }

        document.getElementById('currentBadge').textContent = badgeIcons[currentBadge];
    }

    updateProfileDisplay() {
        const profile = this.shop.getProfile();

        // Update basic info
        document.getElementById('playerLevel').textContent = profile.level;
        // Update displayed player name
        const nameEl = document.getElementById('playerName');
        if (nameEl) nameEl.textContent = profile.name || 'Player';
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput) nameInput.value = profile.name || 'Player';
        // Update lock and avatar preview
        if (this.ui && this.ui.setProfileLocked) this.ui.setProfileLocked(Boolean(profile.lockName));
        const avatarPreview = document.getElementById('avatarPreview');
        if (avatarPreview) avatarPreview.innerHTML = profile.avatar ? `<img src="${profile.avatar}" style="width:64px;height:64px;border-radius:8px;">` : '';
        document.getElementById('playerXP').textContent = profile.xp;
        document.getElementById('xpToNext').textContent = profile.xpToNext;

        // Update XP bar
        const xpPercent = (profile.xp / profile.xpToNext) * 100;
        document.getElementById('xpBar').style.width = xpPercent + '%';

        // Update stats
        document.getElementById('totalKills').textContent = profile.stats.totalKills;
        document.getElementById('totalDeaths').textContent = profile.stats.totalDeaths;
        document.getElementById('matchesPlayed').textContent = profile.stats.matchesPlayed;
        document.getElementById('wins').textContent = profile.stats.wins;

        // Update badges
        const badgesContainer = document.getElementById('badgesContainer');
        badgesContainer.innerHTML = '';

        const badgeOrder = ['beginner', 'warrior', 'champion', 'legend', 'sharpshooter', 'survivor', 'collector', 'master'];
        const badgeIcons = {
            beginner: 'ðŸ”°',
            warrior: 'âš”ï¸',
            champion: 'ðŸ†',
            legend: 'ðŸ‘‘',
            sharpshooter: 'ðŸŽ¯',
            survivor: 'ðŸ›¡ï¸',
            collector: 'ðŸ’Ž',
            master: 'â­'
        };

        badgeOrder.forEach(badgeId => {
            const badge = profile.badges[badgeId];
            const badgeEl = document.createElement('div');
            badgeEl.className = `badge ${badge.unlocked ? 'unlocked' : 'locked'}`;
            badgeEl.innerHTML = `
                <div class="badge-icon">${badgeIcons[badgeId]}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.desc}</div>
            `;
            badgesContainer.appendChild(badgeEl);
        });

        // Also update both profile displays
        this.updateInGameProfile();
        this.updateMainMenuProfile();
    }

    // Placeholder for random match finding
    findRandomMatch() {
        // For now, just show the random match screen
        this.ui.showRandomMatch();
        // Use Matchmaker to find a match
        if (this.matchmaker) {
            const profile = this.shop.getProfile();
            this.matchmaker.findMatch({ mode: 'battle_royale', name: profile.name });
            document.getElementById('matchStatus').textContent = 'Searching for opponents...';
        } else {
            document.getElementById('matchStatus').textContent = 'Matchmaker unavailable.';
        }
    }

    endGameByTime() {
        // Determine winner by kills
        let winner = this.player;
        let maxKills = this.player ? this.player.kills : 0;

        // Check bots
        for (let bot of this.bots) {
            if (bot && bot.kills > maxKills) {
                maxKills = bot.kills;
                winner = bot;
            }
        }

        // Check remote players
        for (let peerId in this.remotePlayers) {
            const rp = this.remotePlayers[peerId];
            if (rp && rp.kills > maxKills) {
                maxKills = rp.kills;
                winner = rp;
            }
        }

        const playerWon = winner === this.player;
        console.log(`â° Time's up! Winner: ${winner.name || 'Bot'} with ${maxKills} kills`);

        this.endGame(playerWon);
    }

    endGame(playerWon) {
        this.gameState = 'results';
        this.matchTimerActive = false;

        // Stop background music
        this.soundManager.stop('background');

        // Calculate coins earned (10 coins per kill)
        const coinsEarned = this.player ? this.player.kills * 10 : 0;

        // Award coins to player
        if (coinsEarned > 0) {
            this.shop.addCoins(coinsEarned);
            console.log(`Earned ${coinsEarned} coins from ${this.player.kills} kills!`);
        }

        // Award XP based on performance
        if (this.player) {
            // Base XP for playing
            let xpEarned = 10;

            // Bonus XP for kills
            xpEarned += this.player.kills * 5;

            // Bonus XP for winning
            if (playerWon) {
                xpEarned += 20;
            }

            // Award XP
            this.shop.addXP(xpEarned);
            console.log(`Earned ${xpEarned} XP!`);

            // Update stats (this also awards coins and diamonds)
            let won = playerWon;
            let matchPlayed = true;
            this.shop.updateStats(this.player.kills, this.player.deaths, matchPlayed, won);

            // Update both profile displays
            this.updateInGameProfile();
            this.updateMainMenuProfile();
        }

        // Show results
        this.ui.showResults(playerWon, this.player, coinsEarned);

        // Disconnect multiplayer if active
        if (this.multiplayer.peer) {
            this.multiplayer.disconnect();
        }
        // Submit leaderboard and match history to server (if available)
        (async () => {
            try {
                const serverBase = this.serverBase || (window.location.protocol === 'https:' ? 'https://space-drift-arena.onrender.com' : 'http://localhost:3000');

                // Leaderboard submission
                const profile = this.shop.getProfile();
                const playerId = this.multiplayer && this.multiplayer.localId ? this.multiplayer.localId : (this.player && this.player.id) || 'local_player';
                const playerName = profile.name || 'Player';

                // compute score based on xp earned + coins
                const xp = profile.xp || 0;
                const score = xp + (this.player ? (this.player.kills * 5) + (playerWon ? 50 : 0) : 0);

                await fetch(`${serverBase}/leaderboard`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId, name: playerName, score })
                }).catch(e => console.warn('Leaderboard post failed', e));

                // Match history submission
                const matchId = `match_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                const durationSec = this.matchStartTime ? Math.round((Date.now() - this.matchStartTime) / 1000) : 0;

                const playersArr = [];
                // local player
                if (this.player) {
                    playersArr.push({ playerId: playerId, name: playerName, kills: this.player.kills || 0, deaths: this.player.deaths || 0 });
                }

                // remote players
                if (this.gameMode === 'multiplayer') {
                    for (let pid in this.remotePlayers) {
                        const p = this.remotePlayers[pid];
                        if (!p) continue;
                        playersArr.push({ playerId: pid, name: p.name || 'Player', kills: p.kills || 0, deaths: p.deaths || 0 });
                    }
                }

                // bots
                for (let b of this.bots) {
                    if (!b) continue;
                    playersArr.push({ playerId: b.id || ('bot_' + Math.random().toString(36).slice(2, 8)), name: 'Bot', kills: b.kills || 0, deaths: b.deaths || 0 });
                }

                const matchPayload = {
                    matchId,
                    players: playersArr,
                    winnerId: this.player && playerWon ? playerId : (playersArr.length ? playersArr[0].playerId : null),
                    duration: durationSec,
                    gameMode: this.gameMode || 'single'
                };

                await fetch(`${serverBase}/matches`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(matchPayload)
                }).catch(e => console.warn('Match post failed', e));
            } catch (err) {
                console.warn('Error submitting match/leaderboard', err);
            }
        })();
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
