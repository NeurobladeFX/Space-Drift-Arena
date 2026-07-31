Assets to provide for updated Mini Militia-like levels

Purpose: clear list of image/audio assets and exact filenames (use these names when uploading to the project).

Backgrounds (one per level):
- background_neon_void.png (leave as-is)
- background_jungle_ruins.png
- background_space_station.png
- background_crystal_cavern.png
- background_rusty_outpost.png
- background_high_tower.png
- background_volcanic_base.png
- background_cyber_city.png
- background_frozen_waste.png
- background_shadow_dimension.png

Large room & platform art (use larger room pieces, not many small tiles):
- platform_room_big_01.png
- platform_room_big_02.png
- platform_bridge_large_01.png
- platform_wall_panel_01.png

Decor / props (named keys used by code if available):
- tree_jungle_01.png (used for foreground decorations)
- asteroid.png
- crystal.png
- vent.png
- edge_rim.png

Weapon pickup icons (small sprites):
- pickup_rocket.png
- pickup_shotgun.png
- pickup_sniper.png
- pickup_assault.png
- pickup_health.png

Audio (optional):
- sfx_platform_land.wav
- sfx_pickup.wav
- music_level_loop.mp3

Notes and naming rules:
- Use the exact filenames above when uploading; Map.js expects `background_{levelId}` keys (e.g. background_crystal_cavern).
- Prefer large single-image room art for Mini Militia style (avoid many 32px tiles).
- Provide .png with transparency for props and rooms; backgrounds may be .png or .jpg.
- If you prefer different names, tell me and I will update the code to match.
