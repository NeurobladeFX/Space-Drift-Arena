import { GAME_CONFIG, COLORS } from './config.js';

export class Map {
    constructor() {
        this.width = GAME_CONFIG.MAP_WIDTH;
        this.height = GAME_CONFIG.MAP_HEIGHT;
        this.obstacles = this.generateObstacles();
    }

    generateObstacles() {
        const obstacles = [];
        const positions = [
            { x: 800, y: 600 },
            { x: 3040, y: 600 },
            { x: 800, y: 1560 },
            { x: 3040, y: 1560 },
            { x: 1920, y: 400 },
            { x: 1920, y: 1760 }
        ];

        // Add regular obstacles
        for (let pos of positions) {
            obstacles.push({
                x: pos.x,
                y: pos.y,
                radius: 40 + Math.random() * 30,
                type: 'asteroid'
            });
        }
        
        // Add bigger blocks for cover
        const bigBlocks = [
            { x: 1200, y: 800 },
            { x: 2640, y: 800 },
            { x: 1200, y: 1360 },
            { x: 2640, y: 1360 },
            { x: 1920, y: 1080 } // Center block
        ];
        
        for (let pos of bigBlocks) {
            obstacles.push({
                x: pos.x,
                y: pos.y,
                radius: 80 + Math.random() * 40, // Bigger radius
                type: 'big_block'
            });
        }

        return obstacles;
    }

    render(ctx) {
        // Render space background
        ctx.fillStyle = COLORS.spaceDeep;
        ctx.fillRect(0, 0, this.width, this.height);

        // Render stars (simple dots) - increased coverage for larger map
        ctx.fillStyle = COLORS.textPrimary;
        for (let i = 0; i < 200; i++) { // Increased from 100 to 200
            const x = (i * 173) % this.width; // Pseudo-random but consistent
            const y = (i * 197) % this.height;
            const size = (i % 3) + 1;
            ctx.fillRect(x, y, size, size);
        }

        // Render arena boundary
        ctx.strokeStyle = COLORS.neonCyan;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.3;
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1;

        // Render center energy core
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const coreRadius = 40;

        // Glow effect
        const gradient = ctx.createRadialGradient(centerX, centerY, 0,
            centerX, centerY, coreRadius * 2);
        gradient.addColorStop(0, COLORS.neonCyan);
        gradient.addColorStop(0.5, COLORS.neonPurple);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core circle
        ctx.fillStyle = COLORS.neonPurple;
        ctx.strokeStyle = COLORS.neonCyan;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Render obstacles
        this.renderObstacles(ctx);
    }

    renderObstacles(ctx) {
        for (let obstacle of this.obstacles) {
            // Shadow/glow
            ctx.shadowColor = obstacle.type === 'big_block' ? '#FFD700' : '#4A5568'; // Gold for big blocks
            ctx.shadowBlur = obstacle.type === 'big_block' ? 25 : 15;

            // Obstacle body
            ctx.fillStyle = obstacle.type === 'big_block' ? '#FFA500' : '#4A5568'; // Orange for big blocks
            ctx.strokeStyle = obstacle.type === 'big_block' ? '#FFD700' : '#2D3458';
            ctx.lineWidth = obstacle.type === 'big_block' ? 4 : 2;
            ctx.beginPath();
            ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (obstacle.type === 'big_block') {
                // Add a special pattern for big blocks
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(obstacle.x - 15, obstacle.y - 12, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(obstacle.x + 18, obstacle.y + 8, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(obstacle.x, obstacle.y, 8, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Crater details (simple circles)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(obstacle.x - 10, obstacle.y - 8, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(obstacle.x + 12, obstacle.y + 5, 6, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
        }
    }

    checkObstacleCollisions(entity, camera) {
        // Only check collisions with obstacles that are near the entity
        // This optimizes performance by skipping far-away planets
        for (let obstacle of this.obstacles) {
            const dx = entity.x - obstacle.x;
            const dy = entity.y - obstacle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Skip if obstacle is too far away (optimization)
            const maxCheckDistance = entity.radius + obstacle.radius + 100;
            if (dist > maxCheckDistance) continue;

            if (dist < entity.radius + obstacle.radius) {
                // Push entity out
                const overlap = entity.radius + obstacle.radius - dist;
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
        return false;
    }
}
