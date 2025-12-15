import { lerp } from './physics.js';

export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.smoothing = 0.1; // Lower = smoother, higher = more responsive
        this.zoom = 1; // Default zoom level
        this.targetZoom = 1;
        this.zoom = 1; // Default zoom level
        this.targetZoom = 1;
        this.zoomSmoothing = 0.1; // Increased for faster zoom response
    }

    follow(target) {
        if (!target) return;

        // Target position centers the target on screen
        this.targetX = target.x - this.canvasWidth / 2;
        this.targetY = target.y - this.canvasHeight / 2;

        // Smooth interpolation
        this.x = lerp(this.x, this.targetX, this.smoothing);
        this.y = lerp(this.y, this.targetY, this.smoothing);

        // Smooth zoom interpolation
        this.zoom = lerp(this.zoom, this.targetZoom, this.zoomSmoothing);
    }

    setZoom(zoomLevel) {
        this.targetZoom = zoomLevel;
    }

    apply(ctx) {
        ctx.save();
        // Apply zoom centered on screen
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);
        ctx.translate(-this.x, -this.y);
    }

    restore(ctx) {
        ctx.restore();
    }

    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
}
