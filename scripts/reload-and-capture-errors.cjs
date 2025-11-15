#!/usr/bin/env node

/**
 * Reload the page and capture mount errors
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 5175;

console.log('🔄 Reloading page and capturing mount errors...\n');

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
        // Set up error capture BEFORE reload
        window.__mountErrors = [];
        const originalError = console.error;
        
        console.error = function(...args) {
          const msg = args.map(a => String(a)).join(' ');
          if (msg.includes('LibraryComponent')) {
            window.__mountErrors.push(msg);
          }
          originalError.apply(console, args);
        };
        
        // Reload the page
        window.location.reload();
        
        return { reloading: true };
      })()
    `,
    id: `reload-${Date.now()}`
  };
  
  ws.send(JSON.stringify(command));
  
  // Wait for reload, then check for errors
  setTimeout(() => {
    const checkCommand = {
      type: 'eval',
      code: `
        (function() {
          return {
            errors: window.__mountErrors || [],
            note: 'Errors captured during mount'
          };
        })()
      `,
      id: `check-errors-${Date.now()}`
    };
    
    ws.send(JSON.stringify(checkCommand));
  }, 3000);
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'eval-result') {
    if (response.result.reloading) {
      console.log('🔄 Page is reloading...');
      return;
    }
    
    if (response.result.errors) {
      console.log('\n📋 Mount Errors:');
      if (response.result.errors.length > 0) {
        response.result.errors.forEach((err, i) => {
          console.log(`\n${i + 1}. ${err}`);
        });
      } else {
        console.log('   ✅ No LibraryComponent mount errors!');
      }
      
      ws.close();
      process.exit(0);
    }
  }
});

