// ===== GAME CONSTANTS =====
export const GAME_CONFIG = {
    // Physics
    FRICTION: 0.98,
    MAX_SPEED: 12,
    BOUNCE_DAMPING: 0.7,

    // Combat
    HP_REGEN_DELAY: 3,      // Seconds
    HP_REGEN_RATE: 5,       // HP per second
    RESPAWN_TIME: 3,        // Seconds
    INVULN_TIME: 2,         // Seconds

    // Map - Even larger size for more challenging gameplay
    MAP_WIDTH: 3840,        // Increased from 2880
    MAP_HEIGHT: 2160,       // Increased from 1620

    // Rendering
    PLAYER_RADIUS: 24,
    PROJECTILE_RADIUS: 4,
    OBSTACLE_COUNT: 6,
    // Time (seconds) to lock player in spawn (prevent movement) after respawn
    SPAWN_LOCK_TIME: 1.2
};

// ===== WEAPON CONFIGURATIONS =====
export const WEAPONS = {
    pistol: {
        name: 'PISTOL',
        damage: 15,
        fireRate: 0.25,         // Slightly slower for realism
        recoil: 2.0,
        bulletSpeed: 15,
        bulletLifetime: 2,
        ammo: Infinity,
        spreadCount: 1,
        spread: 0,
        color: '#00F0FF'
    },

    shotgun: {
        name: 'SHOTGUN',
        damage: 8,
        fireRate: 1.0,          // Slower fire rate for realism
        recoil: 6.0,            // Increased recoil
        bulletSpeed: 12,
        bulletLifetime: 1,
        ammo: 8,                // Limited ammo
        spreadCount: 6,
        spread: 0.2,            // Increased spread
        color: '#FF8800'
    },

    assault_rifle: {
        name: 'ASSAULT RIFLE',
        damage: 18,
        fireRate: 0.12,         // Faster fire rate
        recoil: 1.8,            // Lower recoil for controllable spray
        bulletSpeed: 18,
        bulletLifetime: 2.5,
        ammo: 40,               // Limited ammo
        spreadCount: 1,
        spread: 0.02,           // Slight spread for realism
        color: '#B800FF'
    },

    sniper: {
        name: 'SNIPER',
        damage: 100,            // One-shot kill
        fireRate: 1.8,          // Slow fire rate for charging
        recoil: 9.0,            // High recoil
        bulletSpeed: 30,        // Fast bullet
        bulletLifetime: 4,
        ammo: 4,                // Limited ammo
        spreadCount: 1,
        spread: 0,
        color: '#00AA00'
    },

    rocket_launcher: {
        name: 'ROCKET LAUNCHER',
        damage: 100,            // One-shot kill
        fireRate: 2.5,          // Slow fire rate
        recoil: 12.0,           // Very high recoil
        bulletSpeed: 8,         // Slow bullet for realism
        bulletLifetime: 3,
        ammo: 2,                // Limited ammo
        spreadCount: 1,
        spread: 0,
        color: '#FF0055',
        explosive: true,
        explosionRadius: 80
    },

    Laser: {
        name: 'LASER',
        damage: 12,
        fireRate: 0.08,         // Very fast fire rate
        recoil: 0.3,            // Minimal recoil
        bulletSpeed: 25,        // Fast bullet
        bulletLifetime: 1.2,
        ammo: 60,               // Limited ammo
        spreadCount: 1,
        spread: 0,
        color: '#00FFFF'
    },

    plasma_canon: {
        name: 'PLASMA CANNON',
        damage: 35,
        fireRate: 0.9,          // Moderate fire rate
        recoil: 4.0,            // Moderate recoil
        bulletSpeed: 14,        // Moderate speed
        bulletLifetime: 2.5,
        ammo: 15,               // Limited ammo
        spreadCount: 1,
        spread: 0.05,           // Slight spread
        color: '#8800FF'
    }
};

