#!/usr/bin/env node

/**
 * Check why sequences are not in the registry
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 5175;

console.log('🔍 Checking Sequence Registry...\n');

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
        const conductor = window.RenderX?.conductor;
        if (!conductor) {
          return { error: 'Conductor not found' };
        }
        
        const sequenceRegistry = conductor._sequenceRegistry || conductor.sequenceRegistry;
        if (!sequenceRegistry) {
          return { error: 'SequenceRegistry not found' };
        }
        
        // Get the actual Map
        const sequenceMap = sequenceRegistry.getSequenceMap?.() || sequenceRegistry.sequences;
        const allSequences = sequenceMap ? Array.from(sequenceMap.keys()) : [];
        
        // Check if LibraryComponentPlugin sequences were ever registered
        const libraryComponentSeqs = allSequences.filter(id => id.includes('library-component'));
        
        // Get statistics
        const stats = sequenceRegistry.getStatistics?.() || {};
        
        return {
          totalSequences: allSequences.length,
          libraryComponentSequences: libraryComponentSeqs,
          allSequenceIds: allSequences.slice(0, 20),
          stats
        };
      })()
    `,
    id: `check-registry-${Date.now()}`
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
    
    if (result.error) {
      console.error('❌ Error:', result.error);
      ws.close();
      process.exit(1);
      return;
    }
    
    console.log('📊 Sequence Registry Status:');
    console.log(`   Total Sequences: ${result.totalSequences}`);
    console.log(`   LibraryComponent Sequences: ${result.libraryComponentSequences.length}`);
    
    if (result.libraryComponentSequences.length > 0) {
      console.log('\n✅ LibraryComponent sequences ARE in registry:');
      result.libraryComponentSequences.forEach(id => console.log(`   - ${id}`));
    } else {
      console.log('\n❌ LibraryComponent sequences are NOT in registry!');
    }
    
    console.log('\n📋 First 20 sequences in registry:');
    result.allSequenceIds.forEach(id => console.log(`   - ${id}`));
    
    console.log('\n📈 Statistics:');
    console.log(JSON.stringify(result.stats, null, 2));
    
    ws.close();
    process.exit(0);
  }
});

