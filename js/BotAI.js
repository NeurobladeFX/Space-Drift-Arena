import { randomRange, angle, distance } from './physics.js';

export class BotAI {
    constructor(player) {
        this.player = player;
        this.target = null;
        this.reactionTime = 0.3; // Seconds
        this.reactionTimer = 0;
        this.moveTimer = 0;
        this.moveInterval = 2; // Shoot for movement every 2 seconds
    }

    update(deltaTime, target) {
        if (!this.player.alive) return;

        this.target = target;
        this.reactionTimer += deltaTime;
        this.moveTimer += deltaTime;

        // Decision making based on reaction time
        if (this.reactionTimer >= this.reactionTime) {
            this.makeDecision();
            this.reactionTimer = 0;
        }
    }

    makeDecision() {
        if (!this.target || !this.target.alive) {
            this.randomMovement();
            return;
        }

        // Aim at target
        const targetAngle = angle(this.player.x, this.player.y,
            this.target.x, this.target.y);
        this.player.angle = targetAngle;

        // Calculate distance to target
        const dist = distance(this.player.x, this.player.y,
            this.target.x, this.target.y);

        // Attack if in range
        if (dist < 600) {
            // Add some inaccuracy to make it more natural
            this.player.angle += randomRange(-0.1, 0.1);
            this.player.shooting = true;
        } else {
            // Too far, move toward target
            if (this.moveTimer >= this.moveInterval) {
                // Shoot in opposite direction to move toward target
                this.player.angle = targetAngle + Math.PI; // Opposite direction
                this.player.shooting = true;
                this.moveTimer = 0;
            }
        }

        // Random evasive movement
        if (Math.random() < 0.1) {
            this.player.angle += randomRange(-Math.PI / 2, Math.PI / 2);
            this.player.shooting = true;
        }
    }

    randomMovement() {
        if (this.moveTimer >= this.moveInterval) {
            this.player.angle = randomRange(0, Math.PI * 2);
            this.player.shooting = true;
            this.moveTimer = 0;
        }
    }
}
