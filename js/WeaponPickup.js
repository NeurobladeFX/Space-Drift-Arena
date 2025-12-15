import { WEAPONS } from './config.js';
import { generateId } from './physics.js';

export class WeaponPickup {
    constructor(x, y, weaponType) {
        this.id = generateId();
        this.x = x;
        this.y = y;
        this.weaponType = weaponType;
        this.radius = 20;
        this.available = true;
        this.respawnTime = 15; // Seconds until respawn
        this.respawnTimer = 0;
        this.rotation = 0;
        
        // Load weapon sprite
        this.sprite = new Image();
        this.sprite.src = `assets/weapons/${weaponType}.png`;
        this.spriteLoaded = false;
        
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };
        
        this.sprite.onerror = () => {
            console.warn(`Failed to load weapon pickup sprite: assets/weapons/${weaponType}.png`);
            this.spriteLoaded = false;
        };
    }
    
    update(deltaTime) {
        if (!this.available) {
            this.respawnTimer -= deltaTime;
            if (this.respawnTimer <= 0) {
                this.available = true;
            }
        }
        
        // Rotate the weapon pickup for visual effect
        this.rotation += deltaTime * 2;
    }
    
    render(ctx, camera) {
        if (!this.available) return;
        
        // Convert world coordinates to screen coordinates
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(this.rotation);
        
        // Draw glow effect
        ctx.shadowColor = WEAPONS[this.weaponType]?.color || '#FFFFFF';
        ctx.shadowBlur = 20;
        
        if (this.spriteLoaded && this.sprite.complete) {
            // Draw weapon sprite with pulsing effect
            const pulse = Math.sin(this.rotation * 2) * 0.15 + 1;
            const size = 60 * pulse;
            ctx.drawImage(
                this.sprite,
                -size/2,
                -size/2,
                size,
                size
            );
        } else {
            // Fallback: draw colored circle with weapon icon
            ctx.fillStyle = WEAPONS[this.weaponType]?.color || '#FFFFFF';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw weapon type initial
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.weaponType.charAt(0).toUpperCase(), 0, 0);
        }
        
        ctx.restore();
    }
    
    pickup() {
        if (!this.available) return false;
        
        this.available = false;
        this.respawnTimer = this.respawnTime;
        return true;
    }
    
    checkCollision(player) {
        if (!this.available || !player.alive) return false;
        
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.radius + player.radius);
    }
}