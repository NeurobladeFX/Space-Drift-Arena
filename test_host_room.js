// Simple test script to verify HOST_ROOM message format
const WebSocket = require('ws');

console.log('Testing HOST_ROOM message format...');

// Connect to the server
const ws = new WebSocket('wss://space-drift-arena.onrender.com');

ws.on('open', function open() {
  console.log('Connected to server');
  
  // Send HOST_ROOM message with the exact format the client uses
  const message = {
    type: 'HOST_ROOM',
    roomId: 'test_room_' + Date.now(),
    peerId: 'test_peer_' + Date.now(),
    meta: {
      name: 'Test Player',
      avatar: null
    }
  };
  
  console.log('Sending HOST_ROOM message:', JSON.stringify(message, null, 2));
  ws.send(JSON.stringify(message));
});

ws.on('message', function incoming(data) {
  console.log('Received message from server:', data.toString());
  
  try {
    const parsed = JSON.parse(data.toString());
    console.log('Parsed message:', JSON.stringify(parsed, null, 2));
    
    if (parsed.type === 'HOST_ROOM_ACK') {
      console.log('✅ SUCCESS: Received HOST_ROOM_ACK!');
      ws.close();
    } else {
      console.log('Received different message type:', parsed.type);
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