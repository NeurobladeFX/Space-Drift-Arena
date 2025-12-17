import { GAME_CONFIG, COLORS, WEAPONS } from './config.js';
import { generateId, applyFriction, capSpeed, bounceOffWalls } from './physics.js';
import { Projectile } from './Projectile.js';

export class Player {
    constructor(x, y, isBot = false) {
        this.id = generateId();
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = GAME_CONFIG.PLAYER_RADIUS;
        this.color = COLORS.playerSelf;
        this.alive = true;
        this.hp = 100;
        this.maxHp = 100;
        this.shootCooldown = 0;
        this.isBot = isBot;
        this.angle = 0;
        this.shooting = false;
        this.kills = 0;
        this.deaths = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.respawnTimer = 0;
        this.regenTimer = 0;
        this.weapon = 'pistol';
        this.previousWeapon = null; // Track previous weapon for switching
        this.ammo = WEAPONS.pistol.ammo;

        // Store ammo for each weapon separately
        this.weaponAmmo = {
            pistol: Infinity,
            shotgun: 0,
            assault_rifle: 0,
            sniper: 0,
            rocket_launcher: 0,
            Laser: 0,
            plasma_canon: 0
        };

        // Sprite loading
        this.sprite = new Image();
        console.log('🆕 [Player] Created new Image object for sprite');
        this.spriteLoaded = false;
        this.spriteWidth = 64;
        this.spriteHeight = 64;

        // Debug flags for sprite rendering
        this._spriteDebugLogged = false;
        this._weaponSpriteDebugLogged = false;
        this._spriteBorderDrawn = false;
        this._weaponSpriteBorderDrawn = false;

        // Weapon sprites
        this.weaponSprites = {};
        this.weaponSpriteLoaded = {};
        this.weaponSpriteWidth = 40; // Bigger weapon size
        this.weaponSpriteHeight = 30;

        // Load character sprite (for both players and bots)
        console.log('🔄 [Player] Creating player - isBot:', isBot, 'Player ID:', this.id);

        const spriteUrl = 'assets/characters/free/default_fighter.png';
        console.log('🔄 [Player] Setting sprite source to:', spriteUrl);
        this.sprite.src = spriteUrl;

        this.sprite.onload = () => {
            this.spriteLoaded = true;
            this.spriteWidth = this.sprite.width;
            this.spriteHeight = this.sprite.height;
            console.log('✅ [Player] Player sprite loaded - isBot:', isBot, 'dimensions:', this.sprite.width, 'x', this.sprite.height);
        };

        this.sprite.onerror = () => {
            console.warn('❌ [Player] Failed to load sprite, trying alternative...');
            const altSpriteUrl = 'assets/characters/free/Santa_Claus.png';
            this.sprite.src = altSpriteUrl;

            this.sprite.onload = () => {
                this.spriteLoaded = true;
                this.spriteWidth = this.sprite.width;
                this.spriteHeight = this.sprite.height;
                console.log('✅ [Player] Alternative sprite loaded - isBot:', isBot);
            };

            this.sprite.onerror = () => {
                console.warn('❌ [Player] All sprites failed, using fallback circle');
                this.spriteLoaded = false;
            };
        };

        // Load weapon sprites
        this.loadWeaponSprite('pistol');
    }

    loadWeaponSprite(weaponId) {
        // Only load if not already loaded
        if (this.weaponSpriteLoaded[weaponId]) {
            console.log(`⏭️ [Player] Weapon sprite '${weaponId}' already loaded, skipping.`);
            return;
        }

        // Create new image for weapon sprite
        this.weaponSprites[weaponId] = new Image();
        this.weaponSprites[weaponId].src = `assets/weapons/${weaponId}.png`;

        console.log('🎮 [Player] Loading weapon sprite from:', this.weaponSprites[weaponId].src);

        this.weaponSprites[weaponId].onload = () => {
            this.weaponSpriteLoaded[weaponId] = true;
            console.log(`✅ [Player] Weapon sprite '${weaponId}' loaded successfully!`);
        };

        this.weaponSprites[weaponId].onerror = () => {
            console.error(`❌ [Player] FAILED to load weapon sprite '${weaponId}'!`);
            console.error('🔍 [Player] Attempted path:', this.weaponSprites[weaponId].src);
            this.weaponSpriteLoaded[weaponId] = false;
        };
    }

