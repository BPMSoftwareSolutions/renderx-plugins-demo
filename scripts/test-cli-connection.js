// Test script to verify CLI can connect to browser conductor
import WebSocket from 'ws';

async function testConnection() {
  console.log('🎯 Testing CLI → Browser connection...\n');

  const ws = new WebSocket('ws://localhost:5174/conductor-ws');
  
  ws.on('open', () => {
    console.log('✅ Connected to browser conductor WebSocket');
    
    // Send a test play command
    const command = {
      type: 'play',
      pluginId: 'CanvasComponentPlugin',
      sequenceId: 'canvas-component-create-symphony',
      context: {
        component: {
          template: {
            tag: 'button',
            text: 'CLI Test Button',
            classes: ['rx-comp', 'rx-button'],
            dimensions: { width: 120, height: 40 }
          }
        },
        position: { x: 150, y: 150 },
        correlationId: `cli-test-${Date.now()}`
      },
      id: `test-${Date.now()}`
    };
    
    console.log('📤 Sending play command:', command.type, command.sequenceId);
    ws.send(JSON.stringify(command));
  });
  
  ws.on('message', (data) => {
    const response = JSON.parse(data.toString());
    console.log('📨 Received response:', response);
    
    if (response.type === 'ack') {
      console.log('\n✅ Command acknowledged! Check the browser for the button.');
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
  
  ws.on('close', () => {
    console.log('🔌 Connection closed');
  });
}

testConnection();

