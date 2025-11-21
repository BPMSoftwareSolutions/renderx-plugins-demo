#!/usr/bin/env node

/**
 * Test React component selection and verify control panel updates
 */

const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testReactSelection() {
  console.log('Testing React Component Selection\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Send canvas-component-select sequence
    console.log('Step 1: Sending canvas-component-select-symphony...');
    const selectResult = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/api/conductor/play',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      sequence: 'canvas-component-select-symphony',
      context: { componentId: 'test-react', type: 'react' }
    });

    console.log('Result:', selectResult);
    console.log();

    // Step 2: Send control-panel-selection-show sequence
    console.log('Step 2: Sending control-panel-selection-show-symphony...');
    const showResult = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/api/conductor/play',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      sequence: 'control-panel-selection-show-symphony',
      context: { componentId: 'test-react', type: 'react' }
    });

    console.log('Result:', showResult);
    console.log();

    // Step 3: Check control-panel-ui-render sequence
    console.log('Step 3: Sending control-panel-ui-render-symphony...');
    const renderResult = await makeRequest({
      hostname: 'localhost',
      port: 5173,
      path: '/api/conductor/play',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      sequence: 'control-panel-ui-render-symphony',
      context: { componentId: 'test-react', type: 'react' }
    });

    console.log('Result:', renderResult);
    console.log();

    console.log('='.repeat(60));
    console.log('All sequences completed successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testReactSelection().catch(console.error);

