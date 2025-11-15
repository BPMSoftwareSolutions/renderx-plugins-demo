/**
 * Move a component on the canvas via CLI
 */

import WebSocket from 'ws';

async function moveComponent() {
  console.log('🎯 Moving component via CLI...\n');
  
  const ws = new WebSocket('ws://localhost:5174/conductor-ws');
  
  ws.on('open', () => {
    console.log('✅ Connected to browser conductor WebSocket');
    console.log('📤 Sending update commands to move component...');
    console.log('   Moving PROOF button to top-right corner (1700, 50)\n');

    // The update handler expects { id, attribute, value } format
    // We need to send TWO commands: one for x, one for y
    const componentId = 'rx-node-proof-1763163107507'; // Full DOM id

    const commands = [
      {
        type: 'play',
        pluginId: 'CanvasComponentPlugin',
        sequenceId: 'canvas-component-update-symphony',
        context: {
          id: componentId,
          attribute: 'x',
          value: 1700
        },
        id: `move-x-${Date.now()}`
      },
      {
        type: 'play',
        pluginId: 'CanvasComponentPlugin',
        sequenceId: 'canvas-component-update-symphony',
        context: {
          id: componentId,
          attribute: 'y',
          value: 50
        },
        id: `move-y-${Date.now()}`
      }
    ];

    console.log('📨 Sending update commands (x and y)...');

    // Send both commands with a small delay
    ws.send(JSON.stringify(commands[0]));
    setTimeout(() => {
      ws.send(JSON.stringify(commands[1]));
    }, 100);
  });
  
  let ackCount = 0;
  ws.on('message', (data) => {
    const response = JSON.parse(data.toString());
    if (response.type === 'ack') {
      ackCount++;
      console.log(`✅ Command ${ackCount}/2 acknowledged: ${response.id}`);

      if (ackCount === 2) {
        console.log('\n' + '='.repeat(70));
        console.log('✅ Component moved to top-right corner!');
        console.log('='.repeat(70));
        console.log('\n🎯 The PROOF button should now be at position (1700, 50)');
        console.log('💡 Check the browser - it should be in the top-right corner!\n');

        setTimeout(() => {
          ws.close();
          process.exit(0);
        }, 1000);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });
}

moveComponent();