    update(deltaTime, mapWidth, mapHeight) {
        if (!this.alive) {
            this.respawnTimer -= deltaTime;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }

        // REMOTE PLAYER INTERPOLATION
        if (this.isRemote) {
            const lerpSpeed = 20; // Increased from 15 to 20 for even more responsive interpolation

            // Position Lerp
            if (this.targetX !== undefined) {
                this.x += (this.targetX - this.x) * lerpSpeed * deltaTime;
            }
            if (this.targetY !== undefined) {
                this.y += (this.targetY - this.y) * lerpSpeed * deltaTime;
            }

            // Angle Lerp (Shortest path)
            if (this.targetAngle !== undefined) {
                let diff = this.targetAngle - this.angle;
                // Normalize to -PI to PI
                while (diff > Math.PI) diff -= 2 * Math.PI;
                while (diff < -Math.PI) diff += 2 * Math.PI;

                this.angle += diff * lerpSpeed * deltaTime;
            }
            
            // Gradually reduce velocity for smoother stopping
            this.vx *= 0.9;
            this.vy *= 0.9;

            return; // Skip physics for remote players
        }

        // Apply physics
        this.x += this.vx;
        this.y += this.vy;
        this.vx = applyFriction(this.vx);
        this.vy = applyFriction(this.vy);

        // Cap speed
        const capped = capSpeed(this.vx, this.vy);
        this.vx = capped.vx;
        this.vy = capped.vy;

        // Bounce off walls
        bounceOffWalls(this, mapWidth, mapHeight);

        // Update timers
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }

        if (this.invulnerable) {
            this.invulnerableTimer -= deltaTime;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Health regeneration
        this.regenTimer += deltaTime;
        if (this.regenTimer >= GAME_CONFIG.HP_REGEN_DELAY && this.hp < this.maxHp) {
            this.hp = Math.min(this.hp + GAME_CONFIG.HP_REGEN_RATE * deltaTime, this.maxHp);
        }
    }

    shoot() {
        if (this.shootCooldown > 0 || !this.alive) return null;

        const weapon = WEAPONS[this.weapon];

        // Check ammo - switch to pistol if out of ammo
        if (this.ammo <= 0 && this.ammo !== Infinity) {
            // Switch to pistol when out of ammo
            this.switchToWeapon('pistol');
            return null; // Don't shoot immediately after switching
        }

        if (this.ammo !== Infinity) {
            this.ammo--;
        }

        // Apply recoil
        const recoil = weapon.recoil;
        this.vx -= Math.cos(this.angle) * recoil;
        this.vy -= Math.sin(this.angle) * recoil;

        // Set cooldown
        this.shootCooldown = weapon.fireRate;
        this.shotsFired++;

        // Calculate weapon firing position from gun tip
        const hasCharacterSprite = this.spriteWidth > 0 && this.spriteHeight > 0;
        const weaponOffsetX = hasCharacterSprite ? (this.spriteWidth / 2 - 5) : (this.radius);
        const weaponOffsetY = hasCharacterSprite ? (-this.weaponSpriteHeight / 2 - 8) : -20;

        // Calculate the tip of the weapon (right edge of the weapon sprite)
        const weaponTipX = weaponOffsetX + this.weaponSpriteWidth;
        const weaponTipY = weaponOffsetY + this.weaponSpriteHeight / 2;

        // Convert from local to world coordinates
        const fireX = this.x + Math.cos(this.angle) * weaponTipX - Math.sin(this.angle) * weaponTipY;
        const fireY = this.y + Math.sin(this.angle) * weaponTipX + Math.cos(this.angle) * weaponTipY;

        // Create projectile(s)
        const projectiles = [];

        if (weapon.spreadCount > 1) {
            // Shotgun spread
            for (let i = 0; i < weapon.spreadCount; i++) {
                const offset = (i - (weapon.spreadCount - 1) / 2) * weapon.spread;
                projectiles.push(new Projectile(
                    fireX,
                    fireY,
                    this.angle + offset,
                    this.weapon,
                    this
                ));
            }
        } else {
            // Single shot
            projectiles.push(new Projectile(
                fireX,
                fireY,
                this.angle,
                this.weapon,
                this
            ));
        }

        return projectiles;
    }

