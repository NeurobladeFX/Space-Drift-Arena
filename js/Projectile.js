import { GAME_CONFIG, WEAPONS } from './config.js';
import { generateId } from './physics.js';

export class Projectile {
    constructor(x, y, angle, weaponId, owner) {
        this.id = generateId();
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.owner = owner;
        this.weaponId = weaponId;

        const weapon = WEAPONS[weaponId];
        this.speed = weapon.bulletSpeed;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.damage = weapon.damage;
        this.lifetime = weapon.bulletLifetime;
        this.radius = GAME_CONFIG.PROJECTILE_RADIUS;
        this.color = weapon.color;

        // Special radius for rocket
        if (weaponId === 'rocket_launcher') {
            this.radius = 8;
        }

        // Trail system for sniper
        this.trail = [];
        this.maxTrailLength = weaponId === 'sniper' ? 15 : 5;
    }

    update(deltaTime) {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });

        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;
        this.lifetime -= deltaTime;

        return this.lifetime > 0;
    }

    isOutOfBounds(mapWidth, mapHeight) {
        return this.x < 0 || this.x > mapWidth ||
            this.y < 0 || this.y > mapHeight;
    }

    render(ctx, camera) {
        ctx.save();

        // Draw trail (especially visible for sniper)
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.weaponId === 'sniper' ? 4 : 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 0; i < this.trail.length - 1; i++) {
                const alpha = (i / this.trail.length) * 0.8;
                ctx.globalAlpha = alpha;

                const screenX1 = this.trail[i].x - camera.x;
                const screenY1 = this.trail[i].y - camera.y;
                const screenX2 = this.trail[i + 1].x - camera.x;
                const screenY2 = this.trail[i + 1].y - camera.y;

                // Glow for sniper trail
                if (this.weaponId === 'sniper') {
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 15;
                }

                ctx.beginPath();
                ctx.moveTo(screenX1, screenY1);
                ctx.lineTo(screenX2, screenY2);
                ctx.stroke();
            }
        }

        // Bullet core
        ctx.globalAlpha = 1;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.weaponId === 'sniper' ? 20 : 10;
        ctx.fillStyle = this.color;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.beginPath();
        if (this.weaponId === 'Laser') {
            // Draw Laser as a beam
            const tailLen = 40;
            const tailX = this.x - Math.cos(this.angle) * tailLen;
            const tailY = this.y - Math.sin(this.angle) * tailLen;

            // Beam glow
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 15;
            ctx.lineCap = 'round';

            ctx.moveTo(screenX - (tailX - this.x), screenY - (tailY - this.y));
            ctx.lineTo(screenX, screenY);
            ctx.stroke();

            // Bright core
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        } else {
            // Standard projectile (or rocket)
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
