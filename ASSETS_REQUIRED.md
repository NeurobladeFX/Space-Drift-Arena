# Asset filenames required for 10 Minimalist Levels

Provide the following files using exactly the filenames below (place files in the same folder paths). Use the `assets/` folders in the repository.

## Per-level required files (10 levels)

For each level with id `{levelId}` supply the following files (replace `{levelId}` with the level id below):

- `assets/backgrounds/background_{levelId}.svg` (preferred) or `assets/backgrounds/background_{levelId}.png`
- `assets/arenas/arena_{levelId}_visual.svg`
- `assets/arenas/arena_{levelId}_mask.png`  (monochrome collision mask; white = solid)
- `assets/arenas/arena_{levelId}_decor.png` (optional decor/parallax layer with transparency)
- `assets/backgrounds/thumb_{levelId}.png` (512x512 thumbnail for level selector)
- `assets/sounds/level_{levelId}_amb.ogg` (loopable ambient music, 8–30s)
- `assets/particles/particle_{levelId}.png` (small particle or VFX sprite)

Additionally, for gameplay (platforms, open buildings, and jungle cover) provide these per-level assets:

- `assets/platforms/platform_tile_{levelId}_01.png` (128x32) and `platform_tile_{levelId}_02.png` (64x16)
- `assets/blocks/block_{levelId}_open_{n}.png` (open/half-wall building facades — no closed rooms)
- `assets/overlays/tree_canopy_{levelId}_{n}.png` (side-view canopy used above platforms for hiding)
- `assets/overlays/tree_trunk_{levelId}_{n}.png` (trunk + vines)
- `assets/masks/cover_mask_{levelId}.png` (alpha mask marking cover/hide areas; white = cover)
- `assets/particles/leaf_{levelId}_{n}.png` (small falling leaf particle)

Note: "open" buildings must have visible gaps/doorways so players can pass through — avoid fully enclosed rooms. Tree canopy assets should be layered PNGs with transparency so they can be placed over platform tops to allow hiding.

Level IDs (use these exact ids for filenames):

- neon_void
- crystal_cavern
- rusty_outpost
- high_tower
- jungle_ruins
- volcanic_base
- cyber_city
- frozen_waste
- space_station
- shadow_dimension

## Global assets (one copy each)

- `assets/characters/char_player_blue_sprites.png` (+ optional `char_player_blue_sprites@2x.png`)
- `assets/characters/char_player_blue.json` (sprite frame definitions)
- `assets/characters/char_player_red_sprites.png`
- `assets/characters/char_player_red.json`
- `assets/weapons/weapon_pistol.png`
- `assets/weapons/weapon_shotgun.png`
- `assets/weapons/weapon_assault_rifle.png`
- `assets/weapons/weapon_sniper.png`
- `assets/weapons/weapon_rocket_launcher.png`
- `assets/weapons/projectile_pistol_01.png`
- `assets/weapons/projectile_shotgun_01.png`
- `assets/ui/ui_icon_shop.svg`
- `assets/ui/ui_icon_play.svg`
- `assets/ui/ui_icon_back.svg`
- `assets/ui/hud_health_bar.svg`
- `assets/particles/particle_generic.png` (small particle sprite used for hits/explosions)
- `assets/sounds/sfx_fire_01.ogg`
- `assets/sounds/sfx_hit_01.ogg`
- `assets/sounds/sfx_pickup_01.ogg`
- `assets/fonts/geometric-sans.woff2`

## Generator prompts and naming conventions

- Use lowercase, underscores, and exact `{levelId}` strings to match loader mapping.
- Preferred formats: PNG (transparent) for tiles/overlays/masks; SVG for scalable backgrounds and UI icons; OGG for audio loops.

Paste-ready prompt templates (short):

- Platform tile (128x32):
	"128x32 PNG, flat 2D side-view platform tile, minimalitra style, neon pastel palette, clean silhouette, slight bevel hint, transparent background. Save as `platform_tile_{levelId}_01.png`."

- Open building facade (256x256):
	"256x256 PNG, side-view building facade with open interiors and doorways, no enclosed rooms, minimalitra aesthetic, simplified interior silhouettes, transparent background. Save as `block_{levelId}_open_01.png`."

- Tree canopy (1024x1024):
	"1024x1024 PNG, side-view tree canopy for platform-top hiding, layered flat leaves, hanging vines, minimalitra neon greens, transparent background, soft shadow. Save as `tree_canopy_{levelId}_01.png`."

- Tree trunk/vines (512x512):
	"512x512 PNG, side-view tree trunk and hanging vines, simplified shapes, transparent background. Save as `tree_trunk_{levelId}_01.png`."

- Leaf particle (64x64):
	"64x64 PNG, stylized leaf particle, flat color, slight glow, transparent background. Save as `leaf_{levelId}_01.png`."

- Pickup icon (128x128):
	"128x128 PNG, minimal flat pickup icon (health/weapon), strong silhouette, unique color, transparent background. Save as `pickup_health_{levelId}.png` (example)."

## Example filenames for `neon_void` (copy/paste):

- `assets/arenas/arena_neon_void_visual.png`
- `assets/arenas/arena_neon_void_mask.png`
- `assets/backgrounds/background_neon_void.svg`
- `assets/backgrounds/thumb_neon_void.png`
- `assets/platforms/platform_tile_neon_void_01.png`
- `assets/blocks/block_neon_void_open_01.png`
- `assets/overlays/tree_canopy_neon_void_01.png`
- `assets/particles/leaf_neon_void_01.png`
- `assets/pickups/pickup_health_neon_void.png`
- `assets/weapons/weapon_rocket_neon_void.png`
- `assets/sounds/amb_neon_void.ogg`

## Quick notes for uploads

- Place files under the existing `assets/` folders. Filenames must match exactly for the automatic loader to pick them up.
- For jungle levels where you want hiding on platforms, upload one or more `tree_canopy` PNGs and a `cover_mask` to indicate which parts of the canopy provide concealment.
- If you want, I can generate lightweight placeholder PNGs matching these filenames so you can test placements immediately.

## Folder mapping (where to put files in repo)

- Backgrounds: `assets/backgrounds/`
- Arenas: `assets/arenas/`
- Characters: `assets/characters/`
- UI: `assets/ui/`
- Weapons: `assets/weapons/`
- Particles: `assets/particles/`
- Sounds: `assets/sounds/`

## Notes / Hints

- Use `SVG` for scalable backgrounds, UI and icons. Provide `PNG` fallback for raster-only art.
- Character sprites: provide 1x and optional 2x (`@2x`) for HiDPI.
- Collision masks must match visual arena geometry and be same resolution as arena visuals.
- Keep file names exact to allow automated mapping by the project's loader.

If you want, I can create minimal placeholder PNG/SVGs with these names so you can upload your art and test quickly.
