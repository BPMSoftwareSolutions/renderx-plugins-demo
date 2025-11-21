#!/usr/bin/env node

/**
 * Capture React component selection trace
 */

const WebSocket = require('ws');
const fs = require('fs');

async function captureTrace() {
  console.log('Capturing React Component Selection Trace\n');
  console.log('='.repeat(60) + '\n');

  const ports = [5173, 5174, 5175, 5176, 5177];
  let socket = null;
  let connectedPort = null;

  for (const port of ports) {
    try {
      socket = new WebSocket(`ws://localhost:${port}/conductor-ws`);
      await new Promise((resolve, reject) => {
        socket.once('open', resolve);
        socket.once('error', reject);
        setTimeout(() => reject(new Error('timeout')), 2000);
      });
      connectedPort = port;
      console.log('Connected to conductor on port', port + '\n');
      break;
    } catch (err) {
      socket = null;
    }
  }

  if (!socket) {
    console.error('Could not connect to conductor');
    process.exit(1);
  }

  const traces = [];
  const commandId = `trace-${Date.now()}`;
  let responseReceived = false;

  socket.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      traces.push({
        timestamp: new Date().toISOString(),
        message: msg
      });
      
      if (msg.id === commandId && msg.type === 'play-result') {
        responseReceived = true;
        console.log('Sequence completed\n');
        
        // Save trace
        const traceFile = 'REACT_COMPONENT_SELECTION_TRACE.json';
        fs.writeFileSync(traceFile, JSON.stringify(traces, null, 2));
        console.log('Trace saved to:', traceFile);
        
        socket.close();
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });

  console.log('Sending sequences...\n');
  
  // Step 1: Select React component
  console.log('1. Sending canvas-component-select-symphony');
  socket.send(JSON.stringify({
    type: 'play',
    pluginId: 'CanvasComponentPlugin',
    sequenceId: 'canvas-component-select-symphony',
    context: { componentId: 'test-react', type: 'react' },
    id: commandId
  }));

  // Timeout
  await new Promise(resolve => {
    setTimeout(() => {
      if (!responseReceived) {
        console.error('Timeout');
        socket.close();
      }
      resolve();
    }, 10000);
  });
}

captureTrace().catch(console.error);

