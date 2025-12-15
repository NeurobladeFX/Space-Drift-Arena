export class Matchmaker {
    constructor(serverUrl, multiplayer, ui) {
        // Handle both ws:// and wss:// protocols
        this.serverUrl = serverUrl || 'ws://localhost:3000';
        this.multiplayer = multiplayer;
        this.ui = ui;
        this.ws = null;
        this.peerId = null;
        this.inQueue = false;
    }

    setPeerId(id) {
        this.peerId = id;
    }

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
        const ws = new WebSocket(this.serverUrl);
        ws.onopen = () => {
            console.log('[Matchmaker] connected to', this.serverUrl);
            this.ws = ws;
            this.backoff = 1000;
            if (this.onConnected) this.onConnected();
        };
        ws.onmessage = (ev) => this.handleMessage(ev);
        ws.onclose = (ev) => {
            console.warn('[Matchmaker] disconnected', ev.code, ev.reason);
            this.ws = null;
            if (this.onDisconnected) this.onDisconnected(ev);
            setTimeout(() => {
                console.log('[Matchmaker] attempting reconnect');
                this.connect();
            }, this.backoff);
            this.backoff = Math.min(16000, this.backoff * 2);
        };
        ws.onerror = (ev) => {
            console.error('[Matchmaker] ws error', ev.message || ev);
            // Close socket to trigger reconnect logic if still open
            try { ws.close(); } catch (e) { }
        };
    }

    handleMessage(ev) {
        let msg;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }

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
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.connect();
            setTimeout(() => this.send(obj), 200);
            return;
        }
        this.ws.send(JSON.stringify(obj));
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