    takeDamage(damage, attacker) {
        if (this.invulnerable || !this.alive) return false;
        if (attacker === this) return false; // Prevent self-damage

        this.hp -= damage;
        this.regenTimer = 0; // Reset regeneration

        if (attacker && !attacker.isBot && this.isBot) {
            attacker.shotsHit++;
        }

        if (this.hp <= 0) {
            this.die();
            if (attacker) {
                attacker.kills++;
                attacker.shotsHit++;
            }
            return true; // Killed
        }

        if (attacker) {
            attacker.shotsHit++;
        }

        return false;
    }

    die() {
        this.alive = false;
        this.hp = 0;
        this.deaths++;
        this.respawnTimer = GAME_CONFIG.RESPAWN_TIME;
        this.vx = 0;
        this.vy = 0;
    }

    respawn() {
        this.alive = true;
        this.hp = this.maxHp;
        this.invulnerable = true;
        this.invulnerableTimer = GAME_CONFIG.INVULN_TIME;
        this.vx = 0;
        this.vy = 0;

        // Reset to default weapon and clear all ammo except pistol
        this.weapon = 'pistol';
        this.previousWeapon = 'pistol';
        this.ammo = WEAPONS.pistol.ammo;

        // Reset all weapon ammo on respawn
        this.weaponAmmo = {
            pistol: Infinity,
            shotgun: 0,
            assault_rifle: 0,
            sniper: 0,
            rocket_launcher: 0,
            Laser: 0,
            plasma_canon: 0
        };
    }

    setWeapon(weaponId, giveFullAmmo = false) {
        // Save current weapon's ammo before switching
        if (this.weapon) {
            this.weaponAmmo[this.weapon] = this.ammo;
        }

        this.weapon = weaponId;

        // If giveFullAmmo is true (picking up weapon), give full ammo
        // Otherwise, restore saved ammo
        if (giveFullAmmo) {
            this.weaponAmmo[weaponId] = WEAPONS[weaponId].ammo;
            this.ammo = WEAPONS[weaponId].ammo;
            console.log(`🔫 Picked up ${weaponId} with full ammo: ${this.ammo}`);
        } else {
            // Restore saved ammo for this weapon
            this.ammo = this.weaponAmmo[weaponId];
            console.log(`🔄 Switched to ${weaponId} with saved ammo: ${this.ammo}`);
        }

        // Load weapon sprite if not already loaded
        this.loadWeaponSprite(weaponId);
    }

    switchToWeapon(weaponId, giveFullAmmo = false) {
        console.log(`Player.switchToWeapon called with ${weaponId}`); // Debug logging
        // Only switch if it's a different weapon
        if (this.weapon !== weaponId) {
            console.log(`Switching weapon from ${this.weapon} to ${weaponId}`); // Debug logging
            // Store current weapon as previous, but keep pistol as previous if it's not already
            if (this.weapon !== 'pistol') {
                this.previousWeapon = this.weapon;
            }
            // Set new weapon (pass giveFullAmmo flag)
            this.setWeapon(weaponId, giveFullAmmo);
            return true;
        }
        console.log('No weapon switch needed - same weapon'); // Debug logging
        return false; // No switch needed
    }

    aimAt(targetX, targetY) {
        this.angle = Math.atan2(targetY - this.y, targetX - this.x);
    }

    render(ctx, camera) {
        // Convert world coordinates to screen coordinates
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.save();
        ctx.translate(screenX, screenY);
        
        // Premium character aura effect
        if (this.aura && !this.isBot) {
            const time = Date.now() / 1000;
            const pulse = Math.sin(time * 3) * 0.2 + 0.8; // Faster, tighter pulse

            // 1. Core Glow (Background Gradient)
            const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius * 2);
            gradient.addColorStop(0, this.aura.color);
            gradient.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.2 * pulse;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // 2. Rotating Outer Ring
            ctx.save();
            ctx.rotate(time); // Rotate continuously
            ctx.strokeStyle = this.aura.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = this.aura.glow;
            ctx.shadowBlur = 15;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 18, 0, Math.PI * 1.5); // Open ring
            ctx.stroke();
            ctx.restore();

