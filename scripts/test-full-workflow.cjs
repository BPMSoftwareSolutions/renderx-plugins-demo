const WebSocket = require('ws');

console.log('🎯 Testing full CLI workflow: Create → Move → Query\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const componentId = `test-${Date.now()}`;
const fullId = `rx-node-${componentId}`;

let step = 0;

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  console.log('💡 Make sure the dev server is running: npm run dev');
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  
  // Step 1: Create a component with a known ID
  step = 1;
  console.log('📤 Step 1: Creating component with ID:', fullId);
  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      componentType: 'button',
      position: { x: 100, y: 100 },
      content: { content: 'TEST BUTTON' },
      correlationId: componentId,
      _overrideNodeId: fullId  // Force the component to use our ID
    },
    id: `create-${Date.now()}`
  };

  ws.send(JSON.stringify(createCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'ack' && step === 1) {
    console.log('✅ Component created!\n');
    
    // Step 2: Move the component
    step = 2;
    console.log('📤 Step 2: Moving component to (500, 200)...');
    
    // Send two update commands for x and y
    const updateX = {
      type: 'play',
      pluginId: 'CanvasComponentPlugin',
      sequenceId: 'canvas-component-update-symphony',
      context: {
        id: fullId,
        attribute: 'x',
        value: 500
      },
      id: `update-x-${Date.now()}`
    };
    
    ws.send(JSON.stringify(updateX));
    
    setTimeout(() => {
      const updateY = {
        type: 'play',
        pluginId: 'CanvasComponentPlugin',
        sequenceId: 'canvas-component-update-symphony',
        context: {
          id: fullId,
          attribute: 'y',
          value: 200
        },
        id: `update-y-${Date.now()}`
      };
      ws.send(JSON.stringify(updateY));
    }, 100);
    
  } else if (response.type === 'ack' && step === 2) {
    // Wait for both acks (we'll get 2)
    console.log('✅ Update command acknowledged');
    
    // After second ack, query position
    setTimeout(() => {
      step = 3;
      console.log('\n📤 Step 3: Querying component position...');
      
      const queryCommand = {
        type: 'eval',
        code: `
          (function() {
            const el = document.getElementById('${fullId}');
            if (!el) {
              return { error: 'Component not found', id: '${fullId}' };
            }
            
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            
            return {
              id: el.id,
              text: el.textContent || el.innerText,
              position: {
                left: el.style.left,
                top: el.style.top,
                computed: {
                  left: style.left,
                  top: style.top
                }
              },
              size: {
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              visible: rect.width > 0 && rect.height > 0
            };
          })()
        `,
        id: `query-${Date.now()}`
      };
      
      ws.send(JSON.stringify(queryCommand));
    }, 500);
    
  } else if (response.type === 'eval-result' && step === 3) {
    console.log('📨 Received position data:\n');
    
    if (response.success) {
      const result = response.result;
      
      if (result.error) {
        console.log('❌ Error:', result.error);
      } else {
        console.log('✅ Component found!');
        console.log('   ID:', result.id);
        console.log('   Text:', result.text);
        console.log('   Position (inline style):');
        console.log('     left:', result.position.left || '(not set)');
        console.log('     top:', result.position.top || '(not set)');
        console.log('   Position (computed):');
        console.log('     left:', result.position.computed.left);
        console.log('     top:', result.position.computed.top);
        console.log('   Size:', `${result.size.width}x${result.size.height}`);
        console.log('   Visible:', result.visible ? '✅ Yes' : '❌ No');
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ Full workflow completed successfully!');
        console.log('='.repeat(70));
      }
    } else {
      console.log('❌ Eval failed:', response.error);
    }
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 500);
  }
});

ws.on('close', () => {
  console.log('\n🎼 Disconnected from conductor WebSocket');
});

