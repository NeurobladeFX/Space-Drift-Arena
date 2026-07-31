Space Drift Arena — Levels Game-Ready Specification

This file lists each level, the expected asset filenames, platform tile to use, a short layout description, spawn areas, and props needed so the game is "ready" for release.

Naming conventions (must match files in `assets/`):
- Backgrounds: `assets/backgrounds/background_{levelId}.png` (example: `background_crystal_cavern.png`)
- Arena visuals: `assets/arenas/arena_{levelId}_visual.png`
- Platform art: `assets/platform/platform_tile_{levelId}.png` (fallback: `platform_tile_generic.png`)
- Props: various images under `assets/blocks/` or `assets/props/`

Levels

1) neon_void
- id: `neon_void`
- background: `background_neon_void.png`
- platform: `platform_tile_neon_void_01.png`
- layout: Tactical military platforms with large connected rings and tactical dots (special parallax preserved).
- props: `block_neon_void_open_01.png` (decorative blocks)

2) jungle_ruins
- id: `jungle_ruins`
- background: `background_jungle_ruins.png`
- platform: `platform_tile_jungle_ruins.png` (large room art preferred)
- layout: Town/village-inspired larger rooms and plazas mixed with ruins; fewer tiny tiles, more big roofs and plazas.
- props: `tree_jungle_01.png`, `vent.png`

3) space_station
- id: `space_station`
- background: `background_space_station.png`
- platform: `platform_tile_space_station.png`
- layout: Big hangars and long catwalks; wide open floors for vehicle/rocket combat and upper catwalks for snipers.
- props: `platform_wall_panel_01.png`, `edge_rim.png`

4) crystal_cavern
- id: `crystal_cavern`
- background: `background_crystal_cavern.png`
- platform: `platform_tile_crystal_cavern.png`
- layout: Large cavern rooms scaled to fit; main combat chamber with wide floor and several elevated ledges.
- props: `crystal.png`, `edge_rim.png`

5) rusty_outpost
- id: `rusty_outpost`
- background: `background_rusty_outpost.png`
- platform: `platform_tile_rusty_outpost.png`
- layout: Stacked shipping containers (vertical stacks) and narrow walkways — think container yard turned arena.
- props: `metal_block.png`, `pipe.png`

6) high_tower
- id: `high_tower`
- background: `background_high_tower.png`
- platform: `platform_tile_high_tower.png`
- layout: Skyscraper rooftops and tall narrow stacks; vertical gameplay with catwalks between towers.
- props: `platform_wall_panel_01.png`, `edge_rim.png`

7) volcanic_base
- id: `volcanic_base`
- background: `background_volcanic_base.png`
- platform: `platform_tile_volcanic_base.png`
- layout: Facility-style rooms over a lava pit; larger platform rooms and some narrow passages.
- props: `vent.png`, `edge_rim.png`

8) cyber_city
- id: `cyber_city`
- background: `background_cyber_city.png`
- platform: `platform_tile_cyber_city.png`
- layout: Streets at ground level with stacked building roofs and skywalks above — city combat.
- props: neon signs, `edge_rim.png`, `platform_wall_panel_01.png`

9) frozen_waste
- id: `frozen_waste`
- background: `background_frozen_waste.png`
- platform: `platform_tile_frozen_waste.png`
- layout: Small frozen village + wider glacier ledges; prefer fewer tiny tiles, use large house roofs and plaza.
- props: ice props (optional), `edge_rim.png`

10) shadow_dimension
- id: `shadow_dimension`
- background: `background_shadow_dimension.png`
- platform: `platform_tile_generic.png` (fallback)
- layout: Floating islands and void platforms; keep existing floating-island feel (no town).
- props: dark crystal sprites (optional)

Global pickups & UI sprites (required):
- `pickup_rocket.png`, `pickup_shotgun.png`, `pickup_sniper.png`, `pickup_assault.png`, `pickup_health.png`
- Weapon icons used by `Map.js` must match the pickup type names.

Notes for artists / uploader
- Provide one large background per level at the project map resolution (recommended 3840x2160) stored in `assets/backgrounds/`.
- Platform art: prefer large single images representing room floors or large platform strips rather than many 32px tiles.
- Naming must match the filenames above; if you choose different names, update `js/Map.js` to reference them.

If you want I can:
- Create placeholder PNGs for all listed filenames so the game runs immediately.
- Zip and archive the old small platform tiles from `assets/levels/`.

*** End of spec
