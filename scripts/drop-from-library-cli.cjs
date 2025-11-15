const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

console.log('🎯 CLI: Drop from Library -> Canvas (exact log sequence)');
console.log('');

const ws = new WebSocket('ws://localhost:5174/conductor-ws');

ws.on('error', (err) => {
  console.error('WebSocket error', err.message);
  process.exit(1);
});


// Preload component JSON so tests match the log exactly
const componentJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../json-components/button.json'), 'utf-8'));

// correlationId and nodeId go in outer scope so message handler can reference them
// (created here before we open the ws)
const correlationId = `cli-drop-${Date.now()}`;
const nodeId = `rx-node-${correlationId}`;

ws.on('open', () => {

  const context = {
    component: {
      template: {
        tag: 'button',
        text: componentJson.integration.properties.defaultValues.content || 'Click me',
        classes: ['rx-comp', 'rx-button'],
        css: componentJson.ui.styles.css,
        cssVariables: componentJson.ui.styles.variables
      }
    },
    position: { x: 300, y: 200 },
    correlationId,
    _overrideNodeId: nodeId
  };

  const message = {
    type: 'play',
    pluginId: 'LibraryComponentPlugin',
    sequenceId: 'library-component-drop-symphony',
    context,
    id: `library-drop-${Date.now()}`
  };

  console.log('📤 Sending play command to trigger LibraryComponentPlugin::library-component-drop-symphony');
  ws.send(JSON.stringify(message));
});

ws.on('message', (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log('📨 Received from conductor:', response);

    if (response.type === 'ack') {
      console.log('✅ ACK received from CLI server, waiting for browser sequence execution...');
      // Wait briefly then query for the node id created (data-baton correlation)
  // Give browser a little more time (1s) to execute sequences and render
  setTimeout(() => {
        const query = {
          type: 'eval',
          id: `verify-${Date.now()}`,
          code: '(() => { ' +
                "const el = document.getElementById('" + nodeId + "');" +
                "if(!el) return { error: 'not_found' };" +
                "const rect = el.getBoundingClientRect();" +
                "return { id: el.id, text: el.textContent, width: Math.round(rect.width), height: Math.round(rect.height) };" +
             ' })()'
        };
  console.log('🔬 Query code:', query.code);
  ws.send(JSON.stringify(query));
  }, 1000);
    } else if (response.type === 'eval-result') {
      console.log('📨 Eval payload from browser:', response);
    }
  } catch (err) {
    console.error('❌ Non-JSON response:', data.toString());
  }
});
