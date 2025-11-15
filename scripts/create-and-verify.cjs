const WebSocket = require('ws');

console.log('🎯 Create component and verify it exists\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const componentId = `test-${Date.now()}`;
const fullId = `rx-node-${componentId}`;

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Creating component with ID:', fullId, '\n');
  
  const createCommand = {
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-create-symphony',
    context: {
      component: {
        template: {
          tag: 'button',
          text: 'CLI CREATED BUTTON',
          classes: ['rx-comp', 'rx-button'],
          dimensions: { width: 150, height: 40 }
        }
      },
      position: { x: 200, y: 200 },
      correlationId: componentId,
      _overrideNodeId: fullId
    },
    id: `create-${Date.now()}`
  };
  
  ws.send(JSON.stringify(createCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'ack') {
    console.log('✅ Create command acknowledged\n');
    console.log('📤 Waiting 1 second, then checking if component exists...\n');
    
    setTimeout(() => {
      const queryCommand = {
        type: 'eval',
        code: `
          (function() {
            const el = document.getElementById('${fullId}');
            const rxCanvas = document.getElementById('rx-canvas');
            
            return {
              componentFound: !!el,
              componentDetails: el ? {
                id: el.id,
                tag: el.tagName.toLowerCase(),
                text: el.textContent,
                position: {
                  left: el.style.left,
                  top: el.style.top
                },
                parent: el.parentElement?.id
              } : null,
              canvasChildren: rxCanvas ? Array.from(rxCanvas.children).map(c => ({
                id: c.id,
                tag: c.tagName.toLowerCase(),
                text: (c.textContent || '').substring(0, 30)
              })) : []
            };
          })()
        `,
        id: `query-${Date.now()}`
      };
      
      ws.send(JSON.stringify(queryCommand));
    }, 1000);
    
  } else if (response.type === 'eval-result') {
    console.log('📨 Query result:\n');
    
    if (response.success) {
      const result = response.result;
      
      if (result.componentFound) {
        console.log('✅ Component FOUND!');
        console.log(JSON.stringify(result.componentDetails, null, 2));
      } else {
        console.log('❌ Component NOT FOUND');
        console.log('Canvas children:', JSON.stringify(result.canvasChildren, null, 2));
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

