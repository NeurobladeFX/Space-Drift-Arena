const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
    console.log('✅ Connected to server');

    // Test 1: Host a Room
    const peerId = 'test_host_' + Date.now();
    const roomId = 'test_room';

    console.log(`📤 Sending HOST_ROOM for ${peerId}`);
    ws.send(JSON.stringify({
        type: 'HOST_ROOM',
        roomId: roomId,
        peerId: peerId,
        meta: { name: 'TestHost' }
    }));
});

ws.on('message', (data) => {
    const msg = JSON.parse(data);
    console.log('📩 Received:', msg.type, msg);

    if (msg.type === 'HOST_ROOM_ACK') {
        console.log('✅ Room Created Successfully!');

        // Test 2: Simulate another player joining
        startJoinerTest();
    }
});

function startJoinerTest() {
    const ws2 = new WebSocket('ws://localhost:3000');
    const peerId2 = 'test_joiner_' + Date.now();

    ws2.on('open', () => {
        console.log('✅ Joiner Connected');
        console.log(`📤 Sending JOIN_ROOM for ${peerId2}`);
        ws2.send(JSON.stringify({
            type: 'JOIN_ROOM',
            roomId: 'test_room',
            peerId: peerId2,
            meta: { name: 'TestJoiner' }
        }));
    });

    ws2.on('message', (data) => {
        const msg = JSON.parse(data);
        console.log('📩 Joiner Received:', msg.type);
        if (msg.type === 'PLAYER_LIST') {
            console.log('✅ Joiner received Player List - SUCCESS');
            process.exit(0);
        }
        if (msg.type === 'ERROR') {
            console.error('❌ Joiner Error:', msg.message);
            process.exit(1);
        }
    });
}
