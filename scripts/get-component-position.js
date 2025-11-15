/**
 * Query the browser to get the current position of a component
 */

import WebSocket from 'ws';

async function getComponentPosition() {
  console.log('🔍 Querying component position from browser...\n');
  
  const ws = new WebSocket('ws://localhost:5174/conductor-ws');
  
  ws.on('open', () => {
    console.log('✅ Connected to browser conductor WebSocket');
    console.log('📤 Querying component position from browser...\n');

    const componentId = 'rx-node-proof-1763163107507';

    // Send eval command to query the DOM
    const command = {
      type: 'eval',
      code: `
        (function() {
          const el = document.getElementById('${componentId}');
          if (!el) {
            return { error: 'Component not found', id: '${componentId}' };
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
            visible: rect.width > 0 && rect.height > 0,
            classes: Array.from(el.classList)
          };
        })()
      `,
      id: `query-${Date.now()}`
    };

    console.log('📨 Sending eval command...');
    ws.send(JSON.stringify(command));
  });
  
  ws.on('message', (data) => {
    const response = JSON.parse(data.toString());

    if (response.type === 'eval-result') {
      console.log('📨 Received response from browser:\n');

      if (response.success) {
        const result = response.result;

        if (result.error) {
          console.log('❌ Error:', result.error);
          console.log('   Component ID:', result.id);
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
          console.log('   Classes:', result.classes.join(', '));
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
  
  ws.on('error', (error) => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });
}

getComponentPosition();

