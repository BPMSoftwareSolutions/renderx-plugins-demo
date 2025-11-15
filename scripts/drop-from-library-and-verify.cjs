const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

console.log('🎯 CLI: Drop from Library → Canvas + Verify (exact log flow)');

const componentJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../json-components/button.json'), 'utf-8'));
const ws = new WebSocket('ws://localhost:5174/conductor-ws');

const correlationId = `cli-drop-${Date.now()}`;
const queryText = componentJson.integration.properties.defaultValues.content || 'Click me';

function sendDrop() {
  const context = {
    component: {
      template: {
        tag: 'button',
        text: queryText,
        classes: ['rx-comp', 'rx-button'],
        css: componentJson.ui.styles.css
      }
    },
    position: { x: 300, y: 200 },
    correlationId,
  };

  const message = {
    type: 'play',
    pluginId: 'LibraryComponentPlugin',
    sequenceId: 'library-component-drop-symphony',
    context,
    id: `library-drop-${Date.now()}`
  };

  ws.send(JSON.stringify(message));
}

function queryCanvasForButton(attempt = 0) {
  // The query checks all rx-node elements and looks for a text match
  const code = `(() => {
    const canvas = document.getElementById('rx-canvas');
    if (!canvas) return { error: 'canvas-missing' };
    const found = Array.from(canvas.querySelectorAll('[id^="rx-node-"]')).map(el => ({ id: el.id, text: (el.textContent||'').trim(), classes: Array.from(el.classList) }));
    const match = found.find(f => f.text === "${queryText}");
    return { found, match };
  })()`;

  ws.send(JSON.stringify({ type: 'eval', code, id: `poll-${Date.now()}` }));

  // We'll wait for the conductor to reply with eval-result; CLI Bridge returns conductor:cli-response
  // The calling code will handle the evaluation reply and decide if we need to poll again.
}

ws.on('open', () => {
  console.log('✅ Connected to conductor WS');
  console.log(`📤 Triggering library.component.drop.requested with correlationId=${correlationId}`);
  sendDrop();
});

let pollAttempts = 0;
const pollLimit = 10;

ws.on('message', (data) => {
  let response;
  try {
    response = JSON.parse(data.toString());
  } catch (err) {
    console.error('❌ Non-JSON response from conductor', data.toString());
    return;
  }

  // Vite server acknowledges the CLI command with { type:'ack' } — start polling
  if (response.type === 'ack') {
    console.log('✅ Received ack from server; starting to poll for created node...');
    setTimeout(queryCanvasForButton, 600); // allow sequence time to run
    return;
  }

  // Evaluate results show up as custom events forwarded through HMR; the internal format includes type 'eval-result'
  if (response.type === 'eval-result') {
    const r = response;
    if (r.success && r.result) {
      // r.result is the object returned by eval; check match
      const { match, found } = r.result;
      if (match) {
        console.log('✅ Found matching node on canvas:');
        console.log(`   id: ${match.id}`);
        console.log(`   text: ${match.text}`);
        console.log(`   classes: ${match.classes.join(', ')}`);
        process.exit(0);
      }

      pollAttempts++;
      if (pollAttempts >= pollLimit) {
        console.log('⚠️ Did not find matching node after polling. Current canvas contents:');
        console.log(JSON.stringify(found, null, 2));
        process.exit(2);
      }

      console.log('🔄 Not found yet; will poll again...');
      setTimeout(queryCanvasForButton, 400);
    } else {
      console.log('⚠️ Eval failed:', r.error || 'no payload');
      process.exit(1);
    }
  }
});

ws.on('error', (err) => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
