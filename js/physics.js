import { GAME_CONFIG } from './config.js';

// ===== VECTOR MATH UTILITIES =====
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

// ===== COLLISION DETECTION =====
export function checkCircleCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (obj1.radius + obj2.radius);
}

export function checkCircleRectCollision(circle, rect) {
    const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
    const closestY = clamp(circle.y, rect.y, rect.y + rect.height);

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist < circle.radius;
}

// ===== PHYSICS FUNCTIONS =====
export function applyFriction(velocity) {
    return velocity * GAME_CONFIG.FRICTION;
}

export function capSpeed(vx, vy) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > GAME_CONFIG.MAX_SPEED) {
        const scale = GAME_CONFIG.MAX_SPEED / speed;
        return {
            vx: vx * scale,
            vy: vy * scale
        };
    }
    return { vx, vy };
}

export function bounceOffWalls(obj, mapWidth, mapHeight) {
    let bounced = false;

    // Left wall
    if (obj.x - obj.radius < 0) {
        obj.x = obj.radius;
        obj.vx = Math.abs(obj.vx) * GAME_CONFIG.BOUNCE_DAMPING;
        bounced = true;
    }

    // Right wall
    if (obj.x + obj.radius > mapWidth) {
        obj.x = mapWidth - obj.radius;
        obj.vx = -Math.abs(obj.vx) * GAME_CONFIG.BOUNCE_DAMPING;
        bounced = true;
    }

    // Top wall
    if (obj.y - obj.radius < 0) {
        obj.y = obj.radius;
        obj.vy = Math.abs(obj.vy) * GAME_CONFIG.BOUNCE_DAMPING;
        bounced = true;
    }

    // Bottom wall
    if (obj.y + obj.radius > mapHeight) {
        obj.y = mapHeight - obj.radius;
        obj.vy = -Math.abs(obj.vy) * GAME_CONFIG.BOUNCE_DAMPING;
        bounced = true;
    }

    return bounced;
}

export function resolveCircleCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return; // Objects at same position

    // Push objects apart
    const overlap = obj1.radius + obj2.radius - dist;
    const nx = dx / dist;
    const ny = dy / dist;

    obj1.x += nx * overlap * 0.5;
    obj1.y += ny * overlap * 0.5;
    obj2.x -= nx * overlap * 0.5;
    obj2.y -= ny * overlap * 0.5;

    // Reflect velocities
    const dvx = obj1.vx - obj2.vx;
    const dvy = obj1.vy - obj2.vy;
    const dotProduct = dvx * nx + dvy * ny;

    obj1.vx = (obj1.vx - dotProduct * nx) * GAME_CONFIG.BOUNCE_DAMPING;
    obj1.vy = (obj1.vy - dotProduct * ny) * GAME_CONFIG.BOUNCE_DAMPING;
    obj2.vx = (obj2.vx + dotProduct * nx) * GAME_CONFIG.BOUNCE_DAMPING;
    obj2.vy = (obj2.vy + dotProduct * ny) * GAME_CONFIG.BOUNCE_DAMPING;
}

// ===== RANDOM UTILITIES =====
export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

export function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

// ===== ID GENERATION =====
let idCounter = 0;
export function generateId() {
    return `id_${Date.now()}_${idCounter++}`;
}
