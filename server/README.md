# Space Drift Arena Matchmaking & Leaderboard Server

This is a simple Node.js server that provides:

- WebSocket-based matchmaking (local queue, group up to 6 players)
- REST endpoints for leaderboard (GET /leaderboard, POST /leaderboard)

Quick start

1. Install dependencies

```bash
cd server
npm install
```

2. Run server

```bash
npm start
```

Server will listen on port 3000 by default. WebSocket connections should connect to `ws://<host>:3000` and REST endpoints at `http://<host>:3000/leaderboard`.

Matchmaking WS messages

- Client -> Server
  - `{ type: 'FIND_MATCH', peerId: '<peer-id>', meta: { ... } }` -- enqueue for matchmaking
  - `{ type: 'HOST_READY', peerId: '<peer-id>', roomId: '<room-id>' }` -- host confirms ready
  - `{ type: 'CANCEL_MATCH', peerId: '<peer-id>' }` -- cancel search

- Server -> Client
  - `{ type: 'MAKE_HOST', roomId, peers: [peerIds...] }` -- you were selected as host
  - `{ type: 'AWAIT_HOST', hostId }` -- wait for host to become ready
  - `{ type: 'MATCH_FOUND', roomId, hostId }` -- connect to host with peer id
  - `{ type: 'HOST_CONFIRMED', roomId, peers }` -- host confirmation
  - `{ type: 'MATCH_TIMEOUT' }` -- match failed/timeouted

Leaderboard REST

- GET `/leaderboard` returns top scores
- POST `/leaderboard` with JSON `{ playerId, name, score }` to submit a score

Match History REST

- GET `/matches` returns recent matches (most recent first)
- POST `/matches` with JSON `{ matchId, players: [{playerId, name, kills, deaths}], winnerId, duration, gameMode }` to record a match

Rate limiting and validation

- REST requests are limited by IP to prevent abuse (example limits: leaderboard ~60/min, matches ~30/10min). Clients receiving HTTP 429 should back off.
- Names are sanitized and truncated to 24 characters; invalid names are replaced with `Player`.
- Match submissions validate numeric fields and players array length.

Redis support

- The server supports Redis-backed rate limits for production use. Set `REDIS_URL` env var to point to your Redis instance (e.g. `redis://:password@host:6379`).
- If Redis is unavailable, the server falls back to in-memory rate limits (non-persistent across restarts).

Redis persistence for leaderboard and matches

- When Redis is available the server stores leaderboard entries in a Redis list `leaderboard:list` and match records in `matches:list` (latest first). The server trims lists to a configurable max length.
- If Redis is not available the server continues to use file-based persistence under `server/data/`.