// ===== LEVEL CONFIGURATIONS =====
export const LEVELS = [
    {
        id: 'neon_void',
        name: 'Neon Void',
        minLevel: 1,
        description: 'Tactical space station with military-grade platforms.',
        // Spawn area (relative fractions of map width/height)
        spawnArea: { x: 0.05, y: 0.05, w: 0.25, h: 0.25 },
        background: '#010103', // Extremely (almost black) dark background
        accentColor: '#00F0FF',
        obstacles: 'platform',
        parallax: [
            { color: 'rgba(0, 240, 255, 0.1)', size: 3, count: 150, speed: 0.15 },
            { color: 'rgba(184, 0, 255, 0.05)', size: 2, count: 100, speed: 0.1 }
        ]
    },
    {
        id: 'neon_void_minimilitia',
        name: 'Neon Void Militia',
        minLevel: 1,
        description: 'Military base with many big blocks and a central tunnel based on blueprint design.',
        spawnArea: { x: 0.05, y: 0.05, w: 0.25, h: 0.25 },
        background: '#010103', // Extremely (almost black) dark background
        accentColor: '#00F0FF',
        obstacles: 'platform',
        parallax: [
            { color: 'rgba(0, 240, 255, 0.1)', size: 3, count: 150, speed: 0.15 },
            { color: 'rgba(184, 0, 255, 0.05)', size: 2, count: 100, speed: 0.1 }
        ]
    },
    {
        id: 'crystal_cavern',
        name: 'Crystal Cavern',
        minLevel: 2,
        description: 'Underground cave filled with glowing crystals.',
        spawnArea: { x: 0.05, y: 0.7, w: 0.25, h: 0.25 },
        background: '#0D0814',
        accentColor: '#B800FF',
        obstacles: 'crystal',
        parallax: [
            { color: 'rgba(184, 0, 255, 0.1)', size: 4, count: 50, speed: 0.15 },
            { color: 'rgba(0, 240, 255, 0.05)', size: 2, count: 150, speed: 0.05 }
        ]
    },
    {
        id: 'rusty_outpost',
        name: 'Rusty Outpost',
        minLevel: 3,
        description: 'Abandoned metal facility with tight corridors.',
        spawnArea: { x: 0.7, y: 0.05, w: 0.25, h: 0.25 },
        background: '#1A0F0A',
        accentColor: '#FF8800',
        obstacles: 'metal_block',
        parallax: [
            { color: 'rgba(255, 136, 0, 0.05)', size: 5, count: 30, speed: 0.2 },
            { color: 'rgba(100, 100, 100, 0.1)', size: 10, count: 20, speed: 0.3 }
        ]
    },
    {
        id: 'high_tower',
        name: 'High Tower',
        minLevel: 4,
        description: 'Battle above the clouds on skyscraper rooftops.',
        spawnArea: { x: 0.7, y: 0.7, w: 0.25, h: 0.25 },
        background: '#0A1A27',
        accentColor: '#00FF88',
        obstacles: 'platform',
        parallax: [
            { color: 'rgba(255, 255, 255, 0.15)', size: 20, count: 15, speed: 0.4 },
            { color: 'rgba(0, 255, 136, 0.05)', size: 2, count: 200, speed: 0.1 }
        ]
    },
    {
        id: 'jungle_ruins',
        name: 'Jungle Ruins',
        minLevel: 5,
        description: 'Overgrown temple ruins with ancient stone pillars.',
        spawnArea: { x: 0.45, y: 0.45, w: 0.15, h: 0.15 },
        background: '#08140A',
        accentColor: '#00FF44',
        obstacles: 'jungle_block',
        parallax: [
            { color: 'rgba(0, 100, 0, 0.2)', size: 8, count: 40, speed: 0.25 },
            { color: 'rgba(100, 255, 100, 0.05)', size: 3, count: 100, speed: 0.1 }
        ]
    },
    {
        id: 'volcanic_base',
        name: 'Volcanic Base',
        minLevel: 6,
        description: 'Facility built inside an active volcano.',
        spawnArea: { x: 0.05, y: 0.45, w: 0.2, h: 0.2 },
        background: '#140808',
        accentColor: '#FF0055',
        obstacles: 'metal_block',
        parallax: [
            { color: 'rgba(255, 0, 85, 0.1)', size: 12, count: 30, speed: 0.3 },
            { color: 'rgba(255, 100, 0, 0.15)', size: 4, count: 60, speed: 0.2 }
        ]
    },
    {
        id: 'cyber_city',
        name: 'Cyber City',
        minLevel: 7,
        description: 'Nighttime cityscape with neon signs and billboards.',
        spawnArea: { x: 0.7, y: 0.45, w: 0.2, h: 0.2 },
        background: '#050510',
        accentColor: '#00D4FF',
        obstacles: 'platform',
        parallax: [
            { color: 'rgba(0, 212, 255, 0.1)', size: 15, count: 25, speed: 0.35 },
            { color: 'rgba(184, 0, 255, 0.1)', size: 10, count: 30, speed: 0.4 }
        ]
    },
    {
        id: 'frozen_waste',
        name: 'Frozen Waste',
        minLevel: 8,
        description: 'Icy landscape with slippery surfaces and glaciers.',
        spawnArea: { x: 0.45, y: 0.05, w: 0.15, h: 0.15 },
        background: '#0A1A27',
        accentColor: '#FFFFFF',
        obstacles: 'crystal',
        parallax: [
            { color: 'rgba(255, 255, 255, 0.2)', size: 5, count: 100, speed: 0.5 },
            { color: 'rgba(200, 240, 255, 0.1)', size: 3, count: 150, speed: 0.2 }
        ]
    },
    {
        id: 'space_station',
        name: 'Space Station',
        minLevel: 9,
        description: 'Inside a massive interstellar space station.',
        spawnArea: { x: 0.4, y: 0.75, w: 0.2, h: 0.2 },
        background: '#101015',
        accentColor: '#FFD700',
        obstacles: 'metal_block',
        parallax: [
            { color: 'rgba(255, 215, 0, 0.05)', size: 2, count: 300, speed: 0.1 },
            { color: 'rgba(100, 100, 100, 0.2)', size: 20, count: 10, speed: 0.6 }
        ]
    },
    {
        id: 'shadow_dimension',
        name: 'Shadow Dimension',
        minLevel: 10,
        description: 'Mysterious realm where shadows come to life.',
        spawnArea: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 },
        background: '#000000',
        accentColor: '#444444',
        obstacles: 'asteroid',
        parallax: [
            { color: 'rgba(50, 50, 50, 0.3)', size: 30, count: 15, speed: 0.8 },
            { color: 'rgba(20, 20, 20, 0.5)', size: 50, count: 10, speed: 1.2 }
        ]
    }
    ,
    {
        id: 'mini_militia_01',
        name: 'Mini Militia Cavern',
        minLevel: 1,
        description: 'Side-view cave / military base optimized for jetpack combat.',
        background: '#08121A',
        accentColor: '#FFCC33',
        obstacles: 'platform',
        parallax: [
            { color: 'rgba(255,204,51,0.06)', size: 6, count: 120, speed: 0.08 }
        ]
    }
];

// ===== COLOR PALETTE =====
export const COLORS = {
    // Backgrounds
    spaceDark: '#0A0E27',
    spaceDeep: '#000000',

    // Neon Accents
    neonCyan: '#00F0FF',
    neonPurple: '#B800FF',
    neonGreen: '#00FF88',
    warningRed: '#FF0055',
    gold: '#FFD700',

    // UI
    uiDark: '#1A1F3A',
    uiLight: '#2D3458',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A8C0',

    // Players
    playerSelf: '#00F0FF',
    playerEnemy: '#FF0055',

    // Obstacles
    obstacle: '#4A5568'
};

// ===== SPAWN POINTS =====
export const SPAWN_POINTS = [
    { x: 500, y: 500 },
    { x: 3340, y: 500 },
    { x: 500, y: 1660 },
    { x: 3340, y: 1660 }
];
