const WebSocket = require('ws');

console.log('🔍 Simple Canvas Check - Direct approach\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  
  console.log('🎯 Creating a simple test component with direct verification...\n');
  
  const testId = `test-component-${Date.now()}`;
  const fullId = `rx-node-${testId}`;
  
  // Create a very simple component
  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      component: {
        template: {
          tag: 'div',
          text: 'TEST COMPONENT',
          classes: ['test-component'],
          dimensions: { width: 200, height: 100 },
          style: {
            position: 'absolute',
            left: '100px',
            top: '100px',
            backgroundColor: 'yellow',
            border: '2px solid red',
            padding: '10px',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }
      },
      position: { x: 100, y: 100 },
      correlationId: testId,
      _overrideNodeId: fullId
    },
    id: `create-${Date.now()}`
  };
  
  console.log('📤 Sending create command for test component...');
  console.log(`   Target ID: ${fullId}`);
  console.log(`   Position: (100, 100)`);
  console.log(`   Style: Yellow background, red border`);
  
  ws.send(JSON.stringify(createCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  console.log('📨 Received response:', response.type, response.id?.substring(0, 15) + '...');
  
  if (response.type === 'ack') {
    console.log('✅ Component creation acknowledged by server');
    console.log('');
    console.log('🔍 Please check the browser manually:');
    console.log('   1. Look at the canvas area');
    console.log('   2. You should see a YELLOW box with red border');
    console.log('   3. It should contain the text "TEST COMPONENT"');
    console.log('   4. It should be positioned at top-left area (100, 100)');
    console.log('');
    console.log('👀 Browser DevTools Check:');
    console.log(`   1. Open DevTools (F12)`);
    console.log(`   2. Go to Elements tab`);
    console.log(`   3. Search for ID: ${response.id ? response.id.replace('create-', 'rx-node-test-component-') : 'rx-node-test-component'}`);
    console.log(`   4. Or search for class: "test-component"`);
    console.log('');
    
    // Try a simple DOM query without complex evaluation
    setTimeout(() => {
      console.log('📤 Attempting simple element existence check...');
      
      const simpleCheckCommand = {
        type: 'eval',
        code: 'document.getElementById("rx-canvas") ? "canvas-exists" : "canvas-missing"',
        id: `simple-check-${Date.now()}`
      };
      
      ws.send(JSON.stringify(simpleCheckCommand));
    }, 2000);
    
  } else if (response.type === 'eval-result') {
    console.log('📨 Evaluation result:', response.result);
    
    if (response.result === 'canvas-exists') {
      console.log('✅ Canvas element exists');
      
      // Try to check if our test component exists
      setTimeout(() => {
        const testCheckCommand = {
          type: 'eval',
          code: 'document.querySelector(".test-component") ? "test-component-found" : "test-component-missing"',
          id: `test-check-${Date.now()}`
        };
        
        ws.send(JSON.stringify(testCheckCommand));
      }, 1000);
      
    } else if (response.result === 'test-component-found') {
      console.log('✅ TEST COMPONENT FOUND ON CANVAS!');
      console.log('');
      console.log('🎉 SUCCESS: Component creation is working!');
      console.log('   The previous lightning-fast scripts did create components');
      console.log('   They might be positioned where you can\'t see them or styled invisibly');
      
    } else if (response.result === 'test-component-missing') {
      console.log('❌ Test component not found');
      console.log('   Component creation may be failing silently');
      
    } else {
      console.log('❌ Canvas element not found');
      console.log('   The canvas (#rx-canvas) element doesn\'t exist');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 SIMPLE CANVAS CHECK COMPLETE');
    console.log('='.repeat(60));
    console.log('💡 Please visually inspect the browser window!');
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 2000);
  }
});

// Shorter timeout for this simple test
setTimeout(() => {
  console.log('\n⏰ Simple test timeout');
  console.log('💡 Check the browser manually for a yellow box with "TEST COMPONENT"');
  ws.close();
  process.exit(0);
}, 8000);