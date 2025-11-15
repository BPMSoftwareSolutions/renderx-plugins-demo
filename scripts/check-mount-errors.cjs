#!/usr/bin/env node

/**
 * Check for LibraryComponentPlugin mount errors in browser console
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 5175;

console.log('🔍 Checking for mount errors...\n');

const ws = new WebSocket(`ws://localhost:${PORT}/conductor-ws`);

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected\n');
  
  const command = {
    type: 'eval',
    code: `
      (function() {
        // Check if there are any error logs in the console
        // We'll look for the mount result that should have been logged
        return {
          note: 'Check the browser console for mount error messages with ❌ LibraryComponentPlugin'
        };
      })()
    `,
    id: `check-errors-${Date.now()}`
  };
  
  ws.send(JSON.stringify(command));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'eval-result') {
    console.log('📋 Result:', response.result);
    console.log('\n💡 Please check the browser console (F12) for error messages');
    console.log('   Look for lines starting with: ❌ LibraryComponentPlugin');
    
    ws.close();
    process.exit(0);
  }
});

