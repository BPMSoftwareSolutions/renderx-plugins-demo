#!/usr/bin/env node

/**
 * Check if the drop handler is registered in the browser
 */

const WebSocket = require('ws');

async function checkDropHandler() {
  console.log('🔍 Checking if drop handler is registered...\n');

  const ws = new WebSocket('ws://localhost:5175', 'vite-hmr');

  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });

  console.log('✅ Connected to Vite HMR WebSocket\n');

  // Send command to check handler registration
  const command = {
    type: 'custom',
    event: 'conductor:cli-command',
    data: {
      command: 'eval',
      code: `
        const conductor = window.RenderX?.conductor;
        if (!conductor) {
          JSON.stringify({ error: 'Conductor not found' });
        } else {
          // Check if the sequence is mounted
          const runtimeMounted = conductor._runtimeMountedSeqIds;
          const seqIds = runtimeMounted instanceof Set ? Array.from(runtimeMounted) : (Array.isArray(runtimeMounted) ? runtimeMounted : []);
          
          // Check if handlers are registered in the EventBus
          const eventBus = conductor.eventBus || conductor.conductorCore?.eventBus;
          const dropEvent = 'library:component:drop';
          const hasSubscribers = eventBus?.events?.[dropEvent]?.length > 0;
          const subscriberCount = eventBus?.events?.[dropEvent]?.length || 0;
          
          // Get all registered events
          const allEvents = eventBus?.events ? Object.keys(eventBus.events) : [];
          const libraryEvents = allEvents.filter(e => e.includes('library'));
          
          JSON.stringify({
            sequenceMounted: seqIds.includes('library-component-drop-symphony'),
            hasDropSubscribers: hasSubscribers,
            dropSubscriberCount: subscriberCount,
            allLibraryEvents: libraryEvents,
            totalEvents: allEvents.length,
            mountedSequences: seqIds
          }, null, 2);
        }
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

  console.log('📊 Handler Registration Status:');
  console.log('================================\n');
  
  if (response.success) {
    const result = JSON.parse(response.result);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`Sequence Mounted: ${result.sequenceMounted ? '✅ YES' : '❌ NO'}`);
      console.log(`Has Drop Subscribers: ${result.hasDropSubscribers ? '✅ YES' : '❌ NO'}`);
      console.log(`Drop Subscriber Count: ${result.dropSubscriberCount}`);
      console.log(`\nAll Library Events (${result.allLibraryEvents.length}):`);
      result.allLibraryEvents.forEach(e => console.log(`  - ${e}`));
      console.log(`\nTotal Events Registered: ${result.totalEvents}`);
      console.log(`\nMounted Sequences (${result.mountedSequences.length}):`);
      result.mountedSequences.slice(0, 10).forEach(s => console.log(`  - ${s}`));
      if (result.mountedSequences.length > 10) {
        console.log(`  ... and ${result.mountedSequences.length - 10} more`);
      }
      
      if (!result.hasDropSubscribers) {
        console.log('\n⚠️  WARNING: Drop handler is NOT registered!');
        console.log('   The sequence is mounted but no subscribers for library:component:drop event.');
      } else {
        console.log('\n✅ Drop handler is properly registered!');
      }
    }
  } else {
    console.log(`❌ Error: ${response.error}`);
  }
}

checkDropHandler().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

