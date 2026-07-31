import { LEVELS } from './config.js';

// Generate expected asset filenames for each level using the project's naming convention.
export function buildAssetManifest() {
    const manifest = {};
    for (const level of LEVELS) {
        const id = level.id;
        manifest[id] = {
            background_svg: `assets/backgrounds/background_${id}.svg`,
            background_png: `assets/backgrounds/background_${id}.png`,
            arena_visual: `assets/arenas/arena_${id}_visual.svg`,
            arena_mask: `assets/arenas/arena_${id}_mask.png`,
            arena_decor: `assets/arenas/arena_${id}_decor.png`,
            thumbnail: `assets/backgrounds/thumb_${id}.png`,
            music: `assets/sounds/level_${id}_amb.ogg`,
            particle: `assets/particles/particle_${id}.png`
        };
    }
    return manifest;
}

export const ASSET_MANIFEST = buildAssetManifest();

export function getFilesForLevel(levelId) {
    return ASSET_MANIFEST[levelId] || null;
}

export function getAllRequiredFiles() {
    // Flatten manifest into a set of unique file paths
    const files = new Set();
    for (const id of Object.keys(ASSET_MANIFEST)) {
        const entry = ASSET_MANIFEST[id];
        for (const key of Object.keys(entry)) files.add(entry[key]);
    }
    // Add global required assets
    [
        'assets/characters/char_player_blue_sprites.png',
        'assets/characters/char_player_blue.json',
        'assets/characters/char_player_red_sprites.png',
        'assets/weapons/weapon_pistol.png',
        'assets/ui/ui_icon_shop.svg',
        'assets/particles/particle_generic.png',
        'assets/sounds/sfx_fire_01.ogg',
        'assets/fonts/geometric-sans.woff2'
    ].forEach(p => files.add(p));

    return Array.from(files);
}
