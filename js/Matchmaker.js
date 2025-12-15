export class Matchmaker {
    constructor(serverUrl, multiplayer, ui) {
        // Handle both ws:// and wss:// protocols
        // For production deployments, wss:// should be used (standard port 443)
        // For local development, ws:// with explicit port is fine
        this.serverUrl = serverUrl || 'ws://localhost:3000';
        this.multiplayer = multiplayer;
        this.ui = ui;
        this.ws = null;
        this.peerId = null;
        this.inQueue = false;
        this.backoff = 1000; // start with 1s, double up to 16s on failures
    }

    setPeerId(id) {
        this.peerId = id;
    }

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
        
        try {
            const ws = new WebSocket(this.serverUrl);
            console.log('[Matchmaker] Attempting to connect to', this.serverUrl);
            
            ws.onopen = () => {
                console.log('[Matchmaker] Connected successfully to', this.serverUrl);
                this.ws = ws;
                this.backoff = 1000;
                if (this.onConnected) this.onConnected();
            };
            
            ws.onmessage = (ev) => this.handleMessage(ev);
            
            ws.onclose = (ev) => {
                console.warn('[Matchmaker] Disconnected from', this.serverUrl, 'Code:', ev.code, 'Reason:', ev.reason);
                this.ws = null;
                if (this.onDisconnected) this.onDisconnected(ev);
                
                // Implement exponential backoff for reconnection
                setTimeout(() => {
                    console.log('[Matchmaker] Attempting to reconnect to', this.serverUrl);
                    this.connect();
                }, this.backoff);
                
                this.backoff = Math.min(16000, this.backoff * 2);
            };
            
            ws.onerror = (ev) => {
                console.error('[Matchmaker] WebSocket error for', this.serverUrl, ':', ev.message || ev);
                // Close socket to trigger reconnect logic if still open
                try { ws.close(); } catch (e) { 
                    console.error('[Matchmaker] Error closing socket:', e);
                }
            };
        } catch (error) {
            console.error('[Matchmaker] Failed to create WebSocket connection to', this.serverUrl, ':', error);
        }
    }

    handleMessage(ev) {
        let msg;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }
        // Reduce logging frequency - only log important messages
        if (msg.type !== 'GAME_STATE' && msg.type !== 'MATCH_TIMER') {
            console.log('[Matchmaker] Received message from server:', msg);
        }
        // If this is a room/relay message, forward to multiplayer handler
        const roomTypes = ['PLAYER_LIST','PLAYER_JOINED','PLAYER_LEFT','GAME_STATE','PROJECTILES','HOST_ROOM_ACK','ERROR','START_GAME','DAMAGE','PLAYER_DEATH','SPAWN_PICKUP','MATCH_TIMER'];
        if (msg && msg.type && roomTypes.includes(msg.type)) {
            // Reduce logging frequency - only log important message types
            if (msg.type !== 'GAME_STATE' && msg.type !== 'MATCH_TIMER') {
                console.log('[Matchmaker] Forwarding room message to multiplayer handler:', msg.type);
            }
            if (this.multiplayer && this.multiplayer.handleData) {
                // Reduce logging frequency - only log important message types
                if (msg.type !== 'GAME_STATE' && msg.type !== 'MATCH_TIMER') {
                    console.log('[Matchmaker] Calling multiplayer.handleData with message:', msg.type);
                }
                this.multiplayer.handleData(msg);
                return;
            } else {
                console.log('[Matchmaker] No multiplayer handler available for message:', msg.type);
            }
        }

        switch (msg.type) {
            case 'MAKE_HOST':
                // We were chosen as host; call hostGame and confirm
                (async () => {
                    console.log('[Matchmaker] MAKE_HOST', msg);
                    try {
                        await this.multiplayer.hostGame();
                        if (this.inQueue) {
                            this.multiplayer.isRandomMatch = true;
                        }
                        // Notify server we're ready
                        this.send({ type: 'HOST_READY', peerId: this.peerId, roomId: this.multiplayer.getFullCode() });
                    } catch (e) {
                        console.error('Failed to become host', e);
                    }
                })();
                break;

            case 'AWAIT_HOST':
                console.log('[Matchmaker] Awaiting host:', msg.hostId);
                // do nothing - wait for MATCH_FOUND
                break;

            case 'MATCH_FOUND':
                console.log('[Matchmaker] Match found, connecting to host', msg.hostId);
                // join host's peer id
                (async () => {
                    try {
                        await this.multiplayer.joinGame(msg.hostId);
                        this.ui.showHostLobby(msg.hostId);
                    } catch (e) {
                        console.error('Failed to join host from matchmaker', e);
                        this.ui.showJoinError('Failed to join matched host');
                    }
                })();
                break;

            case 'HOST_CONFIRMED':
                console.log('[Matchmaker] Host confirmed. peers=', msg.peers);
                // host already started game flow elsewhere
                break;

            case 'MATCH_TIMEOUT':
                console.log('[Matchmaker] Match timed out');
                this.inQueue = false;
                this.ui.showMultiplayerOptions();
                break;
        }
    }

    send(obj) {
        // Reduce logging frequency - only log important message types
        if (obj.type !== 'GAME_STATE') {
            console.log('[Matchmaker] Sending message:', obj.type);
        }
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.log('[Matchmaker] WebSocket not open (readyState: ' + (this.ws ? this.ws.readyState : 'null') + '), attempting to connect');
            this.connect();
            setTimeout(() => this.send(obj), 200);
            return;
        }
        try {
            this.ws.send(JSON.stringify(obj));
            // Reduce logging frequency - only log important message types
            if (obj.type !== 'GAME_STATE') {
                console.log('[Matchmaker] Message sent successfully');
            }
        } catch (e) {
            console.error('[Matchmaker] Failed to send message:', e);
        }
    }

    findMatch(meta = {}) {
        if (!this.peerId) console.warn('[Matchmaker] peerId not set yet');
        this.connect();
        this.inQueue = true;
        this.send({ type: 'FIND_MATCH', peerId: this.peerId, meta });
    }

    cancelMatch() {
        if (!this.inQueue) return;
        this.inQueue = false;
        this.send({ type: 'CANCEL_MATCH', peerId: this.peerId });
    }
}
