import { GAME_CONFIG, COLORS } from './config.js';

export class Map {
    constructor(currentLevel = null) {
        this.width = GAME_CONFIG.MAP_WIDTH;
        this.height = GAME_CONFIG.MAP_HEIGHT;
        this.currentLevel = currentLevel || {
            background: COLORS.spaceDeep,
            accentColor: COLORS.neonCyan,
            obstacles: 'asteroid'
        };
        this.bridges = []; // Optimized: store platform connections here

        // Militia specific data
        this.spawnPoints = [];
        this.weaponPickupPoints = [];

        this.obstacles = this.generateObstacles();
    }

    _placeholderSVG(label, w = 640, h = 360, bg = '#222', fg = '#fff') {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' fill='${fg}' font-family='Arial' font-size='24' dominant-baseline='middle' text-anchor='middle'>${label}</text></svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    // Return a random spawn point (safe) from populated spawnPoints or sample inside spawnArea
    getSpawnPoint() {
        if (this.spawnPoints && this.spawnPoints.length > 0) {
            return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
        }

        // Fallback: try to sample inside spawnArea if available
        if (this.currentLevel && this.currentLevel.spawnArea) {
            const area = this.currentLevel.spawnArea;
            const px = (area.x + Math.random() * area.w) * this.width;
            const py = (area.y + Math.random() * area.h) * this.height;
            return { x: px, y: py };
        }

        // Ultimate fallback: center
        return { x: this.width / 2, y: this.height / 2 };
    }

    generateObstacles() {
        const obstacles = [];
        this.bridges = [];
        this.spawnPoints = [];
        this.weaponPickupPoints = [];
        this.foregroundDecorations = []; // For trees and other hiding spots

        // Generate platform layout for ALL levels (converting room-based levels to platformers)
        this._generatePlatformMap(this.currentLevel.id);

        // Pre-calculate Bridges colliders (if any circular obstacles were added, which we mostly avoid now)
        for (let i = 0; i < obstacles.length; i++) {
            const ob1 = obstacles[i];
            for (let j = i + 1; j < obstacles.length; j++) {
                const ob2 = obstacles[j];
                const unitSize = 100;
                const dist = Math.sqrt((ob1.x - ob2.x) ** 2 + (ob1.y - ob2.y) ** 2);
                if (dist < unitSize * 1.1) {
                    this.bridges.push({ p1: ob1, p2: ob2, width: (ob1.radius + ob2.radius) });
                }
            }
        }

        return obstacles;
    }

    // Helper to generate specific platform layouts
    _generatePlatformMap(levelId) {
        let plats = [];
        let connectors = [];

        // Default Neon Void Layout (Military-style platforms)
        const basePlats = [
            // Left loop family
            { x1: 0, x2: 880, y: 140, w: 48 },
            { x1: 80, x2: 520, y: 420, w: 44 },
            { x1: 120, x2: 400, y: 760, w: 44 },
            { x1: 220, x2: 760, y: 1120, w: 44 },
            { x1: 640, x2: 820, y: 320, w: 44 },

            // Center family
            { x1: 900, x2: 1240, y: 140, w: 48 },
            { x1: 1260, x2: 1520, y: 420, w: 44 },
            { x1: 1480, x2: 1760, y: 860, w: 44 },
            { x1: 1540, x2: 2300, y: 1080, w: 42 },
            { x1: 1700, x2: 2180, y: 1400, w: 40 },
            { x1: 2260, x2: 2540, y: 860, w: 44 },
            { x1: 2560, x2: 2820, y: 420, w: 44 },
            { x1: 2820, x2: 3240, y: 140, w: 48 },

            // Right loop family
            { x1: 2440, x2: 2920, y: 1120, w: 44 },
            { x1: 2640, x2: 3000, y: 760, w: 44 },
            { x1: 3180, x2: 3320, y: 320, w: 44 },
            { x1: 3040, x2: 3840, y: 140, w: 48 }
        ];

        const baseConnectors = [
            { x1: 880, x2: 980, y: 140, w: 48 },
            { x1: 1520, x2: 1640, y: 860, w: 44 },
            { x1: 1760, x2: 1840, y: 1080, w: 42 },
            { x1: 2180, x2: 2260, y: 860, w: 44 },
            { x1: 520, x2: 640, y: 320, w: 44 },
            { x1: 3000, x2: 3180, y: 320, w: 44 }
        ];

        // Reusable Mini Militia style layout (used to standardize multiple levels)
        const getMiniMilitiaLayout = () => {
            const plats = [
                { x1: 0, x2: 920, y: 120, w: 30 },
                { x1: 100, x2: 560, y: 360, w: 28 },
                { x1: 40, x2: 400, y: 720, w: 28 },
                { x1: 420, x2: 660, y: 920, w: 28 },
                { x1: 760, x2: 1020, y: 300, w: 30 },
                { x1: 220, x2: 800, y: 1160, w: 28 },
                { x1: 980, x2: 1300, y: 120, w: 30 },
                { x1: 1320, x2: 1540, y: 360, w: 28 },
                { x1: 2500, x2: 2720, y: 360, w: 28 },
                { x1: 1640, x2: 1940, y: 720, w: 28 },
                { x1: 1960, x2: 2260, y: 720, w: 28 },
                { x1: 1840, x2: 2320, y: 1320, w: 24 },
                { x1: 1680, x2: 2440, y: 960, w: 26 },
                { x1: 2500, x2: 2920, y: 120, w: 30 },
                { x1: 2440, x2: 2900, y: 360, w: 28 },
                { x1: 2640, x2: 3000, y: 720, w: 28 },
                { x1: 2880, x2: 3120, y: 920, w: 28 },
                { x1: 3060, x2: 3320, y: 300, w: 30 },
                { x1: 2280, x2: 2860, y: 1160, w: 28 }
            ];
            const connectors = [
                { x1: 920, x2: 1000, y: 120, w: 30 },
                { x1: 2420, x2: 2500, y: 120, w: 30 },
                { x1: 820, x2: 940, y: 1160, w: 28 },
                { x1: 2900, x2: 3020, y: 1160, w: 28 },
                { x1: 1380, x2: 1500, y: 720, w: 28 },
                { x1: 2240, x2: 2360, y: 720, w: 28 },
                { x1: 1520, x2: 1680, y: 840, w: 24 },
                { x1: 2080, x2: 2240, y: 840, w: 24 },
                { x1: 1200, x2: 1320, y: 240, w: 30 },
                { x1: 2360, x2: 2480, y: 240, w: 30 }
            ];
            return { plats, connectors };
        };

        // Generate town/building style layouts for MiniMilitia-like rooms
        const getTownLayout = (style) => {
            const plats = [];
            const connectors = [];

            if (style === 'city') {
                // Streets and multi-story buildings (wide ground floors, stacked upper floors)
                // Ground streets
                plats.push({ x1: 0, x2: 1200, y: 150, w: 44 });
                plats.push({ x1: 1400, x2: 2600, y: 150, w: 44 });
                plats.push({ x1: 2800, x2: this.width, y: 150, w: 44 });

                // Building columns (stacked platforms)
                for (let bx = 200; bx < 3600; bx += 400) {
                    plats.push({ x1: bx + 0, x2: bx + 320, y: 400, w: 40 });
                    plats.push({ x1: bx + 20, x2: bx + 300, y: 700, w: 38 });
                    plats.push({ x1: bx + 40, x2: bx + 280, y: 1000, w: 36 });
                }

                // Skywalk connectors
                for (let cx = 400; cx < 3200; cx += 600) connectors.push({ x1: cx, x2: cx + 200, y: 600, w: 28 });

            } else if (style === 'station') {
                // Big hangars and long catwalks
                plats.push({ x1: 0, x2: 1600, y: 200, w: 50 });
                plats.push({ x1: 1800, x2: 3200, y: 200, w: 50 });
                plats.push({ x1: 600, x2: 2600, y: 800, w: 46 });
                plats.push({ x1: 1400, x2: 2000, y: 1200, w: 40 });
                connectors.push({ x1: 900, x2: 1100, y: 500, w: 36 });
                connectors.push({ x1: 2000, x2: 2200, y: 500, w: 36 });

            } else if (style === 'containers') {
                // Stacked containers: narrow long stacks, good vertical gameplay
                for (let i = 0; i < 10; i++) {
                    const base = 100 + i * 360;
                    plats.push({ x1: base, x2: base + 220, y: 300, w: 42 });
                    plats.push({ x1: base + 20, x2: base + 200, y: 540, w: 40 });
                    plats.push({ x1: base + 40, x2: base + 180, y: 780, w: 38 });
                }
                // Few connectors
                connectors.push({ x1: 400, x2: 560, y: 420, w: 36 });
                connectors.push({ x1: 1600, x2: 1760, y: 420, w: 36 });

            } else if (style === 'skyscraper') {
                // Very tall narrow stacks
                for (let sx = 400; sx <= 3200; sx += 600) {
                    plats.push({ x1: sx, x2: sx + 220, y: 200, w: 44 });
                    plats.push({ x1: sx + 10, x2: sx + 210, y: 600, w: 40 });
                    plats.push({ x1: sx + 20, x2: sx + 200, y: 1000, w: 36 });
                    plats.push({ x1: sx + 30, x2: sx + 190, y: 1400, w: 32 });
                }
                connectors.push({ x1: 1000, x2: 1200, y: 800, w: 30 });

            } else if (style === 'village') {
                // Village / town square with roofs and plazas
                plats.push({ x1: 200, x2: 800, y: 220, w: 44 }); // plaza
                plats.push({ x1: 1000, x2: 1600, y: 300, w: 40 });
                plats.push({ x1: 1800, x2: 2400, y: 220, w: 44 }); // market
                // small house roofs
                for (let hx = 300; hx < 2600; hx += 400) {
                    plats.push({ x1: hx, x2: hx + 220, y: 520, w: 36 });
                }
                connectors.push({ x1: 700, x2: 900, y: 360, w: 32 });

            } else {
                // default: fallback to mini militia
                return getMiniMilitiaLayout();
            }

            return { plats, connectors };
        };

        // Small SVG placeholder generator (returns data URL)
        

        if (levelId === 'neon_void_minimilitia') {
            // Neon Void Militia - MiniMilitia style with many big blocks and central tunnel
            plats = [
                // Left side structures
                { x1: 200, x2: 800, y: 1800, w: 40 },  // Large floor block
                { x1: 300, x2: 700, y: 1600, w: 30 }, // Mid-level platform
                { x1: 400, x2: 600, y: 1400, w: 25 }, // High platform
                
                { x1: 100, x2: 500, y: 1200, w: 35 }, // Lower left structure
                { x1: 200, x2: 400, y: 1000, w: 25 }, // Small upper left platform
                
                // Right side structures
                { x1: 1200, x2: 1800, y: 1800, w: 40 }, // Large floor block
                { x1: 1300, x2: 1700, y: 1600, w: 30 }, // Mid-level platform
                { x1: 1400, x2: 1600, y: 1400, w: 25 }, // High platform
                
                { x1: 1500, x2: 1900, y: 1200, w: 35 }, // Lower right structure
                { x1: 1600, x2: 1800, y: 1000, w: 25 }, // Small upper right platform
                
                // Central area (tunnel) - no platforms to create passage
                // Additional structures for tactical gameplay
                { x1: 600, x2: 800, y: 1000, w: 25 },  // Left-center platform
                { x1: 1200, x2: 1400, y: 1000, w: 25 }, // Right-center platform
                
                { x1: 800, x2: 1200, y: 800, w: 30 },  // Center platform (spans tunnel area)
            ];

            connectors = [
                // Connect platforms for easier movement
                { x1: 700, x2: 800, y: 1650, w: 20 }, // Left mid to high
                { x1: 1700, x2: 1800, y: 1650, w: 20 }, // Right mid to high
                
                { x1: 1400, x2: 1500, y: 1250, w: 20 }, // Right lower to platform
                { x1: 400, x2: 500, y: 1250, w: 20 },   // Left lower to platform
                
                { x1: 1000, x2: 1100, y: 850, w: 20 }, // Center to sides
            ];

        } else if (levelId === 'neon_void') {
            // Neon Void (True 2D Competitive Arena)
            plats = [
                // --- Outer Bounds (Closed Box) ---
                { x1: 50, y1: 50, x2: 3790, y2: 50, w: 100 }, // Bottom
                { x1: 50, y1: 2110, x2: 3790, y2: 2110, w: 100 }, // Top
                { x1: 50, y1: 50, x2: 50, y2: 2110, w: 100 }, // Left
                { x1: 3790, y1: 50, x2: 3790, y2: 2110, w: 100 }, // Right

                // --- Corner Bases (Spawns) - L-Shaped Shields ---
                // Bottom-Left Base
                { x1: 250, y1: 450, x2: 450, y2: 450, w: 40 },
                { x1: 450, y1: 250, x2: 450, y2: 450, w: 40 },

                // Top-Left Base
                { x1: 250, y1: 1710, x2: 450, y2: 1710, w: 40 },
                { x1: 450, y1: 1710, x2: 450, y2: 1910, w: 40 },

                // Bottom-Right Base
                { x1: 3390, y1: 450, x2: 3590, y2: 450, w: 40 },
                { x1: 3390, y1: 250, x2: 3390, y2: 450, w: 40 },

                // Top-Right Base
                { x1: 3390, y1: 1710, x2: 3590, y2: 1710, w: 40 },
                { x1: 3390, y1: 1710, x2: 3390, y2: 1910, w: 40 },

                // --- Central High-Risk Zone (The Core) ---
                // Octagon-like structure in the center
                { x1: 1600, y1: 1300, x2: 2240, y2: 1300, w: 40 }, // Top Center Cover
                { x1: 1600, y1: 860, x2: 2240, y2: 860, w: 40 }, // Bottom Center Cover
                
                { x1: 1400, y1: 1500, x2: 1600, y2: 1300, w: 40 }, // Top-Left Diagonal
                { x1: 2240, y1: 1300, x2: 2440, y2: 1500, w: 40 }, // Top-Right Diagonal
                { x1: 1400, y1: 660, x2: 1600, y2: 860, w: 40 }, // Bottom-Left Diagonal
                { x1: 2240, y1: 860, x2: 2440, y2: 660, w: 40 }, // Bottom-Right Diagonal

                // --- Mid-field Sniper Lanes (Long vertical cover) ---
                { x1: 900, y1: 600, x2: 900, y2: 1560, w: 60 },
                { x1: 2940, y1: 600, x2: 2940, y2: 1560, w: 60 },

                // --- Side Flank Routes ---
                { x1: 1300, y1: 300, x2: 2540, y2: 300, w: 40 }, // Bottom Flank Cover
                { x1: 1300, y1: 1860, x2: 2540, y2: 1860, w: 40 } // Top Flank Cover
            ];

            connectors = [];
        } else if (levelId === 'jungle_ruins') {
            // Convert jungle_ruins to Mini Militia style rooms/platforms
            const mini = getMiniMilitiaLayout();
            plats = mini.plats;
            connectors = mini.connectors;

        } else if (levelId === 'space_station') {
            // Space Station -> hangars/catwalks (station style)
            const t = getTownLayout('station');
            plats = t.plats;
            connectors = t.connectors;

        } else if (levelId === 'crystal_cavern') {
            // Keep Crystal Cavern mostly room-based but increase room sizes
            const mini = getMiniMilitiaLayout();
            // widen a few central platforms for cavern feel
            plats = mini.plats.map(p => ({ ...p }));
            plats.push({ x1: 1400, x2: 2400, y: 800, w: 48 });
            connectors = mini.connectors;

        } else if (levelId === 'rusty_outpost') {
            // Rusty Outpost -> stacked containers
            const t = getTownLayout('containers');
            plats = t.plats;
            connectors = t.connectors;

        } else if (levelId === 'high_tower') {
            // High Tower -> skyscrapers
            const t = getTownLayout('skyscraper');
            plats = t.plats;
            connectors = t.connectors;

        } else if (levelId === 'volcanic_base') {
            // Volcanic base: keep some large facility platforms but use mini layout fallback
            const mini = getMiniMilitiaLayout();
            plats = mini.plats.slice(0, 8);
            plats.push({ x1: 600, x2: 1800, y: 1100, w: 46 });
            connectors = mini.connectors.slice(0, 4);

        } else if (levelId === 'cyber_city') {
            // Cyber City -> street + buildings
            const t = getTownLayout('city');
            plats = t.plats;
            connectors = t.connectors;

        } else if (levelId === 'frozen_waste') {
            // Frozen Waste -> small frozen village
            const t = getTownLayout('village');
            plats = t.plats;
            connectors = t.connectors;

        } else if (levelId === 'shadow_dimension') {
            // Shadow Dimension: keep floating islands (use mini as fallback)
            const mini = getMiniMilitiaLayout();
            plats = mini.plats;
            connectors = mini.connectors;

        } else if (levelId === 'mini_militia_01') {
            // Keep original Mini Militia layout
            plats = [
                { x1: 0, x2: 920, y: 120, w: 30 },
                { x1: 100, x2: 560, y: 360, w: 28 },
                { x1: 40, x2: 400, y: 720, w: 28 },
                { x1: 420, x2: 660, y: 920, w: 28 },
                { x1: 760, x2: 1020, y: 300, w: 30 },
                { x1: 220, x2: 800, y: 1160, w: 28 },
                { x1: 980, x2: 1300, y: 120, w: 30 },
                { x1: 1320, x2: 1540, y: 360, w: 28 },
                { x1: 2500, x2: 2720, y: 360, w: 28 },
                { x1: 1640, x2: 1940, y: 720, w: 28 },
                { x1: 1960, x2: 2260, y: 720, w: 28 },
                { x1: 1840, x2: 2320, y: 1320, w: 24 },
                { x1: 1680, x2: 2440, y: 960, w: 26 },
                { x1: 2500, x2: 2920, y: 120, w: 30 },
                { x1: 2440, x2: 2900, y: 360, w: 28 },
                { x1: 2640, x2: 3000, y: 720, w: 28 },
                { x1: 2880, x2: 3120, y: 920, w: 28 },
                { x1: 3060, x2: 3320, y: 300, w: 30 },
                { x1: 2280, x2: 2860, y: 1160, w: 28 }
            ];
            connectors = [
                { x1: 920, x2: 1000, y: 120, w: 30 },
                { x1: 2420, x2: 2500, y: 120, w: 30 },
                { x1: 820, x2: 940, y: 1160, w: 28 },
                { x1: 2900, x2: 3020, y: 1160, w: 28 },
                { x1: 1380, x2: 1500, y: 720, w: 28 },
                { x1: 2240, x2: 2360, y: 720, w: 28 },
                { x1: 1520, x2: 1680, y: 840, w: 24 },
                { x1: 2080, x2: 2240, y: 840, w: 24 },
                { x1: 1200, x2: 1320, y: 240, w: 30 },
                { x1: 2360, x2: 2480, y: 240, w: 30 }
            ];
        } else {
            // Default (Use Neon Void base for everyone else for now, as requested)
            plats = basePlats;
            connectors = baseConnectors;
        }

        // Apply Layout
        plats.forEach(p => {
            const p1 = { x: p.x1 !== undefined ? p.x1 : p.x, y: this.height - (p.y1 !== undefined ? p.y1 : p.y) };
            const p2 = { x: p.x2 !== undefined ? p.x2 : p.x, y: this.height - (p.y2 !== undefined ? p.y2 : p.y) };
            this.bridges.push({ p1, p2, width: p.w || 40 });
        });

        connectors.forEach(c => {
            const p1 = { x: c.x1 !== undefined ? c.x1 : c.x, y: this.height - (c.y1 !== undefined ? c.y1 : c.y) };
            const p2 = { x: c.x2 !== undefined ? c.x2 : c.x, y: this.height - (c.y2 !== undefined ? c.y2 : c.y) };
            this.bridges.push({ p1, p2, width: c.w || 40 });
        });

        // Add some fun foreground decorations depending on level (giant duck, disco, etc.)
        if (levelId === 'cyber_city' || levelId === 'shadow_dimension' || levelId === 'frozen_waste') {
            // Place a giant rubber duck near center for humor
            this.foregroundDecorations.push({ type: 'giant_duck', x: this.width / 2.5, y: this.height - 240, scale: 0.9, rotation: 0 });
        }
        if (levelId === 'space_station' || levelId === 'volcanic_base') {
            // Place a large warning sign (prop) near left
            this.foregroundDecorations.push({ type: 'warning_sign', x: 300, y: this.height - 220, scale: 0.7, rotation: -0.05 });
        }
        if (levelId === 'jungle_ruins') {
            this.foregroundDecorations.push({ type: 'tree_jungle_01', x: 400, y: this.height - 400, scale: 2.0, rotation: 0 });
            this.foregroundDecorations.push({ type: 'tree_jungle_01', x: 1200, y: this.height - 800, scale: 1.5, rotation: 0.1 });
            this.foregroundDecorations.push({ type: 'tree_jungle_01', x: 2600, y: this.height - 1200, scale: 2.2, rotation: -0.05 });
            this.foregroundDecorations.push({ type: 'tree_jungle_01', x: 2000, y: this.height - 200, scale: 1.8, rotation: 0 });
            this.foregroundDecorations.push({ type: 'tree_jungle_01', x: 800, y: this.height - 1600, scale: 2.5, rotation: 0.08 });
        }

        // Void Area (Center hole) - Applies to all using this layout
        if (levelId === 'neon_void_minimilitia') {
            // For the new Neon Void Militia level, create a void area for central tunnel
            // The tunnel is between left and right sections
            this.voidArea = { x1: 900, x2: 1100, y1: 0, y2: this.height };
        } else {
            this.voidArea = { x1: 1560, x2: 2480, y1: 160, y2: 1480 };
        }

        // Generate Spawn Points dynamically from platform layout so spawns are level-aware
        this.spawnPoints = [];
        
        // For the new Neon Void Militia level, use specific spawn points near the edges
        if (levelId === 'neon_void_minimilitia') {
            // Create spawn points based on the new layout
            this.spawnPoints = [
                { x: 500, y: this.height - 300 },  // Left side top area
                { x: 300, y: this.height - 600 },  // Left side bottom area
                { x: 1500, y: this.height - 300 }, // Right side top area
                { x: 1700, y: this.height - 600 } // Right side bottom area
            ];
        } else if (levelId === 'neon_void') {
            this.spawnPoints = [
                { x: 200, y: this.height - 200 }, // Bottom-Left Base (converted from Cartesian)
                { x: 3640, y: this.height - 200 }, // Bottom-Right Base
                { x: 200, y: this.height - 1960 }, // Top-Left Base
                { x: 3640, y: this.height - 1960 }  // Top-Right Base
            ];
        } else {
            const platSamples = plats && plats.length ? plats.slice(0, Math.min(8, plats.length)) : basePlats.slice(0, 8);
            platSamples.forEach(p => {
                const sx = (p.x1 + p.x2) / 2;
                const sy = this.height - p.y - 8;
                this.spawnPoints.push({ x: sx, y: sy });
            });
            // ensure we have at least 4 spawns
            if (this.spawnPoints.length < 4) {
                this.spawnPoints.push({ x: 200, y: this.height - 200 });
                this.spawnPoints.push({ x: this.width - 200, y: this.height - 200 });
            }
        }

        // Weapon Pickups: distribute across some platform midpoints
        const weaponTypes = ['rocket', 'shotgun', 'sniper', 'assault', 'health'];
        this.weaponPickupPoints = [];
        
        if (levelId === 'neon_void_minimilitia') {
            // For the new Neon Void Militia level, place pickups based on new layout
            this.weaponPickupPoints = [
                { x: 500, y: this.height - 320, type: 'rocket' },      // Left side top platform
                { x: 300, y: this.height - 620, type: 'shotgun' },      // Left side bottom platform
                { x: 1500, y: this.height - 320, type: 'sniper' },     // Right side top platform
                { x: 1700, y: this.height - 620, type: 'assault' },    // Right side bottom platform
                { x: 700, y: this.height - 800, type: 'health' },      // Center platform
                { x: 1300, y: this.height - 800, type: 'health' }     // Center platform
            ];
        } else if (levelId === 'neon_void') {
            this.weaponPickupPoints = [
                { x: 1920, y: this.height - 1080, type: 'rocket' },   // Dead center (Core)
                { x: 650, y: this.height - 1080, type: 'sniper' },    // Left Lane
                { x: 3190, y: this.height - 1080, type: 'sniper' },   // Right Lane
                { x: 1920, y: this.height - 400, type: 'assault' },   // Bottom Flank
                { x: 1920, y: this.height - 1760, type: 'shotgun' },  // Top Flank
                { x: 1450, y: this.height - 1400, type: 'health' },   // Inner Ring Top-Left
                { x: 2390, y: this.height - 760, type: 'health' }     // Inner Ring Bottom-Right
            ];
        } else {
            const wpTargets = plats && plats.length ? plats.filter((_,i)=> i % Math.max(1, Math.floor(plats.length/5)) === 0).slice(0,6) : [];
            wpTargets.forEach((p, idx) => {
                const wx = (p.x1 + p.x2) / 2;
                const wy = this.height - p.y - 12;
                this.weaponPickupPoints.push({ x: wx, y: wy, type: weaponTypes[idx % weaponTypes.length] });
            });
            // fallback pickups if none
            if (this.weaponPickupPoints.length === 0) {
                this.weaponPickupPoints = [
                    { x: this.width/2, y: this.height - 200, type: 'rocket' },
                    { x: this.width/3, y: this.height - 500, type: 'sniper' }
                ];
            }
        }
    }

    renderForeground(ctx, camera) {
        if (!this.foregroundDecorations || !this.foregroundDecorations.length) return;

        ctx.save();
        if (camera) {
            ctx.translate(-camera.x, -camera.y);
        }

        this.foregroundDecorations.forEach(dec => {
            // Check if on screen (optimization)
            if (camera) {
                const screenX = dec.x - camera.x;
                const screenY = dec.y - camera.y;
                if (screenX < -200 || screenX > window.innerWidth + 200 || screenY < -200 || screenY > window.innerHeight + 200) return;
            }

            ctx.save();
            ctx.translate(dec.x, dec.y);
            ctx.rotate(dec.rotation || 0);
            const scale = dec.scale || 1;

            // Try to draw an uploaded image for this decoration (key by imageKey or type)
            const imgKey = dec.imageKey || dec.type;
            const decImg = this.obstacleImages ? this.obstacleImages[imgKey] : null;
            const imgReady = decImg && decImg.complete && decImg.naturalWidth !== 0 && this.imageLoadingStatus[imgKey] === 'loaded';

            if (imgReady) {
                const imgWidth = decImg.naturalWidth * scale;
                const imgHeight = decImg.naturalHeight * scale;
                ctx.drawImage(decImg, -imgWidth / 2, -imgHeight, imgWidth, imgHeight);
            } else if (dec.type === 'giant_duck') {
                // Draw a simple giant rubber duck placeholder
                ctx.fillStyle = '#ffdd33';
                ctx.beginPath();
                ctx.ellipse(0, -40 * scale, 80 * scale, 55 * scale, 0, 0, Math.PI * 2);
                ctx.fill();
                // beak
                ctx.fillStyle = '#ff9933';
                ctx.beginPath();
                ctx.moveTo(70 * scale, -40 * scale);
                ctx.lineTo(110 * scale, -36 * scale);
                ctx.lineTo(70 * scale, -28 * scale);
                ctx.fill();
                // eye
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(20 * scale, -60 * scale, 6 * scale, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Default fallback: draw a tree-like placeholder
                ctx.fillStyle = '#0f3d0f'; // Dark Jungle Green
                ctx.beginPath();
                ctx.moveTo(0, -120 * scale);
                ctx.lineTo(50 * scale, 0);
                ctx.lineTo(-50 * scale, 0);
                ctx.fill();

                ctx.fillStyle = '#1a521a';
                ctx.beginPath();
                ctx.moveTo(0, -100 * scale);
                ctx.lineTo(35 * scale, -10);
                ctx.lineTo(-35 * scale, -10);
                ctx.fill();

                ctx.fillStyle = '#2d1b0e';
                ctx.fillRect(-8 * scale, -5, 16 * scale, 25 * scale);
            }

            ctx.restore();
        });

        ctx.restore();
    }


    // Check if a world point is blocked by any obstacle (simple circle check)
    _isPointBlocked(x, y, margin = 0) {
        if (!this.obstacles || this.obstacles.length === 0) return false;
        for (const ob of this.obstacles) {
            const dx = x - ob.x;
            const dy = y - ob.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < (ob.radius + margin)) return true;
        }
        // also ensure point is within map bounds (with margin)
        if (x < margin || y < margin || x > this.width - margin || y > this.height - margin) return true;
        return false;
    }

    render(ctx, camera) {
        // 1. Background Layers / Parallax
        if (this.currentLevel.parallax && this.currentLevel.id !== 'neon_void') {
            const parallax = this.currentLevel.parallax;
            parallax.forEach(layer => {
                ctx.fillStyle = layer.color || COLORS.textPrimary;
                for (let i = 0; i < (layer.count || 100); i++) {
                    const x = (i * 173 * (layer.size || 1)) % this.width;
                    const y = (i * 197 * (layer.size || 1)) % this.height;

                    const scrollX = camera ? camera.x * (layer.speed || 0.1) : 0;
                    const scrollY = camera ? camera.y * (layer.speed || 0.1) : 0;

                    let finalX = (x - scrollX) % window.innerWidth;
                    let finalY = (y - scrollY) % window.innerHeight;

                    if (finalX < 0) finalX += window.innerWidth;
                    if (finalY < 0) finalY += window.innerHeight;

                    ctx.fillRect(finalX, finalY, layer.size || 2, layer.size || 2);
                }
            });
        } else if (this.currentLevel.id === 'neon_void') {
            // Special parallax for Neon Void with tactical grid
            ctx.fillStyle = 'rgba(0, 240, 255, 0.1)'; // Neon cyan
            for (let i = 0; i < 150; i++) {
                const x = (i * 137) % window.innerWidth;
                const y = (i * 163) % window.innerHeight;

                const scrollX = camera ? camera.x * 0.15 : 0;
                const scrollY = camera ? camera.y * 0.15 : 0;

                let finalX = (x - scrollX) % window.innerWidth;
                let finalY = (y - scrollY) % window.innerHeight;

                if (finalX < 0) finalX += window.innerWidth;
                if (finalY < 0) finalY += window.innerHeight;

                // Create small tactical dots
                ctx.fillRect(finalX, finalY, 3, 3);
            }

            // Add some larger tactical markers
            ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
            for (let i = 0; i < 30; i++) {
                const x = (i * 317) % window.innerWidth;
                const y = (i * 373) % window.innerHeight;

                const scrollX = camera ? camera.x * 0.1 : 0;
                const scrollY = camera ? camera.y * 0.1 : 0;

                let finalX = (x - scrollX) % window.innerWidth;
                let finalY = (y - scrollY) % window.innerHeight;

                if (finalX < 0) finalX += window.innerWidth;
                if (finalY < 0) finalY += window.innerHeight;

                // Create larger tactical markers
                ctx.fillRect(finalX, finalY, 5, 5);
            }
        } else {
            // Default static stars for levels without parallax
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 200; i++) {
                const x = (i * 257) % window.innerWidth;
                const y = (i * 311) % window.innerHeight;
                ctx.fillRect(x, y, 2, 2);
            }
        }

        // Apply camera translation for all world-space objects
        ctx.save();
        if (camera) {
            ctx.translate(-camera.x, -camera.y);
        }

        // Debug: render spawn area for current level (subtle overlay)
        if (this.currentLevel && this.currentLevel.spawnArea) {
            const area = this.currentLevel.spawnArea;
            const x = area.x * this.width;
            const y = area.y * this.height;
            const w = area.w * this.width;
            const h = area.h * this.height;
            ctx.save();
            ctx.globalAlpha = 12;
            ctx.fillStyle = '#00FFFF';
            ctx.fillRect(x, y, w, h);
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
        }

        // 2. Arena Floor / Background Gradient (CSS-like)
        // Try to load level-specific background image
        const levelId = this.currentLevel.id;
        const bgImg = this.obstacleImages ? this.obstacleImages[`background_${levelId}`] : null;

        if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0 && this.imageLoadingStatus[`background_${levelId}`] === 'loaded') {
            try {
                ctx.drawImage(bgImg, 0, 0, this.width, this.height);
            } catch (e) {
                // fallback to gradient if drawImage fails
                const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
                bgGradient.addColorStop(0, this.currentLevel.background || '#0A0E27');
                bgGradient.addColorStop(1, '#000000');
                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, this.width, this.height);
            }
        } else {
            // Default background gradient
            const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
            bgGradient.addColorStop(0, this.currentLevel.background || '#0A0E27');
            bgGradient.addColorStop(1, '#000000');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Optional Background Detail (Structural grid) - only for non-Neon Void levels
        if (levelId !== 'neon_void') {
            ctx.strokeStyle = this.currentLevel.accentColor || COLORS.uiLight;
            ctx.globalAlpha = 0.05;
            ctx.lineWidth = 1;
            for (let x = 0; x < this.width; x += 200) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
            }
            for (let y = 0; y < this.height; y += 200) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        // Draw arena visual overlay if available (on top of background)
        const arenaImg = this.obstacleImages ? this.obstacleImages[`arena_${levelId}_visual`] : null;
        if (arenaImg && arenaImg.complete && arenaImg.naturalWidth !== 0 && this.imageLoadingStatus[`arena_${levelId}_visual`] === 'loaded') {
            ctx.save();
            try {
                // Draw arena visual overlay
                ctx.globalAlpha = 1.0;
                // Apply dark filter only for Neon Void
                if (levelId === 'neon_void') {
                    ctx.filter = 'brightness(0.3)';
                }
                ctx.drawImage(arenaImg, 0, 0, this.width, this.height);
                ctx.filter = 'none'; // Reset filter
            } catch (e) {
                console.warn('Arena render error:', e);
            }
            ctx.restore();
        }

        // 3. Center Energy Core
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const coreRadius = 40;

        if (this.currentLevel.id === 'neon_void') {
            // For Neon Void, create a more tactical military-style core
            // Core Glow with tactical ring
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 3);
            gradient.addColorStop(0, '#00F0FF');
            gradient.addColorStop(0.3, '#00F0FF88');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * 3, 0, Math.PI * 2);
            ctx.fill();

            // Outer tactical ring
            ctx.strokeStyle = '#00F0FF';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * 2, 0, Math.PI * 2);
            ctx.stroke();

            // Reset line dash
            ctx.setLineDash([]);

            // Core pulsating center with tactical crosshair
            const pulse = 1 + Math.sin(Date.now() / 500) * 0.1;
            ctx.fillStyle = '#2D4A2D'; // Military green
            ctx.strokeStyle = '#00F0FF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Tactical crosshair
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX - coreRadius, centerY);
            ctx.lineTo(centerX + coreRadius, centerY);
            ctx.moveTo(centerX, centerY - coreRadius);
            ctx.lineTo(centerX, centerY + coreRadius);
            ctx.stroke();
        } else {
            // Default core for other levels
            // Core Glow
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2.5);
            gradient.addColorStop(0, this.currentLevel.accentColor);
            gradient.addColorStop(0.4, this.currentLevel.accentColor + '33');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Core pulsating center
            const pulse = 1 + Math.sin(Date.now() / 500) * 0.1;
            ctx.fillStyle = COLORS.neonPurple;
            ctx.strokeStyle = this.currentLevel.accentColor;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // 4. Arena Boundaries
        if (this.currentLevel.id === 'neon_void') {
            // For Neon Void, create tactical military-style boundaries
            ctx.strokeStyle = '#00F0FF'; // Neon cyan
            ctx.lineWidth = 12;
            ctx.globalAlpha = 0.6;
            ctx.strokeRect(0, 0, this.width, this.height);

            // Add tactical corner markers
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.8;

            // Top-left corner
            ctx.beginPath();
            ctx.moveTo(0, 30);
            ctx.lineTo(0, 0);
            ctx.lineTo(30, 0);
            ctx.stroke();

            // Top-right corner
            ctx.beginPath();
            ctx.moveTo(this.width, 30);
            ctx.lineTo(this.width, 0);
            ctx.lineTo(this.width - 30, 0);
            ctx.stroke();

            // Bottom-left corner
            ctx.beginPath();
            ctx.moveTo(0, this.height - 30);
            ctx.lineTo(0, this.height);
            ctx.lineTo(30, this.height);
            ctx.stroke();

            // Bottom-right corner
            ctx.beginPath();
            ctx.moveTo(this.width, this.height - 30);
            ctx.lineTo(this.width, this.height);
            ctx.lineTo(this.width - 30, this.height);
            ctx.stroke();

            ctx.globalAlpha = 1;
        } else {
            // Default boundaries for other levels
            ctx.strokeStyle = this.currentLevel.accentColor;
            ctx.lineWidth = 15;
            ctx.globalAlpha = 0.4;
            ctx.strokeRect(0, 0, this.width, this.height);

            ctx.globalAlpha = 1;
        }

        // 5. Connective "Land" Tissue (Platform bridges)
        this.renderPlatforms(ctx);

        // 6. Level-specific Obstacle bodies
        this.renderObstacles(ctx);

        ctx.restore();
    }

    renderPlatforms(ctx) {
        ctx.save();

        // 1. Draw pre-calculated solid "Land" mass
        ctx.lineCap = 'round';
        this.bridges.forEach(bridge => {
            ctx.beginPath();
            ctx.moveTo(bridge.p1.x, bridge.p1.y);
            ctx.lineTo(bridge.p2.x, bridge.p2.y);

            // Generic Logic for ALL levels: Use platform tile if available
            const tileImg = this.obstacleImages ? (this.obstacleImages['platform_tile_custom'] || this.obstacleImages['platform']) : null;
            const tileReady = tileImg && tileImg.complete && tileImg.naturalWidth !== 0 && this.imageLoadingStatus['platform_tile_custom'] !== 'failed';

            if (tileReady) {
                ctx.save();
                ctx.translate(bridge.p1.x, bridge.p1.y);
                const angle = Math.atan2(bridge.p2.y - bridge.p1.y, bridge.p2.x - bridge.p1.x);
                ctx.rotate(angle);
                const dist = Math.sqrt((bridge.p1.x - bridge.p2.x) ** 2 + (bridge.p1.y - bridge.p2.y) ** 2);

                // Use the actual image dimensions for proper rendering
                const tileW = tileImg.naturalWidth;
                const tileH = tileImg.naturalHeight;

                // Calculate scale to maintain aspect ratio while fitting bridge width
                // Use bridge.width as the target height for the platform
                const scaleToFit = bridge.width / tileH;
                const scaledWidth = tileW * scaleToFit;
                const scaledHeight = bridge.width; // Use bridge.width as actual height

                // Tile/repeat the image along the platform length
                for (let x = 0; x < dist; x += scaledWidth) {
                    const w = Math.min(scaledWidth, dist - x);
                    // Draw with proper aspect ratio
                    ctx.drawImage(
                        tileImg,
                        0, 0, // Source x, y
                        Math.min(tileW, (w / scaleToFit)), tileH, // Source width, height (crop if needed)
                        x, -scaledHeight / 2, // Destination x, y (centered vertically)
                        w, scaledHeight // Destination width, height
                    );
                }
                ctx.restore();
            } else {
                // fallback: draw plain filled platform strip (no external images) if image fails
                ctx.save();
                ctx.fillStyle = '#1A1C29';
                ctx.strokeStyle = this.currentLevel.accentColor || '#00F0FF';
                ctx.lineWidth = 4;
                
                // Draw as a simple rect
                ctx.translate(bridge.p1.x, bridge.p1.y);
                const angle = Math.atan2(bridge.p2.y - bridge.p1.y, bridge.p2.x - bridge.p1.x);
                ctx.rotate(angle);
                const dist = Math.sqrt((bridge.p1.x - bridge.p2.x) ** 2 + (bridge.p1.y - bridge.p2.y) ** 2);
                
                // Add glowing cyberpunk outline
                ctx.shadowColor = ctx.strokeStyle;
                ctx.shadowBlur = 15;
                ctx.fillRect(0, -bridge.width / 2, dist, bridge.width);
                ctx.strokeRect(0, -bridge.width / 2, dist, bridge.width);
                
                // Inner tech grid pattern
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = ctx.strokeStyle;
                for (let i = 20; i < dist - 20; i += 40) {
                    ctx.fillRect(i, -bridge.width / 2 + 10, 8, bridge.width - 20);
                }
                
                ctx.restore();
            }

            // 3. Render Decorations (Decals) - generic block placement
            // For now, place per-level open block images as static décor on some bridges
            // This logic was previously Neon Void only, now generic if image exists
            const blockImg = this.obstacleImages ? this.obstacleImages['block_neon_void_open_01'] : null;
            const blockReady = blockImg && blockImg.complete && blockImg.naturalWidth !== 0 && this.imageLoadingStatus['block_neon_void_open_01'] === 'loaded';
            if (blockReady) {
                // Use deterministic check based on bridge position to avoid blinking
                // Simplified hash to ensure positive values and better spread
                const bridgeHash = (Math.abs(Math.sin(bridge.p1.x * 0.1) + Math.cos(bridge.p1.y * 0.1)) * 100) % 1;

                // Increased threshold to 0.4 (40%) to ensure they appear
                if (bridgeHash < 0.4) {
                    const mx = (bridge.p1.x + bridge.p2.x) / 2;
                    const my = (bridge.p1.y + bridge.p2.y) / 2;
                    const size = Math.max(160, bridge.width * 3);

                    // Debug log to ensure this runs (will appear in console if checked)
                    // console.log('Drawing decoration at', mx, my); 

                    ctx.drawImage(blockImg, mx - size / 2, my - bridge.width / 2 - size, size, size);
                }
            }
        });

        ctx.restore();
    }

    renderDecorations(ctx) {
        if (!this.decorations) {
            this.decorations = [];
            // Generate some random purely visual "props"
            for (let i = 0; i < 40; i++) {
                this.decorations.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    type: ['pipe', 'vent'][Math.floor(Math.random() * 2)],
                    scale: 0.5 + Math.random(),
                    rot: Math.random() * Math.PI * 2
                });
            }
        }

        this.decorations.forEach(dec => {
            ctx.save();
            ctx.translate(dec.x, dec.y);
            ctx.rotate(dec.rot);
            const size = 40 * dec.scale;

            const img = this.obstacleImages ? this.obstacleImages[dec.type] : null;

            if (img && img.complete && img.naturalWidth !== 0 && this.imageLoadingStatus[dec.type] !== 'failed') {
                ctx.globalAlpha = 1.0;
                ctx.drawImage(img, -size / 2, -size / 2, size, size);
            } else {
                // Draw a placeholder style for decorations
                ctx.globalAlpha = 0.2;
                ctx.strokeStyle = this.currentLevel.accentColor;
                ctx.lineWidth = 1;

                if (dec.type === 'pipe') {
                    ctx.strokeRect(-size, -2, size * 2, 4);
                } else if (dec.type === 'vent') {
                    for (let i = -2; i <= 2; i++) ctx.strokeRect(-size / 2, i * 5, size, 1);
                } else if (dec.type === 'graffiti') {
                    ctx.strokeText("Militia!", 0, 0);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            ctx.restore();
        });
    }

    renderObstacles(ctx) {
        // Safelist of allowed asset keys to load
        const readyAssets = ['platform', 'asteroid', 'crystal', 'edge_rim', 'jungle_block', 'metal_block', 'pipe', 'vent', 'big_block'];

        // Load obstacle images dynamically based on types if not already loaded
        if (!this.obstacleImages) {
            this.obstacleImages = {};
            this.imageLoadingStatus = {};

            // For neon_void we only want the user platform tile loaded to avoid any other images
            if (this.currentLevel.id !== 'neon_void') {
                // Pre-load essential assets for non-neon levels
                readyAssets.forEach(key => {
                    const img = new Image();
                    img.src = `assets/levels/${key}.png`;
                    this.obstacleImages[key] = img;
                    img.onload = () => { this.imageLoadingStatus[key] = 'loaded'; };
                    img.onerror = () => { this.imageLoadingStatus[key] = 'failed'; };
                });
            }

            // Always attempt to load a platform tile from preferred candidate paths (prefer per-level path)
            const _loadPlatformCandidates = (paths) => {
                let idx = 0;
                const tryLoad = () => {
                    if (idx >= paths.length) {
                        // No file candidates worked — create a simple SVG placeholder data-URL
                        const img = new Image();
                        img.src = this._placeholderSVG('platform tile');
                        this.obstacleImages['platform_tile_custom'] = img;
                        this.imageLoadingStatus['platform_tile_custom'] = 'loading';
                        img.onload = () => { this.imageLoadingStatus['platform_tile_custom'] = 'loaded'; };
                        return;
                    }
                    const p = paths[idx++];
                    const img = new Image();
                    img.src = p;
                    this.obstacleImages['platform_tile_custom'] = img;
                    this.imageLoadingStatus['platform_tile_custom'] = 'loading';
                    img.onload = () => { this.imageLoadingStatus['platform_tile_custom'] = 'loaded'; };
                    img.onerror = () => { tryLoad(); };
                };
                tryLoad();
            };

            // Load level-specific platform tile based on current level
            const levelId = this.currentLevel.id;
            const platformTilePaths = {
                'neon_void': 'assets/platform/platform_tile_neon_void_01.png',
                'neon_void_minimilitia': 'assets/platform/platform_tile_neon_void_01.png',
                'crystal_cavern': 'assets/platform/platform_tile_crystal_cavern.png',
                'rusty_outpost': 'assets/platform/platform_tile_rusty_outpost.png',
                'high_tower': 'assets/platform/platform_tile_high_tower.png',
                'jungle_ruins': 'assets/platform/platform_tile_jungle_ruins.png',
                'volcanic_base': 'assets/platform/platform_tile_volcanic_base.png',
                'cyber_city': 'assets/platform/platform_tile_cyber_city.png',
                'frozen_waste': 'assets/platform/platform_tile_frozen_waste.png',
                'space_station': 'assets/platform/platform_tile_space_station.png'
            };

            // Load platform tile for current level
            if (platformTilePaths[levelId]) {
                    _loadPlatformCandidates([
                    platformTilePaths[levelId],
                    'assets/platform/platform_tile_generic.png' // Fallback (new path)
                ]);
            } else {
                // Generic fallback
                _loadPlatformCandidates([
                    'assets/platform/platform_tile_generic.png'
                ]);
            }

            // Load tree image for Jungle level
            if (levelId === 'jungle_ruins') {
                const treeImg = new Image();
                treeImg.src = 'assets/blocks/tree_jungle_01.png';
                this.obstacleImages['tree_jungle_01'] = treeImg;
                this.imageLoadingStatus['tree_jungle_01'] = 'loading';
                treeImg.onload = () => { this.imageLoadingStatus['tree_jungle_01'] = 'loaded'; };
                treeImg.onerror = () => { this.imageLoadingStatus['tree_jungle_01'] = 'failed'; };
            }

            // Load level-specific background and arena visuals
            const bgImg = new Image();
            bgImg.src = `assets/backgrounds/background_${levelId}.png`;
            this.obstacleImages[`background_${levelId}`] = bgImg;
            this.imageLoadingStatus[`background_${levelId}`] = 'loading';
            bgImg.onload = () => { this.imageLoadingStatus[`background_${levelId}`] = 'loaded'; };
            bgImg.onerror = () => {
                // fallback to simple SVG background so level is playable immediately
                bgImg.src = this._placeholderSVG(`background ${levelId}`, this.width, this.height, '#002233', '#88eeff');
                this.imageLoadingStatus[`background_${levelId}`] = 'loading';
                bgImg.onload = () => { this.imageLoadingStatus[`background_${levelId}`] = 'loaded'; };
            };

            const arenaImg = new Image();
            arenaImg.src = `assets/arenas/arena_${levelId}_visual.png`;
            this.obstacleImages[`arena_${levelId}_visual`] = arenaImg;
            this.imageLoadingStatus[`arena_${levelId}_visual`] = 'loading';
            arenaImg.onload = () => { this.imageLoadingStatus[`arena_${levelId}_visual`] = 'loaded'; };
            arenaImg.onerror = () => {
                arenaImg.src = this._placeholderSVG(`arena ${levelId}`, 800, 400, '#113344', '#ffdd88');
                this.imageLoadingStatus[`arena_${levelId}_visual`] = 'loading';
                arenaImg.onload = () => { this.imageLoadingStatus[`arena_${levelId}_visual`] = 'loaded'; };
            };

            // Load neon_void-specific block decoration
            if (levelId === 'neon_void') {
                const blockImg = new Image();
                blockImg.src = 'assets/blocks/block_neon_void_open_01.png';
                this.obstacleImages['block_neon_void_open_01'] = blockImg;
                this.imageLoadingStatus['block_neon_void_open_01'] = 'loading';
                blockImg.onload = () => { this.imageLoadingStatus['block_neon_void_open_01'] = 'loaded'; };
                blockImg.onerror = () => {
                    blockImg.src = this._placeholderSVG('neon block', 128, 128, '#002222', '#00ffee');
                    this.imageLoadingStatus['block_neon_void_open_01'] = 'loading';
                    blockImg.onload = () => { this.imageLoadingStatus['block_neon_void_open_01'] = 'loaded'; };
                };
            }
        }

        for (let obstacle of this.obstacles) {
            const type = obstacle.type;
            const isBig = type === 'big_block';

            // Level-aware asset mapping
            let assetKey = type;
            if (type === 'block') {
                assetKey = this.currentLevel.obstacles || 'platform';
            }
            if (isBig) assetKey = 'big_block';

            // Ensure assetKey is in the safelist before attempting to use or load
            if (!readyAssets.includes(assetKey)) {
                assetKey = 'platform'; // Fallback to a default safe asset
            }

            const img = this.obstacleImages[assetKey];

            // Shadow/glow for immersion - specific to level or big status
            if (isBig) {
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 25;
            } else {
                ctx.shadowColor = this.currentLevel.accentColor || '#4A5568';
                ctx.shadowBlur = 15;
            }

            // Render Image if loaded, otherwise fallback to procedural
            // Prefer per-level open block image for neon_void
            let levelSpecificImg = null;
            if (this.currentLevel && this.currentLevel.id === 'neon_void' && this.obstacleImages['block_neon_void_open_01']) {
                levelSpecificImg = this.obstacleImages['block_neon_void_open_01'];
            }

            if (levelSpecificImg && levelSpecificImg.complete && levelSpecificImg.naturalWidth !== 0 && this.imageLoadingStatus['block_neon_void_open_01'] === 'loaded') {
                ctx.save();
                ctx.translate(obstacle.x, obstacle.y);
                ctx.drawImage(levelSpecificImg, -obstacle.radius, -obstacle.radius, obstacle.radius * 2, obstacle.radius * 2);
                ctx.restore();
            } else if (img && img.complete && img.naturalWidth !== 0 && this.imageLoadingStatus[assetKey] !== 'failed') {
                ctx.save();
                ctx.translate(obstacle.x, obstacle.y);

                // NO rotation for modular blocks/platforms (keep them perfectly aligned)
                const shouldRotate = !['block', 'platform', 'militia_block'].includes(type);
                if (shouldRotate) {
                    ctx.rotate((obstacle.x * 0.13 + obstacle.y * 0.17));
                }

                ctx.drawImage(img, -obstacle.radius, -obstacle.radius, obstacle.radius * 2, obstacle.radius * 2);
                ctx.restore();
            } else {
                // Procedural Fallback based on type keywords
                if (type.includes('block') || type.includes('platform') || type.includes('building') || type.includes('station')) {
                    // For Neon Void level, use a more tactical military look
                    if (this.currentLevel.id === 'neon_void') {
                        // Tactical military style platforms
                        ctx.fillStyle = '#2D4A2D'; // Military green
                        ctx.strokeStyle = '#00F0FF'; // Neon cyan accents
                        ctx.lineWidth = 4;

                        // Create rectangular platforms instead of circular
                        const size = obstacle.radius * 1.8;
                        ctx.fillRect(obstacle.x - size / 2, obstacle.y - size / 2, size, size);
                        ctx.strokeRect(obstacle.x - size / 2, obstacle.y - size / 2, size, size);

                        // Add tactical details
                        ctx.save();
                        ctx.globalAlpha = 0.7;
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([3, 3]);

                        // Draw a tactical cross in the center
                        ctx.beginPath();
                        ctx.moveTo(obstacle.x, obstacle.y - size / 3);
                        ctx.lineTo(obstacle.x, obstacle.y + size / 3);
                        ctx.moveTo(obstacle.x - size / 3, obstacle.y);
                        ctx.lineTo(obstacle.x + size / 3, obstacle.y);
                        ctx.stroke();
                        ctx.restore();
                    } else {
                        // ULTRA-VISIBLE Procedural look for Development
                        ctx.fillStyle = '#3F4E67'; // Brighter Slate
                        ctx.strokeStyle = this.currentLevel.accentColor;
                        ctx.lineWidth = 6; // Thicker border

                        const sides = 4; // Force square for platforms
                        ctx.beginPath();
                        for (let i = 0; i < sides; i++) {
                            const angle = (i * 2 * Math.PI) / sides + Math.PI / 4; // Align as square
                            const x = obstacle.x + obstacle.radius * 1.41 * Math.cos(angle);
                            const y = obstacle.y + obstacle.radius * 1.41 * Math.sin(angle);
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();

                        // Inner structural X (Blueprint style)
                        ctx.save();
                        ctx.globalAlpha = 0.5;
                        ctx.setLineDash([5, 5]); // Dashed lines
                        ctx.beginPath();
                        ctx.moveTo(obstacle.x - obstacle.radius, obstacle.y - obstacle.radius);
                        ctx.lineTo(obstacle.x + obstacle.radius, obstacle.y + obstacle.radius);
                        ctx.moveTo(obstacle.x + obstacle.radius, obstacle.y - obstacle.radius);
                        ctx.lineTo(obstacle.x - obstacle.radius, obstacle.y + obstacle.radius);
                        ctx.stroke();
                        ctx.restore();
                    }
                } else if (type.includes('crystal') || type.includes('shard')) {
                    // Edgy/Sharp look
                    ctx.fillStyle = this.currentLevel.accentColor + '44';
                    ctx.strokeStyle = this.currentLevel.accentColor;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 2.5 * Math.PI) / 5;
                        const x = obstacle.x + obstacle.radius * Math.cos(angle);
                        const y = obstacle.y + obstacle.radius * Math.sin(angle);
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                } else {
                    // Default Round (Asteroid/Rock/Glacier)
                    ctx.fillStyle = isBig ? '#FFA500' : (type.includes('glacier') ? '#E0F5FF' : '#4A5568');
                    ctx.strokeStyle = isBig ? '#FFD700' : (type.includes('glacier') ? '#FFFFFF' : '#2D3458');
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }

            ctx.shadowBlur = 0;
        }
    }

    checkObstacleCollisions(entity, camera) {
        // Only check collisions with obstacles that are near the entity
        for (let obstacle of this.obstacles) {
            const dx = entity.x - obstacle.x;
            const dy = entity.y - obstacle.y;
            const distSq = dx * dx + dy * dy;

            // Optimization: Use squared distance to avoid Math.sqrt
            const combinedRadius = entity.radius + obstacle.radius;
            const maxCheckDistSq = (combinedRadius + 100) ** 2;

            if (distSq > maxCheckDistSq) continue;

            const dist = Math.sqrt(distSq);
            if (dist < combinedRadius) {
                // Push entity out
                const overlap = combinedRadius - dist;
                const nx = dx / dist;
                const ny = dy / dist;

                entity.x += nx * overlap;
                entity.y += ny * overlap;

                // Bounce
                const dotProduct = entity.vx * nx + entity.vy * ny;
                entity.vx = (entity.vx - 2 * dotProduct * nx) * GAME_CONFIG.BOUNCE_DAMPING;
                entity.vy = (entity.vy - 2 * dotProduct * ny) * GAME_CONFIG.BOUNCE_DAMPING;

                return true;
            }
        }

        // Also check collisions against horizontal bridge platforms (rect-like)
        if (this.bridges && this.bridges.length) {
            for (const bridge of this.bridges) {
                // Treat bridge as a capsule (segment thickened by width/2)
                const x1 = bridge.p1.x;
                const y1 = bridge.p1.y;
                const x2 = bridge.p2.x;
                const y2 = bridge.p2.y;
                const rx = entity.x;
                const ry = entity.y;

                // Project point onto segment
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len2 = dx * dx + dy * dy;
                let t = 0;
                if (len2 > 0) t = ((rx - x1) * dx + (ry - y1) * dy) / len2;
                t = Math.max(0, Math.min(1, t));
                const cx = x1 + dx * t;
                const cy = y1 + dy * t;

                const distX = rx - cx;
                const distY = ry - cy;
                const dist = Math.sqrt(distX * distX + distY * distY);
                const halfW = (bridge.width || 28) / 2;

                if (dist < entity.radius + halfW) {
                    // push entity out along normal
                    const overlap = entity.radius + halfW - dist;
                    const nx = dist === 0 ? 0 : distX / dist;
                    const ny = dist === 0 ? -1 : distY / dist; // default up

                    entity.x += nx * overlap;
                    entity.y += ny * overlap;

                    // bounce adjustment
                    const dot = entity.vx * nx + entity.vy * ny;
                    entity.vx = (entity.vx - 2 * dot * nx) * GAME_CONFIG.BOUNCE_DAMPING;
                    entity.vy = (entity.vy - 2 * dot * ny) * GAME_CONFIG.BOUNCE_DAMPING;
                    return true;
                }
            }
        }

        return false;
    }
}

