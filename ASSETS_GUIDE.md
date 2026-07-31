# Space Drift Arena - Asset Guide

To make the game fully functional and visually complete, you need to provide the following assets in the specified folders. Once you add these files, the game will load them automatically.

## AI Image Generation Prompts
You can use tools like **Midjourney**, **DALL-E 3**, or **Leonardo.ai** to create these. 
> [!TIP]
> For character sprites, use prompts like: "2D top-down game sprite, futuristic cyber fighter, flat design, white background, high quality".

---

## 1. Character Sprites (`assets/characters/`)
Each character needs two files:
1.  `[name].png`: The actual game sprite (top-down view).
2.  `[name]_show.png`: A high-quality character portrait for the shop.

### Free Characters (`assets/characters/free/`)
| Filename | Character Name | AI Prompt Idea |
| :--- | :--- | :--- |
| `default_fighter.png` | Default Soldier | Top-down galactic soldier, cyan neon accents, futuristic armor. |
| `Astronaut.png` | Astronaut | Top-down astronaut in a sleek white EVA suit, orange visor. |
| `Hacker.png` | Hacker | Top-down cyber warrior, hooded, glowing green binary patterns. |
| `joker.png` | Joker | Top-down crazy fighter, purple and green attire, mask. |
| `Knight.png` | Knight | Top-down space knight, holographic energy shield and armor. |
| `Ninja.png` | Ninja | Top-down sci-fi ninja, sleek black suit, glowing blue katana. |
| `Pirate.png` | Pirate | Top-down space pirate, mechanical eye-patch, rugged gear. |
| `Robot.png` | Robot | Top-down mechanical droid, sleek metallic body, red sensor eye. |
| `Santa_Claus.png` | Santa Claus | Top-down Santa in a power-armor suit, festive but combat-ready. |
| `Vampire.png` | Vampire | Top-down gothic space vampire, cape flowing, pale skin. |

### Premium Characters (`assets/characters/premium/`)
| Filename | Character Name | AI Prompt Idea |
| :--- | :--- | :--- |
| `King.png` | King | Top-down royal commander, golden crown on helmet, majestic cape. |
| `Diamond_Ice_Queen.png` | Ice Queen | Top-down elegant queen, crystalline armor, glowing ice aura. |

---

## 2. Weapon Icons (`assets/weapons/`)
These should be horizontal icons of the weapons.

| Filename | Weapon | AI Prompt Idea |
| :--- | :--- | :--- |
| `pistol.png` | Pistol | Futuristic sci-fi handgun, energy cells, cyan glow. |
| `shotgun.png` | Shotgun | Heavy space shotgun, multi-barrel, rugged metallic texture. |
| `assault_rifle.png` | Assault Rifle | Sleek energy rifle, ergonomic design, purple light accents. |
| `sniper.png` | Sniper | Long-range railgun sniper, massive barrel, precision scope. |
| `rocket_launcher.png` | Rocket Launcher | Portable missile tube, heavy-duty, tactical camo. |
| `Laser.png` | Laser Rifle | High-tech beam weapon, elongated design, glowing crystals. |
| `plasma_canon.png` | Plasma Cannon | Large circular energy projector, heavy industrial look. |

---

## 3. Sound Effects (`assets/sounds/`)
All files must be in `.mp3` format.

| Filename | Usage | AI/Source Description |
| :--- | :--- | :--- |
| `background.mp3` | Main Menu & Gameplay | Synthwave, lo-fi space ambient, or fast-paced techno loop. |
| `shoot.mp3` | Basic Shooting | Sharp "pew" sound, digital energy blast. |
| `laser.mp3` | Laser/Plasma | Sustained energy hum or quick high-pitched pulse. |
| `rocket.mp3` | Rocket Fired | Deep "whoosh" with a mechanical launch click. |
| `die.mp3` | Death/Elimination | Digital glitch sound or low-pitched impact crash. |
| `hover.mp3` | UI Button Hover | Subtle high-pitched "blip" or soft click. |

---

## 4. Battle Arenas (Levels)
Each of the 10 levels can have a custom preview image (visible in the level selection screen).

- **Location**: `assets/arenas/`
- **Naming**: `{level_id}.png` (e.g., `neon_void.png`, `rusty_outpost.png`)
- **Dimensions**: Recommended `800x600` or `1200x800`.

