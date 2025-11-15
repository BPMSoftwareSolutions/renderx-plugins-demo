#!/usr/bin/env node

/**
 * Capture console errors from the browser
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 5175;

console.log('🔍 Capturing console errors...\n');

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
        // Capture console.error calls
        const errors = [];
        const originalError = console.error;
        
        console.error = function(...args) {
          errors.push(args.map(a => String(a)).join(' '));
          originalError.apply(console, args);
        };
        
        // Wait a bit to capture any errors
        return new Promise((resolve) => {
          setTimeout(() => {
            console.error = originalError;
            resolve({
              capturedErrors: errors,
              note: 'Check browser console for full error details'
            });
          }, 100);
        });
      })()
    `,
    id: `capture-errors-${Date.now()}`
  };
  
  ws.send(JSON.stringify(command));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'eval-result') {
    if (!response.success) {
      console.error('❌ Error:', response.error);
      ws.close();
      process.exit(1);
      return;
    }
    
    const result = response.result;
    
    console.log('📋 Captured Errors:');
    if (result.capturedErrors && result.capturedErrors.length > 0) {
      result.capturedErrors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err}`);
      });
    } else {
      console.log('   No errors captured in this session');
    }
    
    console.log('\n💡', result.note);
    console.log('\n🔍 Please check the browser console (F12) for mount error messages');
    console.log('   Look for: ❌ LibraryComponentPlugin: Failed to mount');
    
    ws.close();
    process.exit(0);
  }
});

