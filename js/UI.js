import { WEAPONS, COLORS } from './config.js';

export class UI {
    constructor() {
        // Screen elements
        this.mainMenu = document.getElementById('mainMenu');
        this.howToPlayScreen = document.getElementById('howToPlayScreen');
        this.modeSelectionScreen = document.getElementById('modeSelectionScreen');
        this.multiplayerOptionsScreen = document.getElementById('multiplayerOptionsScreen');
        this.friendModeScreen = document.getElementById('friendModeScreen');
        this.hostLobbyScreen = document.getElementById('hostLobbyScreen');
        this.joinGameScreen = document.getElementById('joinGameScreen');
        this.randomMatchScreen = document.getElementById('randomMatchScreen');
        this.shopScreen = document.getElementById('shopScreen');
        this.profileScreen = document.getElementById('profileScreen'); // Add profile screen
        this.gameCanvas = document.getElementById('gameCanvas');
        this.gameHUD = document.getElementById('gameHUD');
        this.resultsScreen = document.getElementById('resultsScreen');

        // HUD elements
        this.healthBar = document.getElementById('healthBar');
        this.healthText = document.getElementById('healthText');
        this.weaponName = document.getElementById('weaponName');
        this.ammoCount = document.getElementById('ammoCount');
        this.killCount = document.getElementById('killCount');

        // Results elements
        this.finalKills = document.getElementById('finalKills');
        this.finalDeaths = document.getElementById('finalDeaths');
        this.finalAccuracy = document.getElementById('finalAccuracy');
        this.coinsEarned = document.getElementById('coinsEarned');

        // Timer
        this.matchTimer = document.getElementById('matchTimer');

        // Shop elements
        this.shopCoins = document.getElementById('shopCoins');

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main menu
        document.getElementById('playBtn').addEventListener('click', () => {
            // Show mode selection screen with only multiplayer and singleplayer options
            this.showModeSelection();
        });

        // Add event listener for shop button container
        const shopButtonContainer = document.querySelector('.shop-button-container');
        if (shopButtonContainer) {
            shopButtonContainer.addEventListener('click', () => {
                // Prefer callback so main can populate shop data
                if (this.onShopClick) this.onShopClick(); else this.showShop();
            });
        }

        document.getElementById('howToPlayBtn').addEventListener('click', () => {
            this.showHowToPlay();
        });

        // How to play
        document.getElementById('backBtn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Mode selection
        document.getElementById('singlePlayerBtn').addEventListener('click', () => {
            this.onStartGame && this.onStartGame('single');
        });

        document.getElementById('multiplayerBtn').addEventListener('click', () => {
            this.showMultiplayerOptions();
        });

        document.getElementById('shopBtn').addEventListener('click', () => {
            if (this.onShopClick) this.onShopClick(); else this.showShop();
        });

        document.getElementById('backToMainBtn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Multiplayer options
        document.getElementById('friendModeBtn').addEventListener('click', () => {
            this.showFriendMode();
        });

        document.getElementById('randomMatchBtn').addEventListener('click', () => {
            this.onRandomMatchClick && this.onRandomMatchClick();
        });

        document.getElementById('backToModeBtn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Friend mode
        document.getElementById('hostGameBtn').addEventListener('click', () => {
            console.log('[UI] Host game button clicked');
            // Prevent multiple rapid clicks
            const btn = document.getElementById('hostGameBtn');
            btn.disabled = true;
            setTimeout(() => {
                btn.disabled = false;
            }, 2000); // Re-enable after 2 seconds
            
            this.onHostClick && this.onHostClick();
        });

        document.getElementById('joinGameBtn').addEventListener('click', () => {
            this.showJoinGame();
        });

        document.getElementById('backToMultiBtn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Host lobby
        document.getElementById('copyCodeBtn').addEventListener('click', () => {
            this.copyRoomCode();
        });

        document.getElementById('startMatchBtn').addEventListener('click', () => {
            this.onStartMatchClick && this.onStartMatchClick();
        });

        document.getElementById('cancelHostBtn').addEventListener('click', () => {
            this.onCancelHostClick && this.onCancelHostClick();
            this.showMainMenu();
        });

        // Join game
        document.getElementById('joinRoomBtn').addEventListener('click', () => {
            const codeInput = document.getElementById('roomCodeInput');
            this.onJoinRoomClick && this.onJoinRoomClick(codeInput.value);
        });

        document.getElementById('cancelJoinBtn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Random match
        document.getElementById('cancelMatchBtn').addEventListener('click', () => {
            this.onCancelMatchClick && this.onCancelMatchClick();
            this.showMainMenu();
        });

        // Shop
        document.getElementById('backFromShopBtn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Profile
        document.getElementById('backToMainFromProfile').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Save player name from profile screen
        const saveNameBtn = document.getElementById('savePlayerNameBtn');
        if (saveNameBtn) {
            saveNameBtn.addEventListener('click', () => {
                const input = document.getElementById('playerNameInput');
                const name = input ? input.value.trim() : '';
                if (name && this.onSaveProfileName) {
                    this.onSaveProfileName(name);
                }
            });
        }

        // Lock name checkbox
        const lockCheckbox = document.getElementById('lockNameCheckbox');
        if (lockCheckbox) {
            lockCheckbox.addEventListener('change', (e) => {
                if (this.onToggleProfileLock) this.onToggleProfileLock(e.target.checked);
                this.setProfileLocked(e.target.checked);
            });
        }

        // Avatar upload
        const avatarInput = document.getElementById('avatarUploadInput');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    const dataUrl = reader.result;
                    if (this.onSaveProfileAvatar) this.onSaveProfileAvatar(dataUrl);
                    // show preview
                    const preview = document.getElementById('avatarPreview');
                    if (preview) preview.innerHTML = `<img src="${dataUrl}" style="width:64px;height:64px;border-radius:8px;">`;
                };
                reader.readAsDataURL(file);
            });
        }

        // Results
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.showModeSelection();
        });

        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.showMainMenu();
        });
    }

    showMainMenu() {
        this.hideAll();
        this.mainMenu.classList.add('active');
    }

    showHowToPlay() {
        this.hideAll();
        this.howToPlayScreen.classList.add('active');
    }

    showModeSelection() {
        this.hideAll();
        this.modeSelectionScreen.classList.add('active');
    }

    showMultiplayerOptions() {
        this.hideAll();
        this.multiplayerOptionsScreen.classList.add('active');
    }

    showFriendMode() {
        this.hideAll();
        this.friendModeScreen.classList.add('active');
    }

    showHostLobby(fullCode) {
        this.hideAll();
        this.hostLobbyScreen.classList.add('active');

        // Store and display FULL code
        this.currentRoomCode = fullCode;
        document.getElementById('roomCodeDisplay').textContent = fullCode;
        document.getElementById('copyStatus').textContent = '';

        console.log('Host lobby showing code:', fullCode);

        // Hide start button if we are not the host
        // Note: Logic needs to know if we are host. We can infer this or pass it.
        const startBtn = document.getElementById('startMatchBtn');
        const settingsDiv = document.querySelector('.match-settings');
        // By default show, main.js will hide if joined
        startBtn.classList.remove('hidden-btn');
        if (settingsDiv) settingsDiv.style.display = 'block';
    }

    showJoinedLobby(fullCode) {
        this.hideAll();
        this.hostLobbyScreen.classList.add('active');
        this.currentRoomCode = fullCode;
        document.getElementById('roomCodeDisplay').textContent = fullCode;

        // Hide host-only controls
        document.getElementById('startMatchBtn').classList.add('hidden-btn');
        const settingsDiv = document.querySelector('.match-settings');
        if (settingsDiv) settingsDiv.style.display = 'none';

        document.getElementById('copyStatus').textContent = 'Waiting for host to start...';
        document.getElementById('copyStatus').style.color = '#00F0FF';
    }

    showJoinGame() {
        this.hideAll();
        this.joinGameScreen.classList.add('active');
        document.getElementById('roomCodeInput').value = '';
        document.getElementById('joinError').textContent = '';
    }

    showRandomMatch() {
        this.hideAll();
        this.randomMatchScreen.classList.add('active');
        document.getElementById('matchStatus').textContent = 'Searching for opponents...';
    }

    showShop() {
        this.hideAll();
        this.shopScreen.classList.add('active');
    }

    showProfile() {
        this.hideAll();
        this.profileScreen.classList.add('active');
        // Call the callback to update profile display
        if (this.onProfileUpdate) {
            this.onProfileUpdate();
        }
        // Ensure lock state and preview are in sync if callbacks provide data
        if (this.onRequestProfileState) {
            const state = this.onRequestProfileState();
            const lock = state && state.lockName;
            const avatar = state && state.avatar;
            this.setProfileLocked(Boolean(lock));
            const preview = document.getElementById('avatarPreview');
            if (preview) preview.innerHTML = avatar ? `<img src="${avatar}" style="width:64px;height:64px;border-radius:8px;">` : '';

            // Also update main menu profile icon if available
            const menuProfileIcon = document.querySelector('.main-menu-profile .profile-image');
            if (menuProfileIcon && avatar) {
                menuProfileIcon.innerHTML = `<img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }
        }
    }

    setProfileLocked(locked) {
        const input = document.getElementById('playerNameInput');
        const saveBtn = document.getElementById('savePlayerNameBtn');
        const lockCheckbox = document.getElementById('lockNameCheckbox');
        if (input) input.disabled = locked;
        if (saveBtn) saveBtn.disabled = locked;
        if (lockCheckbox) lockCheckbox.checked = locked;
    }

    showGame() {
        this.hideAll();
        this.gameCanvas.classList.add('active');
        this.gameHUD.classList.add('active');
        // Hide in-game profile during gameplay
        const inGameProfile = document.getElementById('inGameProfile');
        if (inGameProfile) {
            inGameProfile.classList.remove('active');
        }
    }

    showResults(playerWon, player, coinsEarned = 0, allPlayers = []) {
        this.hideAll();
        this.resultsScreen.classList.add('active');

        const title = document.getElementById('resultTitle');
        title.textContent = playerWon ? 'VICTORY!' : 'DEFEAT';
        title.className = 'result-title ' + (playerWon ? 'victory' : 'defeat');

        document.getElementById('finalKills').textContent = player.kills;
        document.getElementById('finalDeaths').textContent = player.deaths;
        document.getElementById('finalAccuracy').textContent = '100%';

        // Show coins earned
        const coinsDisplay = document.getElementById('coinsEarned');
        if (coinsDisplay) {
            coinsDisplay.textContent = `+${coinsEarned} 💰`;
        }

        // Show leaderboard for multiplayer matches
        if (allPlayers && allPlayers.length > 1) {
            const leaderboardContainer = document.getElementById('leaderboardContainer');
            const matchLeaderboard = document.getElementById('matchLeaderboard');
            
            if (leaderboardContainer && matchLeaderboard) {
                // Sort players by kills (descending)
                const sortedPlayers = [...allPlayers].sort((a, b) => (b.kills || 0) - (a.kills || 0));
                
                // Clear previous content
                leaderboardContainer.innerHTML = '';
                
                // Add each player to the leaderboard
                sortedPlayers.forEach((p, index) => {
                    const entry = document.createElement('div');
                    entry.className = 'leaderboard-entry';
                    
                    // Highlight winners (top players)
                    if (index === 0) {
                        entry.classList.add('winner');
                    }
                    
                    entry.innerHTML = `
                        <div class="leaderboard-rank">${index + 1}</div>
                        <div class="leaderboard-name">${p.name || 'Player'}</div>
                        <div class="leaderboard-kills">${p.kills || 0}</div>
                    `;
                    
                    leaderboardContainer.appendChild(entry);
                });
                
                // Show the leaderboard
                matchLeaderboard.style.display = 'block';
            }
        } else {
            // Hide leaderboard for single player matches
            const matchLeaderboard = document.getElementById('matchLeaderboard');
            if (matchLeaderboard) {
                matchLeaderboard.style.display = 'none';
            }
        }
    }

    hideAll() {
        this.mainMenu.classList.remove('active');
        this.howToPlayScreen.classList.remove('active');
        this.modeSelectionScreen.classList.remove('active');
        this.multiplayerOptionsScreen.classList.remove('active');
        this.friendModeScreen.classList.remove('active');
        this.hostLobbyScreen.classList.remove('active');
        this.joinGameScreen.classList.remove('active');
        this.randomMatchScreen.classList.remove('active');
        this.shopScreen.classList.remove('active');
        this.profileScreen.classList.remove('active');
        this.gameCanvas.classList.remove('active');
        this.gameHUD.classList.remove('active');
        this.resultsScreen.classList.remove('active');

        // Also hide in-game profile
        const inGameProfile = document.getElementById('inGameProfile');
        if (inGameProfile) {
            inGameProfile.classList.remove('active');
        }
    }

    updateHUD(player) {
        // Update health
        const healthPercent = (player.hp / player.maxHp) * 100;
        this.healthBar.style.width = healthPercent + '%';
        this.healthText.textContent = Math.ceil(player.hp) + '/' + player.maxHp;

        // Health bar color
        if (healthPercent > 60) {
            this.healthBar.className = 'health-bar';
        } else if (healthPercent > 30) {
            this.healthBar.className = 'health-bar medium';
        } else {
            this.healthBar.className = 'health-bar low';
        }

        // Update weapon
        const weapon = WEAPONS[player.weapon];
        this.weaponName.textContent = weapon.name;

        if (player.ammo === Infinity) {
            this.ammoCount.textContent = '∞';
        } else {
            this.ammoCount.textContent = player.ammo;
        }

        // Update kills
        const killEl = document.getElementById('killCount');
        if (killEl) {
            killEl.textContent = player.kills;
        }
    }

    updatePlayerList(players) {
        const container = document.getElementById('playerListContainer');
        container.innerHTML = '';

        // Show current count (HTML contains the '/6' suffix)
        document.getElementById('playerCount').textContent = players.length;

        players.forEach(player => {
            const item = document.createElement('div');
            item.className = 'player-item' + (player.isHost ? ' host' : '');
            item.innerHTML = `
                <div class="player-name">
                    ${player.name}
                    ${player.isHost ? '<span class="host-badge">👑 HOST</span>' : ''}
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateShop(shop) {
        console.log('🔄 Updating shop with characters:', shop.getAllCharacters());
        // Update currency displays
        document.getElementById('shopCoins').textContent = shop.getCoins();
        document.getElementById('shopDiamonds').textContent = shop.getDiamonds();

        const container = document.getElementById('shopCharactersContainer');
        container.innerHTML = '';

        const characters = shop.getAllCharacters();
        const equippedId = shop.getEquippedCharacter();

        // Always use 'all' characters regardless of tab selection
        Object.values(characters).forEach(char => {
            const owned = shop.ownsCharacter(char.id);
            const equipped = char.id === equippedId;
            console.log('🖼️ Adding character to shop:', char.name, 'Sprite:', char.sprite, 'Owned:', owned);

            const charCard = document.createElement('div');
            charCard.className = `character-card ${char.type} ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;

            // Add premium glow for premium characters
            if (char.aura) {
                charCard.style.boxShadow = `0 0 20px ${char.aura.color}, 0 0 40px ${char.aura.glow}`;
            }

            charCard.innerHTML = `
                <div class="character-preview">
                    <img src="${char.shopImage || char.sprite}" alt="${char.name}" class="character-sprite" onload="console.log('✅ Loaded character image:', '${char.shopImage || char.sprite}')" onerror="this.onerror=null;this.src='assets/characters/free/default_fighter.png';console.error('❌ Failed to load character image, using fallback:', '${char.shopImage || char.sprite}')">
                    ${char.type === 'premium' ? '<div class="premium-badge">💎 PREMIUM</div>' : ''}
                    ${equipped ? '<div class="equipped-badge">✓ EQUIPPED</div>' : ''}
                </div>
                <div class="character-info">
                    <h3>${char.name}</h3>
                    <p>${char.description}</p>
                    <div class="character-price">
                        ${char.type === 'default' ? '<span class="free-text">DEFAULT</span>' :
                    char.currency === 'coins' ? `<span class="price-coins">💰 ${char.price}</span>` :
                        `<span class="price-diamonds">💎 ${char.price}</span>`}
                    </div>
                </div>
                <button class="btn btn-character ${owned ? 'btn-equip' : 'btn-buy'}" data-char="${char.id}">
                    ${owned ? (equipped ? 'EQUIPPED' : 'EQUIP') : 'BUY'}
                </button>
            `;

            container.appendChild(charCard);

            // Add click handler
            const btn = charCard.querySelector('.btn-character');
            btn.onclick = () => {
                if (owned) {
                    // Equip character
                    shop.equipCharacter(char.id);
                    this.updateShop(shop);
                } else {
                    // Buy character
                    const result = shop.buyCharacter(char.id);
                    if (result.success) {
                        this.updateShop(shop);
                        alert(`${char.name} unlocked!`);
                    } else {
                        alert(result.message);
                    }
                }
            };
        });

        // Watch ad button
        const watchAdBtn = document.getElementById('watchAdBtn');
        if (watchAdBtn) {
            watchAdBtn.onclick = () => {
                const reward = shop.watchAd();
                alert(`You earned ${reward} diamonds! 💎`);
                this.updateShop(shop);
            };
        }
    }

    updateProfileDisplay() {
        // This method will be called by main.js when the profile data is available
        const profile = this.onRequestProfileState ? this.onRequestProfileState() : null;
        if (profile) {
            // Update Main Menu Profile
            const menuName = document.querySelector('.main-menu-profile .profile-details'); // Text container could be updated if we had a specific element for name

            // Update Avatar in Main Menu
            const menuProfileIcon = document.querySelector('.main-menu-profile .profile-image');
            if (menuProfileIcon && profile.avatar) {
                menuProfileIcon.innerHTML = `<img src="${profile.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }

            // Update In-Game Profile
            const inGameIcon = document.querySelector('.in-game-profile .profile-image');
            if (inGameIcon && profile.avatar) {
                inGameIcon.innerHTML = `<img src="${profile.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }

            // Update Profile Screen
            const profileNameScreen = document.getElementById('playerName');
            if (profileNameScreen) profileNameScreen.textContent = profile.name || 'Player';

            // Update Profile Screen Big Avatar
            const profileScreenAvatar = document.querySelector('#profileScreen .profile-avatar');
            if (profileScreenAvatar && profile.avatar) {
                profileScreenAvatar.innerHTML = `<img src="${profile.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else if (profileScreenAvatar) {
                profileScreenAvatar.textContent = '👤';
            }

            // Update Stats
            if (profile.stats) {
                if (document.getElementById('totalKills')) document.getElementById('totalKills').textContent = profile.stats.totalKills;
                if (document.getElementById('totalDeaths')) document.getElementById('totalDeaths').textContent = profile.stats.totalDeaths;
                if (document.getElementById('matchesPlayed')) document.getElementById('matchesPlayed').textContent = profile.stats.matchesPlayed;
                if (document.getElementById('wins')) document.getElementById('wins').textContent = profile.stats.wins;
            }

            // Update HUD name potentially if we had one
        }

        if (this.onProfileUpdate) {
            this.onProfileUpdate();
        }
    }

    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        this.matchTimer.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    showJoinError(message) {
        const errorEl = document.getElementById('joinError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
        
        // Also log to console for debugging
        console.error('[UI] Join error displayed:', message);
    }

    copyRoomCode() {
        if (!this.currentRoomCode) return;

        // Try to use the Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(this.currentRoomCode).then(() => {
                const statusEl = document.getElementById('copyStatus');
                statusEl.textContent = 'Copied to clipboard!';
                statusEl.style.color = '#00FF88';

                setTimeout(() => {
                    statusEl.textContent = '';
                }, 3000);
            }).catch(err => {
                console.error('Failed to copy using Clipboard API: ', err);
                // Fallback to manual copy method
                this.fallbackCopyTextToClipboard(this.currentRoomCode);
            });
        } else {
            // Fallback for non-secure contexts or older browsers
            this.fallbackCopyTextToClipboard(this.currentRoomCode);
        }
    }

    // Fallback method for copying text when Clipboard API is not available
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            const statusEl = document.getElementById('copyStatus');
            if (successful) {
                statusEl.textContent = 'Copied to clipboard!';
                statusEl.style.color = '#00FF88';
            } else {
                statusEl.textContent = 'Press Ctrl+C to copy';
                statusEl.style.color = '#FFFF00';
            }
            
            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            const statusEl = document.getElementById('copyStatus');
            statusEl.textContent = 'Press Ctrl+C to copy';
            statusEl.style.color = '#FFFF00';
            
            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
        }
        
        document.body.removeChild(textArea);
    }

    getMatchDuration() {
        const select = document.getElementById('matchDuration');
        return parseInt(select.value);
    }
}