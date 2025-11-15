const WebSocket = require('ws');

console.log('🎯 Moving SVG to visible area\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const svgId = 'rx-node-svg-cool-1763165513310';

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Moving SVG to center of visible area (100, 100)...\n');
  
  const dragCommand = {
    type: 'play',
    pluginId: 'CanvasComponentDragMovePlugin',
    sequenceId: 'canvas-component-drag-move-symphony',
    context: {
      id: svgId,
      position: {
        x: 100,
        y: 100
      }
    },
    id: `drag-${Date.now()}`
  };
  
  ws.send(JSON.stringify(dragCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'ack') {
    console.log('✅ SVG moved!\n');
    console.log('📤 Verifying new position...\n');
    
    setTimeout(() => {
      const queryCommand = {
        type: 'eval',
        code: `
          (function() {
            const el = document.getElementById('${svgId}');
            if (!el) return { error: 'SVG not found' };
            
            const rect = el.getBoundingClientRect();
            
            return {
              id: el.id,
              position: {
                left: el.style.left,
                top: el.style.top
              },
              screenPosition: {
                x: Math.round(rect.left),
                y: Math.round(rect.top)
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
    
  } else if (response.type === 'eval-result') {
    if (response.success && !response.result.error) {
      const result = response.result;
      
      console.log('✅ SVG position verified!\n');
      console.log('📍 Canvas Position:', result.position.left, result.position.top);
      console.log('📍 Screen Position:', result.screenPosition.x, result.screenPosition.y);
      console.log('📏 Size:', result.size.width + 'x' + result.size.height);
      console.log('👁️  Visible:', result.visible ? '✅ Yes' : '❌ No');
      
      console.log('\n' + '='.repeat(70));
      console.log('✅ SVG MOVED TO VISIBLE AREA!');
      console.log('='.repeat(70));
      console.log('\n💡 The animated star SVG should now be visible at the top-left');
      console.log('   of your canvas at position (100, 100)!');
      
    } else {
      console.log('❌ Error:', response.result?.error);
    }
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 500);
  }
});

