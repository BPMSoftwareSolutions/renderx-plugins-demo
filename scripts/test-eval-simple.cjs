const WebSocket = require('ws');

console.log('🔍 Testing simple eval command\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Sending eval command to count canvas children...\n');
  
  const command = {
    type: 'eval',
    code: `
      (function() {
        const canvas = document.querySelector('[data-slot="canvas"]');
        if (!canvas) {
          return { error: 'Canvas not found' };
        }
        
        const children = Array.from(canvas.children);
        return {
          canvasFound: true,
          childCount: children.length,
          childIds: children.map(el => el.id).filter(Boolean),
          allElements: children.map(el => ({
            id: el.id,
            tag: el.tagName.toLowerCase(),
            classes: Array.from(el.classList),
            text: (el.textContent || '').substring(0, 50)
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
  
  console.log('📨 Received response:', JSON.stringify(response, null, 2));
  
  if (response.type === 'eval-result') {
    if (response.success) {
      const result = response.result;
      console.log('\n✅ Eval succeeded!');
      console.log('Result:', JSON.stringify(result, null, 2));
    } else {
      console.log('\n❌ Eval failed:', response.error);
    }
  }
  
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 500);
});

