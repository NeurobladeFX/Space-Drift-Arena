export class Input {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseWorldX = 0;
        this.mouseWorldY = 0;
        this.mouseDown = false;
        this.mouseClicked = false;

        // Keyboard state
        this.keys = {};
        this.keyPressed = {}; // For one-time key presses

        // Mobile touch controls
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            angle: 0,
            distance: 0,
            maxDistance: 60
        };
        this.fireButton = {
            active: false,
            pressed: false,
            x: 0,
            y: 0,
            radius: 50
        };

        // Setup event listeners
        this.setupListeners();
    }

    setupListeners() {
        // Mouse move
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;

            // Convert to world coordinates
            const worldPos = this.camera.screenToWorld(this.mouseX, this.mouseY);
            this.mouseWorldX = worldPos.x;
            this.mouseWorldY = worldPos.y;
        });

        // Mouse down
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.mouseClicked = true;
        });

        // Mouse up
        this.canvas.addEventListener('mouseup', (e) => {
            this.mouseDown = false;
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Keyboard events - attach to canvas instead of document
        this.canvas.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                console.log('Space key down detected');
            }
            this.keys[e.code] = true;
            if (!this.keyPressed[e.code]) {
                this.keyPressed[e.code] = true;
                if (e.code === 'Space') {
                    console.log('Space key press registered');
                }
            }
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });

        this.canvas.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                console.log('Space key up detected');
            }
            this.keys[e.code] = false;
            this.keyPressed[e.code] = false;
        });

        // Touch controls (mobile)
        if (this.isMobile) {
            this.setupTouchControls();
        }
    }

    setupTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (let touch of e.touches) {
                const rect = this.canvas.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;

                // Left half = joystick
                if (touchX < this.canvas.width / 2) {
                    this.joystick.active = true;
                    this.joystick.startX = touchX;
                    this.joystick.startY = touchY;
                    this.joystick.currentX = touchX;
                    this.joystick.currentY = touchY;
                }
                // Right half = fire button
                else {
                    this.fireButton.active = true;
                    this.fireButton.pressed = true;
                    this.fireButton.x = touchX;
                    this.fireButton.y = touchY;
                }
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let touch of e.touches) {
                const rect = this.canvas.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;

                // Update joystick
                if (this.joystick.active && touchX < this.canvas.width / 2) {
                    this.joystick.currentX = touchX;
                    this.joystick.currentY = touchY;

                    const dx = touchX - this.joystick.startX;
                    const dy = touchY - this.joystick.startY;
                    this.joystick.distance = Math.min(Math.sqrt(dx * dx + dy * dy), this.joystick.maxDistance);
                    this.joystick.angle = Math.atan2(dy, dx);
                }
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            // Check if any touches remain
            if (e.touches.length === 0) {
                this.joystick.active = false;
                this.fireButton.active = false;
                this.fireButton.pressed = false;
            } else {
                // Reset joystick or fire button based on which touch ended
                let hasLeftTouch = false;
                let hasRightTouch = false;

                for (let touch of e.touches) {
                    const rect = this.canvas.getBoundingClientRect();
                    const touchX = touch.clientX - rect.left;
                    if (touchX < this.canvas.width / 2) {
                        hasLeftTouch = true;
                    } else {
                        hasRightTouch = true;
                    }
                }

                if (!hasLeftTouch) {
                    this.joystick.active = false;
                }
                if (!hasRightTouch) {
                    this.fireButton.active = false;
                    this.fireButton.pressed = false;
                }
            }
        });
    }

    update() {
        // Reset one-frame states
        this.mouseClicked = false;

        // Reset one-time key presses - only reset keys that are no longer held down
        for (let key in this.keyPressed) {
            if (!this.keys[key]) {
                this.keyPressed[key] = false;
            }
        }
    }

    isMouseDown() {
        return this.mouseDown || this.fireButton.pressed;
    }

    wasMouseClicked() {
        return this.mouseClicked || this.fireButton.pressed;
    }

    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }

    wasKeyJustPressed(keyCode) {
        return !!this.keyPressed[keyCode];
    }

    getMouseWorld() {
        return {
            x: this.mouseWorldX,
            y: this.mouseWorldY
        };
    }

    // Mobile joystick helpers
    getJoystickInput() {
        if (!this.joystick.active) {
            return { x: 0, y: 0 };
        }

        const dx = this.joystick.currentX - this.joystick.startX;
        const dy = this.joystick.currentY - this.joystick.startY;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), this.joystick.maxDistance);
        const angle = Math.atan2(dy, dx);

        return {
            x: (distance / this.joystick.maxDistance) * Math.cos(angle),
            y: (distance / this.joystick.maxDistance) * Math.sin(angle),
            angle: angle,
            magnitude: distance / this.joystick.maxDistance
        };
    }

    isFireButtonPressed() {
        return this.fireButton.pressed;
    }

    // Render mobile controls (call this from main render loop)
    renderMobileControls(ctx) {
        if (!this.isMobile) return;

        ctx.save();

        // Joystick
        if (this.joystick.active) {
            // Base circle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(this.joystick.startX, this.joystick.startY, this.joystick.maxDistance, 0, Math.PI * 2);
            ctx.fill();

            // Stick
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(this.joystick.currentX, this.joystick.currentY, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        // Fire button
        if (this.fireButton.active || this.fireButton.pressed) {
            ctx.fillStyle = this.fireButton.pressed ? 'rgba(255, 50, 50, 0.6)' : 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.fireButton.x, this.fireButton.y, this.fireButton.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Fire icon (crosshair)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.fireButton.x - 20, this.fireButton.y);
            ctx.lineTo(this.fireButton.x + 20, this.fireButton.y);
            ctx.moveTo(this.fireButton.x, this.fireButton.y - 20);
            ctx.lineTo(this.fireButton.x, this.fireButton.y + 20);
            ctx.stroke();
        }

        ctx.restore();
    }
}