const WebSocket = require('ws');

console.log('🎯 Moving JSON button via drag interaction\n');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

// First, find the button ID
let buttonId = null;
let step = 0;

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor WebSocket\n');
  
  // Step 1: Find the button
  step = 1;
  console.log('📤 Step 1: Finding JSON button...\n');
  
  const findCommand = {
    type: 'eval',
    code: `
      (function() {
        const buttons = Array.from(document.querySelectorAll('#rx-canvas button'));
        const jsonButtons = buttons.filter(btn => btn.id.startsWith('rx-node-json-button-'));
        
        if (jsonButtons.length === 0) {
          return { error: 'No JSON buttons found' };
        }
        
        const latest = jsonButtons.sort((a, b) => {
          const aTime = parseInt(a.id.split('-').pop());
          const bTime = parseInt(b.id.split('-').pop());
          return bTime - aTime;
        })[0];
        
        return {
          id: latest.id,
          currentPosition: {
            x: parseInt(latest.style.left) || 0,
            y: parseInt(latest.style.top) || 0
          }
        };
      })()
    `,
    id: `find-${Date.now()}`
  };
  
  ws.send(JSON.stringify(findCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'eval-result' && step === 1) {
    if (response.success && !response.result.error) {
      buttonId = response.result.id;
      const currentPos = response.result.currentPosition;
      
      console.log('✅ Found button:', buttonId);
      console.log('   Current position: (' + currentPos.x + ', ' + currentPos.y + ')\n');
      
      // Step 2: Move the button using drag interaction
      step = 2;
      const newX = 600;
      const newY = 100;
      
      console.log('📤 Step 2: Moving button to (' + newX + ', ' + newY + ') via drag interaction...\n');
      
      const dragCommand = {
        type: 'play',
        pluginId: 'CanvasComponentDragMovePlugin',
        sequenceId: 'canvas-component-drag-move-symphony',
        context: {
          id: buttonId,
          position: {
            x: newX,
            y: newY
          }
        },
        id: `drag-${Date.now()}`
      };
      
      ws.send(JSON.stringify(dragCommand));
      
    } else {
      console.log('❌ Error finding button:', response.result?.error || 'Unknown error');
      ws.close();
      process.exit(1);
    }
    
  } else if (response.type === 'ack' && step === 2) {
    console.log('✅ Drag command acknowledged!\n');
    
    // Step 3: Verify the new position
    step = 3;
    console.log('📤 Step 3: Verifying new position...\n');
    
    setTimeout(() => {
      const verifyCommand = {
        type: 'eval',
        code: `
          (function() {
            const el = document.getElementById('${buttonId}');
            if (!el) return { error: 'Button not found' };
            
            return {
              id: el.id,
              position: {
                left: el.style.left,
                top: el.style.top,
                x: parseInt(el.style.left) || 0,
                y: parseInt(el.style.top) || 0
              }
            };
          })()
        `,
        id: `verify-${Date.now()}`
      };
      
      ws.send(JSON.stringify(verifyCommand));
    }, 500);
    
  } else if (response.type === 'eval-result' && step === 3) {
    if (response.success && !response.result.error) {
      const result = response.result;
      
      console.log('✅ Button moved successfully!\n');
      console.log('📍 New position:');
      console.log('   X: ' + result.position.x);
      console.log('   Y: ' + result.position.y);
      console.log('   Style: ' + result.position.left + ', ' + result.position.top);
      
      console.log('\n' + '='.repeat(70));
      console.log('✅ BUTTON MOVED VIA DRAG INTERACTION!');
      console.log('='.repeat(70));
      console.log('\n💡 Check the browser - button should be at (600, 100)!');
      
    } else {
      console.log('❌ Error verifying position:', response.result?.error || 'Unknown error');
    }
    
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 500);
  }
});

