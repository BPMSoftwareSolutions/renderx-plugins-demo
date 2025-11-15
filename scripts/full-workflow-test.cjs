const WebSocket = require('ws');

console.log('🎯 Full CLI Workflow: Create → Move → Verify\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const componentId = `workflow-${Date.now()}`;
const fullId = `rx-node-${componentId}`;

let step = 0;
let ackCount = 0;

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  
  // Step 1: Create component
  step = 1;
  console.log('📤 Step 1: Creating component at (100, 100)...');
  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      component: {
        template: {
          tag: 'button',
          text: 'WORKFLOW TEST',
          classes: ['rx-comp', 'rx-button'],
          dimensions: { width: 150, height: 40 }
        }
      },
      position: { x: 100, y: 100 },
      correlationId: componentId,
      _overrideNodeId: fullId
    },
    id: `create-${Date.now()}`
  };
  
  ws.send(JSON.stringify(createCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'ack' && step === 1) {
    console.log('✅ Component created!\n');
    
    // Step 2: Move component to top-right corner
    step = 2;
    ackCount = 0;
    console.log('📤 Step 2: Moving component to top-right (1700, 50)...');
    
    const updateX = {
      type: 'play',
      pluginId: 'CanvasComponentPlugin',
      sequenceId: 'canvas-component-update-symphony',
      context: {
        id: fullId,
        attribute: 'x',
        value: 1700
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
          value: 50
        },
        id: `update-y-${Date.now()}`
      };
      ws.send(JSON.stringify(updateY));
    }, 100);
    
  } else if (response.type === 'ack' && step === 2) {
    ackCount++;
    console.log(`✅ Update ${ackCount}/2 acknowledged`);
    
    if (ackCount === 2) {
      // Step 3: Verify final position
      step = 3;
      console.log('\n📤 Step 3: Verifying final position...');
      
      setTimeout(() => {
        const queryCommand = {
          type: 'eval',
          code: `
            (function() {
              const el = document.getElementById('${fullId}');
              if (!el) return { error: 'Component not found' };
              
              return {
                id: el.id,
                text: el.textContent,
                position: {
                  left: el.style.left,
                  top: el.style.top
                },
                visible: el.offsetWidth > 0 && el.offsetHeight > 0
              };
            })()
          `,
          id: `query-${Date.now()}`
        };
        
        ws.send(JSON.stringify(queryCommand));
      }, 500);
    }
    
  } else if (response.type === 'eval-result' && step === 3) {
    console.log('📨 Final position:\n');
    
    if (response.success) {
      const result = response.result;
      
      if (result.error) {
        console.log('❌ Error:', result.error);
      } else {
        console.log('✅ Component verified!');
        console.log('   ID:', result.id);
        console.log('   Text:', result.text);
        console.log('   Position:', result.position.left, result.position.top);
        console.log('   Visible:', result.visible ? '✅ Yes' : '❌ No');
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ FULL WORKFLOW COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(70));
        console.log('\n💡 Check the browser - the button should be in the top-right corner!');
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

