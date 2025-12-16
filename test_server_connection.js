// Simple test script to verify server connection
console.log('Testing connection to matchmaker server...');

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const matchmakerUrl = isLocal ? 'ws://localhost:3000' : 'wss://space-drift-arena.onrender.com';

console.log('Attempting to connect to:', matchmakerUrl);

try {
  const ws = new WebSocket(matchmakerUrl);
  
  ws.onopen = function() {
    console.log('✓ Successfully connected to matchmaker server');
    ws.close();
  };
  
  ws.onerror = function(error) {
    console.error('✗ Failed to connect to matchmaker server:', error);
  };
  
  ws.onclose = function() {
    console.log('Connection closed');
  };
} catch (error) {
  console.error('✗ Error creating WebSocket connection:', error);
}