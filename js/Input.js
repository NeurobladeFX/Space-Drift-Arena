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
            // Only log spacebar events to reduce console spam
            if (e.code === 'Space') {
                console.log('Space key down detected'); // Debug logging
            }
            this.keys[e.code] = true;
            // Only set keyPressed if the key wasn't already pressed
            if (!this.keyPressed[e.code]) {
                this.keyPressed[e.code] = true;
                // Only log spacebar events to reduce console spam
                if (e.code === 'Space') {
                    console.log('Space key press registered'); // Debug logging
                }
            }
            // Prevent default behavior for spacebar to avoid scrolling
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });
        
        this.canvas.addEventListener('keyup', (e) => {
            // Only log spacebar events to reduce console spam
            if (e.code === 'Space') {
                console.log('Space key up detected'); // Debug logging
            }
            this.keys[e.code] = false;
            this.keyPressed[e.code] = false;
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
        return this.mouseDown;
    }

    wasMouseClicked() {
        return this.mouseClicked;
    }
    
    isKeyPressed(keyCode) {
        // Only log spacebar events to reduce console spam
        if (keyCode === 'Space') {
            //console.log('Checking if key is pressed:', keyCode, 'Result:', !!this.keys[keyCode]); // Debug logging
        }
        return !!this.keys[keyCode];
    }
    
    wasKeyJustPressed(keyCode) {
        // Only log spacebar events to reduce console spam
        if (keyCode === 'Space') {
            //console.log('Checking if key was just pressed:', keyCode, 'Result:', !!this.keyPressed[keyCode]); // Debug logging
        }
        return !!this.keyPressed[keyCode];
    }

    getMouseWorld() {
        return {
            x: this.mouseWorldX,
            y: this.mouseWorldY
        };
    }
}