const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Configure CORS to allow all origins for itch.io deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1) {
      return callback(null, true);
    }
    
    // Allow itch.io domains
    if (origin.indexOf('itch.io') !== -1) {
      return callback(null, true);
    }
    
    // Allow render.com domains
    if (origin.indexOf('render.com') !== -1) {
      return callback(null, true);
    }
    
    // Allow any other origin (fallback for production)
    return callback(null, true);
  },
  credentials: true
};

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors(corsOptions));
// Limit JSON body size to avoid large payload abuse
app.use(bodyParser.json({ limit: '16kb' }));

// Simple in-memory rate limiting stores
const rateLimitByIp = new Map(); // ip -> {count, firstRequestTs}
const wsRateByPeer = new Map(); // peerId -> { lastFindTs, lastHostReadyTs }

// Redis client (optional). Use REDIS_URL env var if provided.
let redis = null;
try {
  const IORedis = require('ioredis');
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  redis = new IORedis(redisUrl);
  redis.on('error', (e) => console.warn('Redis error:', e.message || e));
  redis.on('connect', () => console.log('Connected to Redis'));
} catch (e) {
  console.log('ioredis not available or failed to initialize, using in-memory rate limits');
  redis = null;
}

// Redis-backed helpers (with in-memory fallback)
async function isRateLimitedIp(ip, maxRequests, windowMs) {
  if (redis) {
    try {
      const key = `rl:ip:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.pexpire(key, windowMs);
      return count > maxRequests;
    } catch (e) {
      return isRateLimited(ip, maxRequests, windowMs);
    }
  }
  return isRateLimited(ip, maxRequests, windowMs);
}

async function isPeerRateLimited(peerId, action, windowMs) {
  if (!peerId) return false;
  if (redis) {
    try {
      const key = `peer:${peerId}:${action}`;
      const ok = await redis.set(key, '1', 'PX', windowMs, 'NX');
      // if ok is null, the key exists -> rate limited
      return ok === null;
    } catch (e) {
      // fallback to in-memory
    }
  }

  // in-memory fallback: use wsRateByPeer timestamps
  const now = Date.now();
  const r = wsRateByPeer.get(peerId) || { lastFindTs: 0, lastHostReadyTs: 0 };
  if (action === 'find') {
    if (now - r.lastFindTs < windowMs) return true;
    r.lastFindTs = now;
  } else if (action === 'hostready') {
    if (now - r.lastHostReadyTs < windowMs) return true;
    r.lastHostReadyTs = now;
  }
  wsRateByPeer.set(peerId, r);
  return false;
}

// Helpers
function isRateLimited(ip, maxRequests, windowMs) {
  const now = Date.now();
  let entry = rateLimitByIp.get(ip);
  if (!entry) {
    entry = { count: 1, firstRequestTs: now };
    rateLimitByIp.set(ip, entry);
    return false;
  }
  if (now - entry.firstRequestTs > windowMs) {
    // reset window
    entry.count = 1;
    entry.firstRequestTs = now;
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}

function sanitizeName(name) {
  if (!name || typeof name !== 'string') return null;
  let s = name.trim();
  // Remove control characters
  s = s.replace(/[\x00-\x1F\x7F]/g, '');
  // Allow letters, numbers, spaces and a few punctuation chars
  s = s.replace(/[^\p{L}\p{N} _\-.'"]/u, '');
  if (s.length === 0) return null;
  if (s.length > 24) s = s.substring(0, 24);
  return s;
}

// Simple leaderboard persistence
function loadLeaderboard() {
  // kept for compatibility but prefer redis-backed reads using async helper
  try {
    return JSON.parse(fs.readFileSync(LEADERBOARD_FILE));
  } catch (e) {
    return [];
  }
}

function saveLeaderboard(data) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
}

// Async Redis-backed helpers for leaderboard & matches (with file fallback)
async function getLeaderboardEntries(limit = 100) {
  if (redis) {
    try {
      const items = await redis.lrange('leaderboard:list', 0, limit - 1);
      return items.map(i => {
        try { return JSON.parse(i); } catch (e) { return null; }
      }).filter(Boolean);
    } catch (e) {
      console.warn('Redis leaderboard read failed, falling back to file');
    }
  }
  return loadLeaderboard().slice(0, limit);
}

async function pushLeaderboardEntry(entry, maxLen = 1000) {
  if (redis) {
    try {
      await redis.lpush('leaderboard:list', JSON.stringify(entry));
      await redis.ltrim('leaderboard:list', 0, maxLen - 1);
      return;
    } catch (e) {
      console.warn('Redis leaderboard write failed, falling back to file');
    }
  }

  // file fallback: append to existing file array
  const board = loadLeaderboard();
  board.unshift(entry);
  if (board.length > maxLen) board.length = maxLen;
  saveLeaderboard(board);
}

async function getMatches(limit = 200) {
  if (redis) {
    try {
      const items = await redis.lrange('matches:list', 0, limit - 1);
      return items.map(i => {
        try { return JSON.parse(i); } catch (e) { return null; }
      }).filter(Boolean);
    } catch (e) {
      console.warn('Redis matches read failed, falling back to file');
    }
  }
  return loadMatches().slice(0, limit);
}

async function pushMatchRecord(record, maxLen = 2000) {
  if (redis) {
    try {
      await redis.lpush('matches:list', JSON.stringify(record));
      await redis.ltrim('matches:list', 0, maxLen - 1);
      return;
    } catch (e) {
      console.warn('Redis matches write failed, falling back to file');
    }
  }

  const matches = loadMatches();
  matches.unshift(record);
  if (matches.length > maxLen) matches.length = maxLen;
  saveMatches(matches);
}

function loadMatches() {
  try {
    return JSON.parse(fs.readFileSync(MATCHES_FILE));
  } catch (e) {
    return [];
  }
}

function saveMatches(data) {
  fs.writeFileSync(MATCHES_FILE, JSON.stringify(data, null, 2));
}

// REST: get top N
app.get('/leaderboard', async (req, res) => {
  try {
    const entries = await getLeaderboardEntries(100);
    // sort descending
    entries.sort((a, b) => (b.score || 0) - (a.score || 0));
    res.json(entries.slice(0, 100));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// Fix for Chrome DevTools 404 error
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.sendStatus(200);
});

// REST: submit score
app.post('/leaderboard', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  // basic IP rate limit: 60 requests / 1 minute
  if (await isRateLimitedIp(ip, 60, 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { playerId, name, score } = req.body || {};
  if (!playerId || typeof score !== 'number') return res.status(400).json({ error: 'Missing fields' });

  // Clamp/validate score
  if (!isFinite(score) || score < 0 || score > 1e9) return res.status(400).json({ error: 'Invalid score' });

  const cleanName = sanitizeName(name) || 'Player';

  const entry = { playerId, name: cleanName, score, timestamp: Date.now() };
  try {
    await pushLeaderboardEntry(entry);
    res.json({ success: true });
  } catch (e) {
    console.warn('Failed to push leaderboard entry', e);
    res.status(500).json({ error: 'Failed to save leaderboard' });
  }
});

// Match history endpoints
app.get('/matches', async (req, res) => {
  try {
    const matches = await getMatches(200);
    matches.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    res.json(matches.slice(0, 200));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load matches' });
  }
});

app.post('/matches', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  // basic IP rate limit: 30 match posts / 10 minutes
  if (await isRateLimitedIp(ip, 30, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many match submissions' });
  }

  const data = req.body || {};
  if (!data || !data.matchId || !Array.isArray(data.players)) return res.status(400).json({ error: 'Invalid match payload' });

  // Validate players array length
  if (data.players.length === 0 || data.players.length > 64) return res.status(400).json({ error: 'Invalid players array' });

  // Sanitize player entries
  const cleanPlayers = [];
  for (const p of data.players) {
    if (!p || !p.playerId) continue;
    const pn = sanitizeName(p.name) || 'Player';
    const kills = Number.isFinite(Number(p.kills)) ? Math.max(0, Math.floor(Number(p.kills))) : 0;
    const deaths = Number.isFinite(Number(p.deaths)) ? Math.max(0, Math.floor(Number(p.deaths))) : 0;
    cleanPlayers.push({ playerId: p.playerId, name: pn, kills, deaths });
  }
  if (cleanPlayers.length === 0) return res.status(400).json({ error: 'No valid players' });

  const record = Object.assign({ timestamp: Date.now() }, data, { players: cleanPlayers });
  try {
    await pushMatchRecord(record);
    res.json({ success: true });
  } catch (e) {
    console.warn('Failed to save match record', e);
    res.status(500).json({ error: 'Failed to save match' });
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Matchmaking queue and pending matches
const queue = [];
const pendingMatches = new Map(); // hostId -> {hostWs, peers: [{peerId, ws}], timeout}
const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;

// Room management
const rooms = new Map(); // roomId -> {hostId, players: [{id, ws, meta}], settings}

function send(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch (e) { }
}

function broadcastToRoom(roomId, obj, excludePeerId = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  for (const player of room.players) {
    if (player.id === excludePeerId) continue;
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      send(player.ws, obj);
    }
  }
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => ws.isAlive = true);

  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch (e) { return; }

    // Use an async IIFE so we can await Redis checks
    (async () => {
      switch (data.type) {
        case 'HOST_ROOM': {
          if (!data.roomId || !data.peerId) {
            return send(ws, { type: 'ERROR', message: 'Missing roomId or peerId' });
          }
          
          // Check if room already exists
          if (rooms.has(data.roomId)) {
            return send(ws, { type: 'ERROR', message: 'Room already exists' });
          }
          
          // Create room
          const playerName = (data.meta && data.meta.name) ? sanitizeName(data.meta.name) : 'Player';
          const playerAvatar = (data.meta && data.meta.avatar) ? data.meta.avatar : null;
          
          rooms.set(data.roomId, {
            hostId: data.peerId,
            players: [{
              id: data.peerId,
              name: playerName,
              avatar: playerAvatar,
              ws: ws,
              meta: data.meta || {}
            }],
            settings: {}
          });
          
          // Confirm room creation
          send(ws, { type: 'HOST_ROOM_ACK', roomId: data.roomId });
          console.log(`[Room] Room ${data.roomId} created by ${data.peerId}`);
          break;
        }
        
        case 'JOIN_ROOM': {
          if (!data.roomId || !data.peerId) {
            return send(ws, { type: 'ERROR', message: 'Missing roomId or peerId' });
          }
          
          const room = rooms.get(data.roomId);
          if (!room) {
            return send(ws, { type: 'ERROR', message: 'Room not found' });
          }
          
          // Check if player already in room
          if (room.players.find(p => p.id === data.peerId)) {
            return send(ws, { type: 'ERROR', message: 'Already in room' });
          }
          
          // Add player to room
          const playerName = (data.meta && data.meta.name) ? sanitizeName(data.meta.name) : 'Player';
          const playerAvatar = (data.meta && data.meta.avatar) ? data.meta.avatar : null;
          
          room.players.push({
            id: data.peerId,
            name: playerName,
            avatar: playerAvatar,
            ws: ws,
            meta: data.meta || {}
          });
          
          // Send player list to joining player
          const playerList = room.players.map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            meta: p.meta
          }));
          
          send(ws, { type: 'PLAYER_LIST', players: playerList });
          
          // Notify others in room about new player
          broadcastToRoom(data.roomId, {
            type: 'PLAYER_JOINED',
            player: {
              id: data.peerId,
              name: playerName,
              avatar: playerAvatar,
              meta: data.meta || {}
            }
          }, data.peerId);
          
          console.log(`[Room] Player ${data.peerId} joined room ${data.roomId}`);
          break;
        }
        
        case 'LEAVE_ROOM': {
          if (!data.roomId || !data.peerId) {
            return;
          }
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Remove player from room
          const playerIndex = room.players.findIndex(p => p.id === data.peerId);
          if (playerIndex === -1) return;
          
          const removedPlayer = room.players.splice(playerIndex, 1)[0];
          
          // If room is empty, delete it
          if (room.players.length === 0) {
            rooms.delete(data.roomId);
            console.log(`[Room] Room ${data.roomId} deleted (empty)`);
            return;
          }
          
          // If host left, assign new host
          if (room.hostId === data.peerId) {
            room.hostId = room.players[0].id;
            console.log(`[Room] New host assigned: ${room.hostId}`);
          }
          
          // Notify others in room about player leaving
          broadcastToRoom(data.roomId, {
            type: 'PLAYER_LEFT',
            playerId: data.peerId
          });
          
          console.log(`[Room] Player ${data.peerId} left room ${data.roomId}`);
          break;
        }
        
        case 'START_GAME': {
          if (!data.roomId) return;
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Only host can start game
          if (room.hostId !== data.peerId) {
            return send(ws, { type: 'ERROR', message: 'Only host can start game' });
          }
          
          // Broadcast start game to all players
          broadcastToRoom(data.roomId, {
            type: 'START_GAME',
            settings: data.settings || {}
          });
          
          console.log(`[Room] Game started in room ${data.roomId}`);
          break;
        }
        
        case 'GAME_STATE': {
          if (!data.roomId || !data.playerId) return;
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Broadcast game state to all other players
          broadcastToRoom(data.roomId, {
            type: 'GAME_STATE',
            playerId: data.playerId,
            player: data.player
          }, data.playerId);
          break;
        }
        
        case 'PROJECTILES': {
          if (!data.roomId || !data.playerId) return;
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Broadcast projectiles to all other players
          broadcastToRoom(data.roomId, {
            type: 'PROJECTILES',
            playerId: data.playerId,
            projectiles: data.projectiles
          }, data.playerId);
          break;
        }
        
        case 'DAMAGE': {
          if (!data.roomId || !data.playerId || !data.targetId) return;
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Broadcast damage to target player
          const targetPlayer = room.players.find(p => p.id === data.targetId);
          if (targetPlayer && targetPlayer.ws && targetPlayer.ws.readyState === WebSocket.OPEN) {
            send(targetPlayer.ws, {
              type: 'DAMAGE',
              attackerId: data.playerId,
              damage: data.damage,
              timestamp: data.timestamp
            });
          }
          break;
        }
        
        case 'PLAYER_DEATH': {
          if (!data.roomId || !data.victimId) return;
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Broadcast death to all players
          broadcastToRoom(data.roomId, {
            type: 'PLAYER_DEATH',
            victimId: data.victimId,
            killerId: data.killerId
          });
          break;
        }
        
        case 'SPAWN_PICKUP': {
          if (!data.roomId) return;
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Broadcast pickup spawn to all players
          broadcastToRoom(data.roomId, {
            type: 'SPAWN_PICKUP',
            pickup: data.pickup
          });
          break;
        }
        
        case 'MATCH_TIMER': {
          if (!data.roomId) return;
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Only host can send timer updates
          if (room.hostId !== data.playerId) return;
          
          // Broadcast timer to all players
          broadcastToRoom(data.roomId, {
            type: 'MATCH_TIMER',
            timeLeft: data.timeLeft
          });
          break;
        }
        
        case 'PLAY_SOUND': {
          if (!data.roomId || !data.playerId) return;
          
          const room = rooms.get(data.roomId);
          if (!room) return;
          
          // Broadcast sound event to all other players
          broadcastToRoom(data.roomId, {
            type: 'PLAY_SOUND',
            playerId: data.playerId,
            sound: data.sound,
            volume: data.volume
          }, data.playerId);
          break;
        }
        
        case 'FIND_MATCH': {
          if (!data.peerId) return;
          // Rate limit FIND_MATCH per peerId (once every 3s)
          if (await isPeerRateLimited(data.peerId, 'find', 3000)) {
            return send(ws, { type: 'ERROR', code: 'RATE_LIMIT', message: 'Find requests too frequent' });
          }

          // Avoid duplicates
          if (queue.find(q => q.peerId === data.peerId)) return;
          // sanitize meta name if provided
          if (data.meta && data.meta.name) data.meta.name = sanitizeName(data.meta.name) || undefined;
          queue.push({ peerId: data.peerId, ws, meta: data.meta || {} });
          console.log('Queue length:', queue.length);

          // If enough players, create a match
          if (queue.length >= MIN_PLAYERS) {
            const group = [];
            for (let i = 0; i < Math.min(MAX_PLAYERS, queue.length); i++) {
              group.push(queue.shift());
            }

            const host = group[0];
            const others = group.slice(1);
            const hostId = host.peerId;

            // Store pending match
            pendingMatches.set(hostId, { hostWs: host.ws, peers: group.map(g => ({ peerId: g.peerId, ws: g.ws })), ready: false, timeout: null });

            // Ask host to become host
            send(host.ws, { type: 'MAKE_HOST', roomId: `match_${Date.now()}`, peers: group.map(g => g.peerId) });

            // Ask others to wait and prepare to connect
            for (let p of others) {
              send(p.ws, { type: 'AWAIT_HOST', hostId });
            }

            // set timeout: if host doesn't confirm, put others back in queue
            const t = setTimeout(() => {
              const pending = pendingMatches.get(hostId);
              if (!pending || pending.ready) return;
              // put others back
              for (let p of pending.peers) {
                if (p.peerId !== hostId) queue.push(p);
                try { send(p.ws, { type: 'MATCH_TIMEOUT' }); } catch (e) { }
              }
              pendingMatches.delete(hostId);
            }, 15000);

            pendingMatches.get(hostId).timeout = t;
          }
          break;
        }

        case 'HOST_READY': {
          const hostId = data.peerId;
          const pending = pendingMatches.get(hostId);
          if (!pending) break;
          // Rate limit HOST_READY per host peer (once every 2s)
          if (await isPeerRateLimited(hostId, 'hostready', 2000)) {
            break;
          }

          pending.ready = true;
          clearTimeout(pending.timeout);

          // Inform all non-host players to join host
          for (let p of pending.peers) {
            if (p.peerId === hostId) continue;
            send(p.ws, { type: 'MATCH_FOUND', roomId: data.roomId || `room_${Date.now()}`, hostId });
          }

          // Inform host match started and provide peer list
          send(pending.hostWs, { type: 'HOST_CONFIRMED', roomId: data.roomId || `room_${Date.now()}`, peers: pending.peers.map(x => x.peerId) });

          pendingMatches.delete(hostId);
          break;
        }

        case 'CANCEL_MATCH': {
          const peerId = data.peerId;
          // remove from queue
          for (let i = 0; i < queue.length; i++) if (queue[i].peerId === peerId) queue.splice(i, 1);
          // if in pending, remove and requeue others
          for (let [hostId, pending] of pendingMatches.entries()) {
            const idx = pending.peers.findIndex(p => p.peerId === peerId);
            if (idx !== -1) {
              // remove
              const removed = pending.peers.splice(idx, 1)[0];
              if (pending.hostWs && pending.hostWs !== removed.ws) send(pending.hostWs, { type: 'PEER_CANCELLED', peerId });
              // requeue others
              for (let p of pending.peers) if (p.peerId !== hostId) queue.push(p);
              clearTimeout(pending.timeout);
              pendingMatches.delete(hostId);
              break;
            }
          }
          break;
        }
      }
    })();
  });

  ws.on('close', () => {
    // clean queue
    for (let i = 0; i < queue.length; i++) if (queue[i].ws === ws) queue.splice(i, 1);
    // remove from pending
    for (let [hostId, pending] of pendingMatches.entries()) {
      const idx = pending.peers.findIndex(p => p.ws === ws);
      if (idx !== -1) {
        const peer = pending.peers.splice(idx, 1)[0];
        for (let p of pending.peers) queue.push(p);
        clearTimeout(pending.timeout);
        pendingMatches.delete(hostId);
        break;
      }
    }
    
    // Remove player from any rooms they might be in
    for (let [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.ws === ws);
      if (playerIndex !== -1) {
        const removedPlayer = room.players.splice(playerIndex, 1)[0];
        
        // If room is empty, delete it
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`[Room] Room ${roomId} deleted (player disconnect)`);
          return;
        }
        
        // If host left, assign new host
        if (room.hostId === removedPlayer.id) {
          room.hostId = room.players[0].id;
          console.log(`[Room] New host assigned: ${room.hostId}`);
        }
        
        // Notify others in room about player leaving
        broadcastToRoom(roomId, {
          type: 'PLAYER_LEFT',
          playerId: removedPlayer.id
        });
        
        console.log(`[Room] Player ${removedPlayer.id} disconnected from room ${roomId}`);
      }
    }
  });
});

// Ping to keep websockets alive
setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`Matchmaking + Leaderboard server running on port ${PORT}`);
});