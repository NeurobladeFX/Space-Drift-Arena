export class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.basePath = 'assets/sounds/';

        // List of sounds to load
        this.soundList = [
            'background',
            'shoot',
            'die',
            'hover',
            'laser',
            'rocker'
        ];

        this.init();
    }

    init() {
        this.soundList.forEach(name => {
            this.loadSound(name);
        });
    }

    loadSound(name) {
        const audio = new Audio();
        audio.src = `${this.basePath}${name}.mp3`;

        // Handle loading errors (in case file doesn't exist)
        audio.onerror = () => {
            console.warn(`[SoundManager] Sound file not found: ${name}.mp3`);
            this.sounds[name] = null;
        };

        audio.oncanplaythrough = () => {
            // console.log(`[SoundManager] Loaded: ${name}`);
        };

        this.sounds[name] = audio;
    }

    play(name, volume = 0.5, loop = false) {
        if (!this.enabled || !this.sounds[name]) return;

        console.log(`[SoundManager] Playing: ${name} (Loop: ${loop})`);

        try {
            // Clone node to allow overlapping sounds (e.g. rapid fire)
            // For background music, we use the original to invoke loop
            let soundToPlay;

            if (loop) {
                soundToPlay = this.sounds[name];
                soundToPlay.loop = true;
            } else {
                soundToPlay = this.sounds[name].cloneNode();
            }

            soundToPlay.volume = volume;
            soundToPlay.currentTime = 0;

            const playPromise = soundToPlay.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Auto-play was prevented
                    // console.warn(`[SoundManager] Play prevented for ${name}`);
                });
            }
        } catch (e) {
            console.error(`[SoundManager] Error playing ${name}:`, e);
        }
    }

    stop(name) {
        if (this.sounds[name]) {
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            // Stop all sounds if muted
            Object.values(this.sounds).forEach(s => {
                if (s) s.pause();
            });
        }
        return this.enabled;
    }
}
