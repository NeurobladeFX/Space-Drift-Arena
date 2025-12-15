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
