const WebSocket = require('ws');

console.log('🔍 Checking canvas contents\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Querying all components on canvas...\n');
  
  const queryCommand = {
    type: 'eval',
    code: `
      (function() {
        const canvas = document.getElementById('rx-canvas');
        if (!canvas) return { error: 'Canvas not found' };
        
        const allComponents = Array.from(canvas.children).filter(el => el.id.startsWith('rx-node-'));
        
        return {
          canvasFound: true,
          totalComponents: allComponents.length,
          components: allComponents.map(el => {
            const rect = el.getBoundingClientRect();
            return {
              id: el.id,
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || '').substring(0, 50),
              position: {
                left: el.style.left,
                top: el.style.top
              },
              size: {
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              visible: rect.width > 0 && rect.height > 0,
              classes: Array.from(el.classList).join(', ')
            };
          })
        };
      })()
    `,
    id: `query-${Date.now()}`
  };
  
  ws.send(JSON.stringify(queryCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'eval-result') {
    if (response.success) {
      const result = response.result;
      
      if (result.error) {
        console.log('❌ Error:', result.error);
      } else {
        console.log('📊 Canvas Contents:\n');
        console.log('   Total components:', result.totalComponents);
        console.log('');
        
        if (result.totalComponents === 0) {
          console.log('   ⚠️  Canvas is empty - no components found!');
        } else {
          result.components.forEach((comp, index) => {
            console.log(`   ${index + 1}. ${comp.tag.toUpperCase()}`);
            console.log(`      ID: ${comp.id}`);
            console.log(`      Position: ${comp.position.left}, ${comp.position.top}`);
            console.log(`      Size: ${comp.size.width}x${comp.size.height}`);
            console.log(`      Visible: ${comp.visible ? '✅' : '❌'}`);
            if (comp.text) {
              console.log(`      Text: "${comp.text}"`);
            }
            console.log('');
          });
        }
      }
    } else {
      console.log('❌ Query failed:', response.error);
    }
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 500);
  }
});

