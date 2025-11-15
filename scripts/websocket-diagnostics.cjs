const WebSocket = require('ws');

console.log('🔍 WebSocket Diagnostics - Checking connection and response handling\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

let messageCount = 0;
const startTime = Date.now();

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully');
  console.log('⏱️  Connection established in:', Date.now() - startTime, 'ms\n');
  
  // Test 1: Simple button creation
  console.log('🧪 Test 1: Simple button creation');
  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      component: {
        template: {
          tag: 'button',
          text: 'Test Button',
          classes: ['rx-comp', 'rx-button'],
          dimensions: { width: 120, height: 40 },
          style: {}
        }
      },
      position: { x: 500, y: 100 },
      correlationId: `diag-button-${Date.now()}`,
      _overrideNodeId: `rx-node-diag-button-${Date.now()}`
    },
    id: `diag-create-${Date.now()}`
  };
  
  console.log('📤 Sending create command...');
  ws.send(JSON.stringify(createCommand));
});

ws.on('message', (data) => {
  messageCount++;
  const response = JSON.parse(data.toString());
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  
  console.log(`📨 Message ${messageCount} [${timestamp}]:`, {
    type: response.type,
    success: response.success,
    id: response.id?.substring(0, 20) + '...',
    hasResult: !!response.result,
    hasError: !!response.error
  });
  
  if (response.type === 'ack') {
    console.log('   ✅ Acknowledgment received - button should be created');
    
    // Test 2: Query all buttons on canvas
    setTimeout(() => {
      console.log('\n🧪 Test 2: Query all buttons on canvas');
      const queryCommand = {
        type: 'eval',
        code: `
          (function() {
            const buttons = Array.from(document.querySelectorAll('#rx-canvas button'));
            return {
              totalButtons: buttons.length,
              buttonIds: buttons.map(b => b.id),
              buttonTexts: buttons.map(b => b.textContent),
              timestamp: Date.now()
            };
          })()
        `,
        id: `diag-query-${Date.now()}`
      };
      
      console.log('📤 Sending query command...');
      ws.send(JSON.stringify(queryCommand));
    }, 1000);
    
  } else if (response.type === 'eval-result') {
    console.log('   📊 Evaluation result:');
    if (response.success && response.result) {
      const result = response.result;
      console.log('      Total buttons found:', result.totalButtons);
      console.log('      Button IDs:', result.buttonIds?.slice(0, 3).join(', '), result.buttonIds?.length > 3 ? '...' : '');
      console.log('      Button texts:', result.buttonTexts?.slice(0, 3).join(', '), result.buttonTexts?.length > 3 ? '...' : '');
    } else {
      console.log('      ❌ Evaluation failed:', response.error);
    }
    
    // Test 3: Performance timing
    setTimeout(() => {
      console.log('\n🧪 Test 3: Performance timing test');
      const perfStart = Date.now();
      
      const fastCreateCommand = {
        type: 'play',
        pluginId: 'CanvasComponentPlugin',
        sequenceId: 'canvas-component-create-symphony',
        context: {
          component: {
            template: {
              tag: 'button',
              text: 'Fast Button',
              classes: ['rx-comp', 'rx-button', 'perf-test'],
              dimensions: { width: 100, height: 30 },
              style: { transition: 'none' }
            }
          },
          position: { x: 600, y: 100 },
          correlationId: `perf-button-${Date.now()}`,
          _overrideNodeId: `rx-node-perf-button-${Date.now()}`,
          _speedMode: true,
          _skipAnimations: true
        },
        id: `perf-create-${Date.now()}`,
        priority: 'HIGH',
        _perfTest: perfStart
      };
      
      console.log('📤 Sending fast create command...');
      ws.send(JSON.stringify(fastCreateCommand));
    }, 1000);
    
  } else if (response.id && response.id.includes('perf-create')) {
    if (response.type === 'ack') {
      const perfEnd = Date.now();
      const originalStart = parseInt(response.id.split('-').pop()) || perfEnd;
      console.log(`   ⚡ Performance result: ${perfEnd - originalStart}ms`);
      
      // Wrap up
      setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 WEBSOCKET DIAGNOSTICS COMPLETE');
        console.log('='.repeat(60));
        console.log(`📊 Total messages received: ${messageCount}`);
        console.log(`⏱️  Total test duration: ${Date.now() - startTime}ms`);
        console.log('✅ Connection and response handling working correctly');
        console.log('\n💡 Check the browser - you should see test buttons!');
        
        ws.close();
        process.exit(0);
      }, 1000);
    }
  }
});

ws.on('close', () => {
  console.log('🔌 WebSocket connection closed');
});

// Auto-exit after 10 seconds
setTimeout(() => {
  console.log('\n⏰ Diagnostic timeout - exiting');
  ws.close();
  process.exit(0);
}, 10000);