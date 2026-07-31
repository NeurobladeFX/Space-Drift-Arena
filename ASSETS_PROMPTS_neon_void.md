# neon_void — Image Generation Prompts

This file lists ready-to-paste prompts (and filename to save as) for every image asset used by the `neon_void` level. Copy each prompt into your image generator (Stable Diffusion / Midjourney / DALL·E / Leonardo etc.), adjust style/seed as you like, and export as PNG/SVG with the exact filename shown.

---

## 1) Arena visual (side-view panorama)
Filename: `assets/arenas/arena_neon_void_visual.png`
Prompt (PNG, 2048x1024):
"Minimalitra / minimilitra style 2D side-view arena panoramic art; flat layered planes and geometric architecture; neon cyan, deep indigo and soft violet accents; high-contrast silhouettes and subtle grain; simple foreground platforms and open buildings (no closed rooms); empty walkable gaps and visible doorways; balanced negative space for gameplay; transparent edges allowed; clean composition; export as PNG 2048x1024, transparent background."

## 2) Arena mask (collision mask)
Filename: `assets/arenas/arena_neon_void_mask.png`
Prompt (PNG, same resolution as visual):
"Solid silhouette mask for the arena: white = solid (platforms, floors, walls), transparent = passable/void. Match the camera framing and composition of arena_neon_void_visual.png exactly. PNG with transparency."

## 3) Background (parallax layers)
Filename: `assets/backgrounds/background_neon_void.svg` (preferred) or `assets/backgrounds/background_neon_void.png`
Prompt (SVG / 2048x1024 vector):
"Minimal parallax background in minimilitra aesthetic: layered geometric hills, distant neon skyline, soft gradient sky with subtle glow, muted neon palette (indigo → cyan → purple), vector-friendly clean shapes. Export as SVG and also flattened PNG layers (far / mid / near)."

## 4) Thumbnail (level selector)
Filename: `assets/backgrounds/thumb_neon_void.png`
Prompt (PNG 512x256):
"Cropped thumbnail of the neon_void arena with strong silhouette and readable composition at 512x256, minimal texturing, neon cyan accent, PNG."

## 5) Platform tile (world tile)
Filename: `assets/platforms/platform_tile_neon_void_01.png` (also provide `_02.png` 64x16 variant)
Prompt (PNG 128x32 / 64x16):
"128x32 PNG, flat side-view platform tile for neon_void, minimalitra style; clean top edge, subtle beveled highlight, neon-cyan trim and dark military green base; transparent background; lightweight texture/grain. Save as `platform_tile_neon_void_01.png`."

Note: you already uploaded `assets/levels/Platform tile.png`. If you want standard naming, either re-upload using the filename above or I can copy/rename it for you.

## 6) Open building facades / blocks (no closed rooms)
Filename pattern: `assets/blocks/block_neon_void_open_{n}.png` (256x256)
Prompt (PNG 256x256):
"256x256 PNG, side-view building facade with open interiors, doorways, and gaps (no fully enclosed rooms); low-detail interior silhouettes (stairs, crates), geometric windows, neon accent trims; minimalitra palette; transparent background. Save as `block_neon_void_open_01.png`."

## 7) Tree canopy / platform cover (if used on neon_void)
Filename: `assets/overlays/tree_canopy_neon_void_01.png` (1024x1024 layered)
Prompt (PNG 1024x1024):
"1024x1024 PNG, side-view stylized tree canopy for platform-top hiding; layered flat leaf shapes, hanging vines, simplified silhouette, muted neon-greens with cyan highlights, transparent background, soft shadow; separate trunk asset. Save as `tree_canopy_neon_void_01.png`."

## 8) Tree trunk & vines overlay
Filename: `assets/overlays/tree_trunk_neon_void_01.png` (512x512)
Prompt (PNG 512x512):
"512x512 PNG, simplified side-view tree trunk and hanging vines, minimal details, transparent background. Save as `tree_trunk_neon_void_01.png`."

