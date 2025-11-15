const WebSocket = require('ws');

console.log('🔍 Locating JSON button on canvas\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  console.log('📤 Querying for JSON button...\n');
  
  const queryCommand = {
    type: 'eval',
    code: `
      (function() {
        // Find all buttons on the canvas
        const allButtons = Array.from(document.querySelectorAll('#rx-canvas button'));
        
        // Find the most recent JSON button (starts with rx-node-json-button-)
        const jsonButtons = allButtons.filter(btn => btn.id.startsWith('rx-node-json-button-'));
        
        if (jsonButtons.length === 0) {
          return { error: 'No JSON buttons found on canvas' };
        }
        
        // Get the most recent one (highest timestamp)
        const latestButton = jsonButtons.sort((a, b) => {
          const aTime = parseInt(a.id.split('-').pop());
          const bTime = parseInt(b.id.split('-').pop());
          return bTime - aTime;
        })[0];
        
        const rect = latestButton.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(latestButton);
        
        return {
          found: true,
          id: latestButton.id,
          text: latestButton.textContent,
          position: {
            left: latestButton.style.left,
            top: latestButton.style.top,
            x: parseInt(latestButton.style.left) || 0,
            y: parseInt(latestButton.style.top) || 0
          },
          screenPosition: {
            x: Math.round(rect.left),
            y: Math.round(rect.top)
          },
          size: {
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          style: {
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            borderRadius: computedStyle.borderRadius
          },
          visible: rect.width > 0 && rect.height > 0,
          totalJsonButtons: jsonButtons.length,
          allJsonButtonIds: jsonButtons.map(btn => btn.id)
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
        console.log('❌', result.error);
      } else {
        console.log('✅ JSON Button Found!\n');
        console.log('📍 Location:');
        console.log('   Canvas Position: (' + result.position.x + ', ' + result.position.y + ')');
        console.log('   Screen Position: (' + result.screenPosition.x + ', ' + result.screenPosition.y + ')');
        console.log('');
        console.log('📏 Size: ' + result.size.width + 'x' + result.size.height);
        console.log('');
        console.log('🎨 Appearance:');
        console.log('   Text: "' + result.text + '"');
        console.log('   Background: ' + result.style.backgroundColor);
        console.log('   Text Color: ' + result.style.color);
        console.log('   Border Radius: ' + result.style.borderRadius);
        console.log('');
        console.log('🆔 ID: ' + result.id);
        console.log('');
        console.log('👁️  Visible: ' + (result.visible ? '✅ Yes' : '❌ No'));
        
        if (result.totalJsonButtons > 1) {
          console.log('');
          console.log('📊 Total JSON buttons on canvas: ' + result.totalJsonButtons);
          console.log('   All IDs:', result.allJsonButtonIds.join(', '));
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

