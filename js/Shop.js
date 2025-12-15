export class Shop {
    constructor() {
        this.coins = this.loadCoins();
        this.diamonds = this.loadDiamonds();
        this.ownedCharacters = this.loadOwnedCharacters();
        this.equippedCharacter = this.loadEquippedCharacter();

        // Profile data
        this.profile = this.loadProfile();

        // Character catalog
        this.characters = {
            // Default character (always owned)
            default_soldier: {
                id: 'default_soldier',
                name: 'Default Soldier',
                type: 'default',
                price: 0,
                currency: 'none',
                sprite: 'assets/characters/free/default_fighter.png',
                shopImage: 'assets/characters/free/default_fighter_show.png',
                description: 'Standard issue fighter',
                aura: null
            },

            // Free characters (buy with coins)
            astronaut: {
                id: 'astronaut',
                name: 'Astronaut',
                type: 'free',
                price: 500,
                currency: 'coins',
                sprite: 'assets/characters/free/Astronaut.png',
                shopImage: 'assets/characters/free/Astronaut_show.png',
                description: 'Space explorer',
                aura: null
            },
            hacker: {
                id: 'hacker',
                name: 'Hacker',
                type: 'free',
                price: 750,
                currency: 'coins',
                sprite: 'assets/characters/free/Hacker.png',
                shopImage: 'assets/characters/free/Hacker_show.png',
                description: 'Digital warrior',
                aura: null
            },
            joker: {
                id: 'joker',
                name: 'Joker',
                type: 'free',
                price: 1000,
                currency: 'coins',
                sprite: 'assets/characters/free/joker.png',
                shopImage: 'assets/characters/free/joker_show.png',
                description: 'Chaos incarnate',
                aura: null
            },
            knight: {
                id: 'knight',
                name: 'Knight',
                type: 'free',
                price: 1250,
                currency: 'coins',
                sprite: 'assets/characters/free/Knight.png',
                shopImage: 'assets/characters/free/Knight_show.png',
                description: 'Medieval warrior',
                aura: null
            },
            ninja: {
                id: 'ninja',
                name: 'Ninja',
                type: 'free',
                price: 1500,
                currency: 'coins',
                sprite: 'assets/characters/free/Ninja.png',
                shopImage: 'assets/characters/free/Ninja_show.png',
                description: 'Silent assassin',
                aura: null
            },
            pirate: {
                id: 'pirate',
                name: 'Pirate',
                type: 'free',
                price: 1750,
                currency: 'coins',
                sprite: 'assets/characters/free/Pirate.png',
                shopImage: 'assets/characters/free/Pirate_show.png',
                description: 'Sea raider',
                aura: null
            },
            robot: {
                id: 'robot',
                name: 'Robot',
                type: 'free',
                price: 2000,
                currency: 'coins',
                sprite: 'assets/characters/free/Robot.png',
                shopImage: 'assets/characters/free/Robot_show.png',
                description: 'Mechanical fighter',
                aura: null
            },
            santa: {
                id: 'santa',
                name: 'Santa Claus',
                type: 'free',
                price: 2500,
                currency: 'coins',
                sprite: 'assets/characters/free/Santa_Claus.png',
                shopImage: 'assets/characters/free/Santa_Claus_show.png',
                description: 'Holiday hero',
                aura: null
            },
            vampire: {
                id: 'vampire',
                name: 'Vampire',
                type: 'free',
                price: 3000,
                currency: 'coins',
                sprite: 'assets/characters/free/Vampire.png',
                shopImage: 'assets/characters/free/Vampire_show.png',
                description: 'Creature of the night',
                aura: null
            },

            // Premium characters (buy with diamonds)
            king: {
                id: 'king',
                name: 'King',
                type: 'premium',
                price: 100,
                currency: 'diamonds',
                sprite: 'assets/characters/premium/King.png',
                shopImage: 'assets/characters/premium/King_show.png',
                description: 'Royal ruler',
                aura: {
                    color: '#FFD700',
                    glow: '#FFA500',
                    intensity: 'high'
                }
            },
            ice_queen: {
                id: 'ice_queen',
                name: 'Diamond Ice Queen',
                type: 'premium',
                price: 150,
                currency: 'diamonds',
                sprite: 'assets/characters/premium/Diamond_Ice_Queen.png',
                shopImage: 'assets/characters/premium/Diamond_Ice_Queen_show.png',
                description: 'Frozen majesty',
                aura: {
                    color: '#00D4FF',
                    glow: '#B800FF',
                    intensity: 'high'
                }
            }
        };
    }

    // Load/Save methods
    loadCoins() {
        const saved = localStorage.getItem('spaceDrift_coins');
        return saved ? parseInt(saved) : 500; // Start with 500 coins
    }

    saveCoins() {
        localStorage.setItem('spaceDrift_coins', this.coins.toString());
    }

    loadDiamonds() {
        const saved = localStorage.getItem('spaceDrift_diamonds');
        return saved ? parseInt(saved) : 0; // Start with 0 diamonds
    }

    saveDiamonds() {
        localStorage.setItem('spaceDrift_diamonds', this.diamonds.toString());
    }

    loadOwnedCharacters() {
        const saved = localStorage.getItem('spaceDrift_ownedCharacters');
        return saved ? JSON.parse(saved) : ['default_soldier']; // Always own default
    }

    saveOwnedCharacters() {
        localStorage.setItem('spaceDrift_ownedCharacters', JSON.stringify(this.ownedCharacters));
    }

    loadEquippedCharacter() {
        const saved = localStorage.getItem('spaceDrift_equippedCharacter');
        return saved || 'default_soldier';
    }

    saveEquippedCharacter() {
        localStorage.setItem('spaceDrift_equippedCharacter', this.equippedCharacter);
    }

    // Profile methods
    loadProfile() {
        const saved = localStorage.getItem('spaceDrift_profile');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            name: 'Player',
            level: 1,
            avatar: null,
            lockName: false,
            xp: 0,
            xpToNext: 100,
            badges: {
                beginner: { unlocked: true, name: "Beginner", desc: "Started playing" },
                warrior: { unlocked: false, name: "Warrior", desc: "Win 5 matches" },
                champion: { unlocked: false, name: "Champion", desc: "Win 10 matches" },
                legend: { unlocked: false, name: "Legend", desc: "Win 25 matches" },
                sharpshooter: { unlocked: false, name: "Sharpshooter", desc: "Get 50 kills" },
                survivor: { unlocked: false, name: "Survivor", desc: "Survive 100 deaths" },
                collector: { unlocked: false, name: "Collector", desc: "Own all characters" },
                master: { unlocked: false, name: "Master", desc: "Reach level 10" }
            },
            stats: {
                totalKills: 0,
                totalDeaths: 0,
                matchesPlayed: 0,
                wins: 0
            }
        };
    }

    saveProfile() {
        localStorage.setItem('spaceDrift_profile', JSON.stringify(this.profile));
    }

    // Currency methods
    addCoins(amount) {
        this.coins += amount;
        this.saveCoins();
    }

    addDiamonds(amount) {
        this.diamonds += amount;
        this.saveDiamonds();
    }

    getCoins() {
        return this.coins;
    }

    getDiamonds() {
        return this.diamonds;
    }

    // Character methods
    ownsCharacter(characterId) {
        return this.ownedCharacters.includes(characterId);
    }

    buyCharacter(characterId) {
        const character = this.characters[characterId];

        if (!character) {
            return { success: false, message: 'Character not found' };
        }

        if (this.ownsCharacter(characterId)) {
            return { success: false, message: 'Already owned' };
        }

        // Check currency
        if (character.currency === 'coins') {
            if (this.coins < character.price) {
                return { success: false, message: 'Insufficient coins' };
            }
            this.coins -= character.price;
            this.saveCoins();
        } else if (character.currency === 'diamonds') {
            if (this.diamonds < character.price) {
                return { success: false, message: 'Insufficient diamonds' };
            }
            this.diamonds -= character.price;
            this.saveDiamonds();
        }

        // Add to owned characters
        this.ownedCharacters.push(characterId);
        this.saveOwnedCharacters();

        // Check for collector badge
        this.checkBadgeUnlocks();

        return { success: true, message: 'Character unlocked!' };
    }

    equipCharacter(characterId) {
        if (this.ownsCharacter(characterId)) {
            this.equippedCharacter = characterId;
            this.saveEquippedCharacter();
            return true;
        }
        return false;
    }

    getEquippedCharacter() {
        return this.equippedCharacter;
    }

    getCharacterData(characterId) {
        return this.characters[characterId];
    }

    getAllCharacters() {
        return this.characters;
    }

    // XP and leveling
    addXP(amount) {
        this.profile.xp += amount;

        while (this.profile.xp >= this.profile.xpToNext) {
            this.profile.xp -= this.profile.xpToNext;
            this.profile.level++;
            this.profile.xpToNext = Math.floor(this.profile.xpToNext * 1.5);

            // Award diamonds on level up
            this.addDiamonds(5);
            console.log(`Level up! Now level ${this.profile.level}. Earned 5 diamonds!`);
        }

        this.checkBadgeUnlocks();
        this.saveProfile();
    }

    // Stats tracking
    updateStats(kills = 0, deaths = 0, matchPlayed = false, won = false) {
        this.profile.stats.totalKills += kills;
        this.profile.stats.totalDeaths += deaths;

        if (matchPlayed) {
            this.profile.stats.matchesPlayed++;
        }

        if (won) {
            this.profile.stats.wins++;
            // Award diamonds for wins
            this.addDiamonds(2);
        }

        // Award coins for kills
        this.addCoins(kills * 10);

        this.checkBadgeUnlocks();
        this.saveProfile();
    }

    checkBadgeUnlocks() {
        const badges = this.profile.badges;
        const stats = this.profile.stats;

        if (!badges.warrior.unlocked && stats.wins >= 5) {
            badges.warrior.unlocked = true;
            this.addDiamonds(10);
        }

        if (!badges.champion.unlocked && stats.wins >= 10) {
            badges.champion.unlocked = true;
            this.addDiamonds(20);
        }

        if (!badges.legend.unlocked && stats.wins >= 25) {
            badges.legend.unlocked = true;
            this.addDiamonds(50);
        }

        if (!badges.sharpshooter.unlocked && stats.totalKills >= 50) {
            badges.sharpshooter.unlocked = true;
            this.addDiamonds(15);
        }

        if (!badges.survivor.unlocked && stats.totalDeaths >= 100) {
            badges.survivor.unlocked = true;
            this.addDiamonds(10);
        }

        if (!badges.collector.unlocked && this.ownedCharacters.length >= Object.keys(this.characters).length) {
            badges.collector.unlocked = true;
            this.addDiamonds(100);
        }

        if (!badges.master.unlocked && this.profile.level >= 10) {
            badges.master.unlocked = true;
            this.addDiamonds(30);
        }
    }

    getProfile() {
        return this.profile;
    }

    // Watch ad to earn diamonds (simulated)
    watchAd() {
        const reward = 5 + Math.floor(Math.random() * 5); // 5-9 diamonds
        this.addDiamonds(reward);
        return reward;
    }
}
