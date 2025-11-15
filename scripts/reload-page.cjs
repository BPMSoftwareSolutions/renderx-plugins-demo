#!/usr/bin/env node

/**
 * Reload the browser page
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 5175;

console.log('🔄 Reloading page...\n');

const ws = new WebSocket(`ws://localhost:${PORT}/conductor-ws`);

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected\n');
  
  const command = {
    type: 'eval',
    code: `window.location.reload(); 'Reloading...'`,
    id: `reload-${Date.now()}`
  };
  
  ws.send(JSON.stringify(command));
  
  setTimeout(() => {
    console.log('✅ Page reload initiated');
    console.log('\n💡 Please check the new log file or browser console for mount errors');
    console.log('   Look for: ❌ [sequence-registration] Failed to mount');
    ws.close();
    process.exit(0);
  }, 1000);
});

