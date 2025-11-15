const WebSocket = require('ws');

console.log('🔍 Inspecting canvas structure\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Querying canvas structure...\n');
  
  const command = {
    type: 'eval',
    code: `
      (function() {
        // Find the actual canvas element
        const canvasSlot = document.querySelector('[data-slot="canvas"]');
        const rxCanvas = document.getElementById('rx-canvas');
        
        return {
          canvasSlot: {
            found: !!canvasSlot,
            id: canvasSlot?.id,
            children: canvasSlot ? Array.from(canvasSlot.children).map(el => ({
              id: el.id,
              tag: el.tagName.toLowerCase(),
              classes: Array.from(el.classList)
            })) : []
          },
          rxCanvas: {
            found: !!rxCanvas,
            id: rxCanvas?.id,
            children: rxCanvas ? Array.from(rxCanvas.children).map(el => ({
              id: el.id,
              tag: el.tagName.toLowerCase(),
              classes: Array.from(el.classList),
              text: (el.textContent || '').substring(0, 30)
            })) : []
          },
          allRxNodes: Array.from(document.querySelectorAll('[id^="rx-node-"]')).map(el => ({
            id: el.id,
            tag: el.tagName.toLowerCase(),
            parent: el.parentElement?.id || el.parentElement?.tagName.toLowerCase(),
            text: (el.textContent || '').substring(0, 30)
          }))
        };
      })()
    `,
    id: `query-${Date.now()}`
  };
  
  ws.send(JSON.stringify(command));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'eval-result') {
    if (response.success) {
      const result = response.result;
      console.log('✅ Canvas structure:\n');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Eval failed:', response.error);
    }
  }
  
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 500);
});

