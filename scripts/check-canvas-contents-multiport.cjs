const WebSocket = require('ws');
const ports = [5173, 5174, 5175, 5176, 5177];

(async function () {
  let ws = null;
  for (const port of ports) {
    try {
      ws = new WebSocket(`ws://localhost:${port}/conductor-ws`);
      await new Promise((resolve, reject) => {
        ws.once('open', resolve);
        ws.once('error', reject);
        setTimeout(() => reject(new Error('timeout')), 2000);
      });
      console.log('✅ Connected to conductor-ws on port', port);
      break;
    } catch (err) {
      if (ws) ws.removeAllListeners();
      ws = null;
    }
  }

  if (!ws) {
    console.error('❌ Could not connect to conductor on any port');
    process.exit(1);
  }

  const queryCommand = {
    type: 'eval',
    code: `
      (function() {
        const canvas = document.getElementById('rx-canvas');
        if (!canvas) return { error: 'Canvas not found' };
        const allComponents = Array.from(canvas.children).filter(el => el.id && el.id.startsWith('rx-node-'));
        return {
          canvasFound: true,
          totalComponents: allComponents.length,
          components: allComponents.map(el => {
            const rect = el.getBoundingClientRect();
            return {
              id: el.id,
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || '').substring(0, 50),
              position: { left: el.style.left, top: el.style.top },
              size: { width: Math.round(rect.width), height: Math.round(rect.height) },
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

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'eval-result') {
        if (msg.success) {
          const result = msg.result;
          console.log('📊 Canvas Contents: total=', result.totalComponents);
          result.components.forEach((c, idx) => {
            console.log(`#${idx + 1}:`, c.tag, c.id, c.text);
          });
        } else {
          console.error('Eval error:', msg.error);
        }
        process.exit(0);
      } else {
        console.log('WS RECV>', msg);
      }
    } catch (e) {
      console.log('WS RAW>', data.toString());
    }
  });
})();
