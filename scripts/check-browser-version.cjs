#!/usr/bin/env node

/**
 * Check what version of library-component the browser is actually loading
 */

const WebSocket = require('ws');

async function checkBrowserVersion() {
  console.log('🔍 Checking browser version of @renderx-plugins/library-component...\n');

  const ws = new WebSocket('ws://localhost:5175', 'vite-hmr');

  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });

  console.log('✅ Connected to Vite HMR WebSocket\n');

  // Send command to check version
  const command = {
    type: 'custom',
    event: 'conductor:cli-command',
    data: {
      command: 'eval',
      code: `
        // Check if the handlers have the timing instrumentation
        const libCompModule = await import('@renderx-plugins/library-component');
        const handlerCode = libCompModule.handlers.publishCreateRequested.toString();
        const hasInstrumentation = handlerCode.includes('DROP HANDLER');
        const hasTimingLogs = handlerCode.includes('performance.now');
        
        // Also check the package version
        const pkgJson = await fetch('/node_modules/@renderx-plugins/library-component/package.json').then(r => r.json());
        
        JSON.stringify({
          version: pkgJson.version,
          hasInstrumentation,
          hasTimingLogs,
          handlerLength: handlerCode.length,
          handlerPreview: handlerCode.substring(0, 200)
        }, null, 2);
      `
    },
  };

  ws.send(JSON.stringify(command));

  // Wait for response
  const response = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Response timeout')), 10000);
    
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'custom' && msg.event === 'conductor:cli-response') {
          clearTimeout(timeout);
          resolve(msg.data);
        }
      } catch (err) {
        // Ignore parse errors from other messages
      }
    });
  });

  ws.close();

  console.log('📦 Browser Module Info:');
  console.log('========================\n');
  
  if (response.success) {
    const result = JSON.parse(response.result);
    console.log(`Version: ${result.version}`);
    console.log(`Has Instrumentation: ${result.hasInstrumentation ? '✅ YES' : '❌ NO'}`);
    console.log(`Has Timing Logs: ${result.hasTimingLogs ? '✅ YES' : '❌ NO'}`);
    console.log(`Handler Length: ${result.handlerLength} characters`);
    console.log(`\nHandler Preview:`);
    console.log(result.handlerPreview);
    
    if (!result.hasInstrumentation) {
      console.log('\n⚠️  WARNING: Browser is loading OLD code without instrumentation!');
      console.log('   Try hard refresh (Ctrl+Shift+R) or clear browser cache.');
    } else {
      console.log('\n✅ Browser is loading INSTRUMENTED code!');
    }
  } else {
    console.log(`❌ Error: ${response.error}`);
  }
}

checkBrowserVersion().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

