const WebSocket = require('ws');

// Connect to the server
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
  console.log('Connected to server');
  
  // Send HOST_ROOM message
  const message = {
    type: 'HOST_ROOM',
    roomId: 'test_room_' + Date.now(),
    peerId: 'test_peer_' + Date.now(),
    meta: { name: 'Test Player' }
  };
  
  console.log('Sending HOST_ROOM message:', message);
  ws.send(JSON.stringify(message));
});

ws.on('message', function incoming(data) {
  console.log('Received:', data.toString());
  
  try {
    const parsed = JSON.parse(data);
    if (parsed.type === 'HOST_ROOM_ACK') {
      console.log('SUCCESS: Received HOST_ROOM_ACK!');
      process.exit(0);
    }
  } catch (e) {
    console.error('Failed to parse message:', e);
  }
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('Connection closed');
});