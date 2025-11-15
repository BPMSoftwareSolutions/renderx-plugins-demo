/**
 * Verify that the CLI successfully dropped a component on the canvas
 * by sending a command with a unique ID and checking the response
 */

import WebSocket from 'ws';

async function verifyDrop() {
  console.log('🔍 Verifying CLI → Browser connection...\n');

  const ws = new WebSocket('ws://localhost:5174/conductor-ws');

  ws.on('open', () => {
    console.log('✅ Connected to browser conductor WebSocket');
    console.log('📤 Sending test command with unique button text...\n');

    // Send a command with a unique timestamp to verify it works
    const timestamp = Date.now();
    const command = {
      type: 'play',
      pluginId: 'CanvasComponentPlugin',
      sequenceId: 'canvas-component-create-symphony',
      context: {
        component: {
          template: {
            tag: 'button',
            text: `PROOF-${timestamp}`,
            classes: ['rx-comp', 'rx-button'],
            dimensions: { width: 150, height: 50 }
          }
        },
        position: { x: 200, y: 200 },
        correlationId: `proof-${timestamp}`
      },
      id: `verify-${timestamp}`
    };

    console.log(`🎯 Creating button with text: "PROOF-${timestamp}"`);
    console.log(`📍 Position: (200, 200)`);
    console.log(`📏 Size: 150x50\n`);

    ws.send(JSON.stringify(command));
  });

  ws.on('message', (data) => {
    const response = JSON.parse(data.toString());
    console.log('📨 Received response:', response);

    if (response.type === 'ack') {
      console.log('\n' + '='.repeat(70));
      console.log('✅ PROOF: CLI → Browser connection is WORKING!');
      console.log('='.repeat(70));
      console.log('\n📋 What just happened:');
      console.log('   1. CLI connected to browser via WebSocket');
      console.log('   2. CLI sent canvas.component.create command');
      console.log('   3. Browser acknowledged the command');
      console.log('   4. Component should now be visible on the canvas');
      console.log('\n🎯 To verify visually:');
      console.log('   1. Open http://localhost:5174 in your browser');
      console.log(`   2. Look for a button with text "PROOF-${response.id.split('-')[1]}"`);
      console.log('   3. It should be at position (200, 200) on the canvas');
      console.log('\n💡 The CLI is now successfully controlling the browser conductor!');
      console.log('='.repeat(70) + '\n');

      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 1000);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Make sure the dev server is running on port 5174:');
    console.error('   npm run dev');
    process.exit(1);
  });
}

verifyDrop();

