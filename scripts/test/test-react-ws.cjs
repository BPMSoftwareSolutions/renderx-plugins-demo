#!/usr/bin/env node

/**
 * Test React component selection via WebSocket
 */

const WebSocket = require('ws');

async function testReactSelection() {
  console.log('Testing React Component Selection via WebSocket\n');
  console.log('='.repeat(60) + '\n');

  const ports = [5173, 5174, 5175, 5176, 5177];
  let socket = null;
  let connectedPort = null;

  // Find conductor
  for (const port of ports) {
    try {
      socket = new WebSocket(`ws://localhost:${port}/conductor-ws`);
      await new Promise((resolve, reject) => {
        socket.once('open', resolve);
        socket.once('error', reject);
        setTimeout(() => reject(new Error('timeout')), 2000);
      });
      connectedPort = port;
      console.log('Connected to conductor on port', port + '\n');
      break;
    } catch (err) {
      socket = null;
    }
  }

  if (!socket) {
    console.error('Could not connect to conductor');
    process.exit(1);
  }

  return new Promise((resolve) => {
    const commandId = `test-${Date.now()}`;
    let responseReceived = false;

    socket.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log('Received message:', JSON.stringify(msg, null, 2));
        
        if (msg.id === commandId && msg.type === 'play-result') {
          responseReceived = true;
          console.log('\nSequence completed successfully!');
          socket.close();
          resolve();
        }
      } catch (e) {
        console.error('Error parsing message:', e.message);
      }
    });

    // Send play command
    console.log('Sending canvas-component-select-symphony...\n');
    socket.send(JSON.stringify({
      type: 'play',
      pluginId: 'CanvasComponentPlugin',
      sequenceId: 'canvas-component-select-symphony',
      context: { componentId: 'test-react', type: 'react' },
      id: commandId
    }));

    // Timeout
    setTimeout(() => {
      if (!responseReceived) {
        console.error('Timeout waiting for response');
        socket.close();
        resolve();
      }
    }, 10000);
  });
}

testReactSelection().catch(console.error);