#### AI Generation Prompts for Arenas:
| Level ID | Theme | Recommended AI Prompt |
| :--- | :--- | :--- |
| **neon_void** | Deep Space | "Futuristic deep space arena, neon cyan and purple floating asteroids, nebula background, cinematic lighting, 8k, concept art" |
| **crystal_cavern** | Cave | "Underground cave filled with glowing bioluminescent crystals, stalactites, mysterious purple atmosphere, sci-fi cave exploration" |
| **rusty_outpost** | Industrial | "Abandoned rusty industrial outpost in space, mechanical pipes, orange sparks, derelict metal facility, gritty atmosphere" |
| **high_tower** | Sky City | "Futuristic skyscraper rooftops above sea of clouds, neon green accents, sci-fi architecture, high altitude battle arena" |
| **jungle_ruins** | Overgrown | "Ancient temple ruins overgrown with tropical jungle vines, mossy stone pillars, sunlight through canopy, sci-fi discovery" |
| **volcanic_base** | Magma | "High-tech base built inside an active volcano, glowing rivers of magma, obsidian rocks, red heat, volcanic facility" |
| **cyber_city** | Cyberpunk | "Cyberpunk city street at night, neon holograms, rain on pavement, blue and pink lights, futuristic urban sprawl" |
| **frozen_waste** | Ice Planet | "Icy arctic wasteland, giant glaciers, sci-fi research outpost in snowstorm, freezing blue atmosphere, arctic base" |
| **space_station** | Interior | "Interior of a massive golden space station, modular architecture, windows showing space, futuristic orbital base" |
| **shadow_dimension** | Abyss | "Abstract dark realm, floating obsidian shards, monochrome eerie atmosphere, mysterious void dimension, cinematic shadows" |

---

## 5. Level Obstacles & Props (`assets/levels/`)
Providing these images will replace the procedural shapes with high-quality graphics. The game automatically looks for a file matching the level's theme.

| Filename | Used in Level | AI Prompt Idea |
| :--- | :--- | :--- |
| `asteroid.png` | Neon Void | "2D top-down game asset, detailed asteroid rock, space debris, jagged edges, high quality, white background" |
| `crystal.png` | Crystal Cavern | "2D top-down glowing purple crystal cluster, bioluminescent gems, translucent sharp edges, white background" |
| `metal_block.png` | Rusty Outpost | "2D top-down rusty industrial metal container, scrap metal block, bolts and weathered texture, white background" |
| `platform.png` | High Tower | "2D top-down futuristic helipad platform, sleek metallic surface with hazard stripes, sci-fi landing pad, white background" |
| `stone_pillar.png` | Jungle Ruins | "2D top-down ancient stone pillar, mossy weathered rock, jungle vine carvings, cracked stone texture, white background" |
| `magma_rock.png` | Volcanic Base | "2D top-down volcanic obsidian rock with glowing lava cracks, cooling magma surface, thermal heat glow, white background" |
| `building.png` | Cyber City | "2D top-down futuristic skyscraper roof, neon satellite dishes, vents and pipes, cyberpunk architecture, white background" |
| `glacier.png` | Frozen Waste | "2D top-down sharp ice glacier, translucent light blue frozen rock, frost and snow dust, arctic terrain, white background" |
| `station_module.png` | Space Station | "2D top-down golden orbital space station module, rounded tech dome, solar panels and hatches, white background" |
| `shadow_shard.png` | Shadow Dimension | "2D top-down abstract obsidian shard, dark smoke aura, eerie void fragment, mysterious silhouette, white background" |
| `big_block.png` | All (Gold/Big) | "2D top-down massive golden crystal cluster, glowing orange energy, heavy armored space rock, white background" |

---

## 6. Environmental Decorations (`assets/levels/`)
These are non-colliding visual elements that add richness and a "Designed" feel to the map.

| Filename | Type | AI Prompt Idea (Side-Scroller Style) |
| :--- | :--- | :--- |
| `pipe.png` | Industrial | "2D side-scroller game asset, rusty industrial metal pipe, detailed texture, metallic pipes, white background" |
| `vent.png` | Tech | "2D sci-fi air vent, futuristic metallic grill, glowing internal light, high quality game asset, white background" |
| `moss.png` | Nature | "2D glowing alien moss patch, bioluminescent green fungi, natural growth, soft edges, white background" |
| `wires.png` | Cyber | "2D tangled futuristic power cables, glowing electricity wires, technological debris, white background" |
| `edge_rim.png` | Platform Edge | "Long horizontal futuristic metal ledge, glowing neon border, tech platform edge, 2D game asset, white background" |
| `platform.png` | Modular Block | "2D game asset, high-quality sci-fi modular platform block, metallic hexagon texture, weathered space station metal, glowing cyan circuits, top-down isometric view but flat, white background, cinematic lighting" |

---

## 7. UI Elements (`assets/ui/`)
Icons for badges and UI.

| Filename | Usage |
| :--- | :--- |
| `Shop.png` | Shop Button Icon |
| `beginner.PNG`, `Warrior.png`, `Champion.png`, `Legend.png`, etc. | Rank Badges |

---

## 🚀 How to use these assets
1.  **Generate** the images/sounds using the prompts above.
2.  **Save** them with the exact filenames.
3.  **Place** them in the correct folders (e.g. `assets/levels/asteroid.png`).
4.  **Refresh** the game — everything is pre-wired to load automatically!

---

### Implementation Status:
- [x] Code pre-wired to load these filenames.
- [x] Background music hooked to start on first interaction.
- [x] Weapon sounds synced to each gun type.
- [x] Death sounds added to combat.
- [x] Fullscreen horizontal level selection integrated.
- [x] Obstacle image support added to Map rendering.