## 9) Cover mask (mark canopy/cover areas)
Filename: `assets/masks/cover_mask_neon_void.png`
Prompt (PNG, same viewport size as arena visual):
"Binary alpha mask marking cover/hide areas: white = cover (where player is considered concealed), transparent = not cover. Match positioning to the canopy overlays. PNG." 

## 10) Particle sprites (leaf, dust)
Filename: `assets/particles/leaf_neon_void_01.png` (64x64) and `assets/particles/particle_neon_void.png`
Prompt (PNG 64x64):
"64x64 PNG, stylized flat leaf particle with neon-green tint and slight glow, transparent background. Save as `leaf_neon_void_01.png`."

## 11) Pickup icons (health / ammo / weapons)
Filename examples: `assets/pickups/pickup_health_neon_void.png`, `assets/weapons/weapon_rocket_neon_void.png` (128x128 / 128x64)
Prompt (PNG 128x128):
"128x128 PNG, minimal flat pickup icon for side-view game (health heart / ammo box / rocket), strong silhouette, single accent color per type (health = green, rocket = orange), transparent background. Save as `pickup_health_neon_void.png`."

## 12) Decorative decals (optional)
Filename: `assets/arenas/arena_neon_void_decor.png` (1024x512)
Prompt (PNG 1024x512):
"1024x512 PNG, parallax decor layer: pipes, vents, neon signage, low-detail props matching minimalitra style, transparent background. Save as `arena_neon_void_decor.png`."

## 13) Edge rim (top rim for platforms) — optional
Filename: `assets/levels/edge_rim.png` (single small strip tile)
Prompt (PNG scaled):
"PNG strip tile for platform rim highlight: thin metallic rim with neon cyan edge glow, transparent background. Save as `edge_rim.png`."

## 14) Optional UI / small icons
Filenames: `assets/ui/ui_icon_neon_void_shop.svg`, `assets/ui/hud_health_neon_void.svg`
Prompt (SVG):
"SVG icon set in minimalitra style; use simple geometric shapes, neon accents, and optimized for small sizes (64x64)."

---

## Quick copy-paste prompt templates (single-line) — ready to paste into generator
- Arena visual (PNG 2048x1024):
  "Minimalitra minimilitra 2D side-view arena panoramic, flat layered planes, neon cyan + indigo + violet palette, open buildings with visible gaps (no closed rooms), simple geometric silhouettes, transparent edges — PNG 2048x1024 — save as assets/arenas/arena_neon_void_visual.png"

- Arena mask (PNG same size):
  "Solid silhouette mask of arena, white = solid platforms/walls, transparent = passable — match arena_neon_void_visual composition — PNG save as assets/arenas/arena_neon_void_mask.png"

- Platform tile (128x32):
  "128x32 PNG flat platform tile, minimalitra style, dark military green base, neon-cyan trim, transparent background — save as assets/platforms/platform_tile_neon_void_01.png"

- Open building facade (256x256):
  "256x256 PNG side-view building facade with open interiors, doorways, no enclosed rooms, simplified interior silhouettes, minimalitra neon palette — save as assets/blocks/block_neon_void_open_01.png"

- Tree canopy (1024x1024):
  "1024x1024 PNG side-view tree canopy, layered flat leaves, hanging vines, neon-muted greens, transparent background — save as assets/overlays/tree_canopy_neon_void_01.png"

- Leaf particle (64x64):
  "64x64 PNG stylized leaf particle, flat color, slight glow, transparent background — save as assets/particles/leaf_neon_void_01.png"

- Pickup icon (128x128):
  "128x128 PNG minimal pickup icon (health), flat silhouette, green accent, transparent background — save as assets/pickups/pickup_health_neon_void.png"

---

## Notes
- Filenames must match exactly for automatic loading. Use lowercase and underscores.
- Provide PNGs with alpha for overlays/tiles; SVG for backgrounds/UI when possible.
- For masks, ensure pixel-perfect alignment with the visual artwork (same resolution and crop).

If you want, I can now:
- copy your existing `assets/levels/Platform tile.png` to `assets/platforms/platform_tile_neon_void_01.png` (rename), and/or
- generate simple placeholder PNGs for canopy & open block assets so you can test immediately.

Tell me which action you prefer and I will proceed.