            // 3. Rotating Inner Ring (Counter-rotating)
            ctx.save();
            ctx.rotate(-time * 1.5);
            ctx.strokeStyle = this.aura.glow;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 1.5); // Open ring
            ctx.stroke();
            ctx.restore();

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // Invulnerability shield
        if (this.invulnerable) {
            ctx.strokeStyle = COLORS.neonCyan;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Draw character sprite if loaded, otherwise draw circle
        const spriteReady = this.spriteLoaded && this.sprite.complete &&
            (this.sprite.naturalWidth > 0 || this.sprite.width > 0);

        if (spriteReady) {
            ctx.save();
            ctx.rotate(this.angle);

            ctx.drawImage(
                this.sprite,
                -this.spriteWidth / 2,
                -this.spriteHeight / 2,
                this.spriteWidth,
                this.spriteHeight
            );

            ctx.restore();
        } else {
            // Fallback: Draw colored circle
            ctx.fillStyle = this.color;
            ctx.strokeStyle = COLORS.textPrimary;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Direction indicator
            ctx.strokeStyle = COLORS.textPrimary;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(this.angle) * (this.radius + 10),
                Math.sin(this.angle) * (this.radius + 10));
            ctx.stroke();
        }

        // Draw weapon sprite if loaded
        const weaponReady = this.weaponSpriteLoaded[this.weapon] &&
            this.weaponSprites[this.weapon] &&
            this.weaponSprites[this.weapon].complete &&
            (this.weaponSprites[this.weapon].naturalWidth > 0 ||
                this.weaponSprites[this.weapon].width > 0);

        if (weaponReady) {
            ctx.save();
            ctx.rotate(this.angle);

            const hasCharacterSprite = spriteReady;
            // Position weapon higher (more negative Y) and further forward
            // Adjusted to be closer (near) to the player as requested
            const weaponOffsetX = hasCharacterSprite ? (this.spriteWidth / 2 - 15) : (this.radius);
            const weaponOffsetY = hasCharacterSprite ? (-this.weaponSpriteHeight / 2 - 8) : -20;

            ctx.drawImage(
                this.weaponSprites[this.weapon],
                weaponOffsetX,
                weaponOffsetY,
                this.weaponSpriteWidth,
                this.weaponSpriteHeight
            );

            ctx.restore();
        } else {
            // Weapon indicator fallback
            const weaponColor = WEAPONS[this.weapon].color;
            ctx.fillStyle = weaponColor;
            const weaponDist = spriteReady ? (this.spriteWidth / 2 - 5) : (this.radius);

            ctx.fillRect(
                Math.cos(this.angle) * weaponDist - 3,
                Math.sin(this.angle) * weaponDist - 3,
                6, 6
            );
        }

        ctx.restore();

        // Health bar above player
        this.renderHealthBar(ctx, camera);

        // Name tag above health bar
        this.renderNameTag(ctx, camera);
    }

    renderHealthBar(ctx, camera) {
        // Always show health bar for all players (not just local player)
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        const barWidth = 60;
        const barHeight = 6;
        const barY = screenY - this.radius - 15;

        ctx.save();

        // Background
        ctx.fillStyle = COLORS.uiDark;
        ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

        // Health fill
        const healthPercent = this.hp / this.maxHp;
        let healthColor;
        if (healthPercent > 0.6) {
            healthColor = COLORS.neonGreen;
        } else if (healthPercent > 0.3) {
            healthColor = COLORS.gold;
        } else {
            healthColor = COLORS.warningRed;
        }

        ctx.fillStyle = healthColor;
        ctx.fillRect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = COLORS.uiLight;
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX - barWidth / 2, barY, barWidth, barHeight);

        ctx.restore();
    }

    renderNameTag(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        const name = this.name || 'Player';

        ctx.save();
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.fillStyle = '#FFFFFF';

        const y = screenY - this.radius - 22;
        ctx.strokeText(name, screenX, y);
        ctx.fillText(name, screenX, y);
        ctx.restore();
    }

    getAccuracy() {
        if (this.shotsFired === 0) return 0;
        return Math.round((this.shotsHit / this.shotsFired) * 100);
    }
}