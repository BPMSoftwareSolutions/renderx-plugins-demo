#!/usr/bin/env node

/**
 * Diagnostic CLI tool to inspect why LibraryComponentPlugin is not mounting
 * Uses the eval command to inspect browser conductor state in real-time
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 5175;

console.log('🔍 Plugin Mount Diagnostic Tool\n');
console.log(`Connecting to ws://localhost:${PORT}/conductor-ws...\n`);

const ws = new WebSocket(`ws://localhost:${PORT}/conductor-ws`);

ws.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
  console.log('\n💡 Make sure the dev server is running on port', PORT);
  console.log('   Run: npm run dev');
  process.exit(1);
});

ws.on('open', () => {
  console.log('✅ Connected to browser conductor\n');
  console.log('📊 Running diagnostics...\n');
  
  const diagnosticCommand = {
    type: 'eval',
    code: `
      (function() {
        const conductor = window.RenderX?.conductor;
        if (!conductor) {
          return { error: 'Conductor not found on window.RenderX' };
        }
        
        // Get plugin manager and mounted plugins
        const pluginManager = conductor._pluginManager || conductor.pluginManager;
        if (!pluginManager) {
          return { error: 'PluginManager not found on conductor' };
        }
        
        const mountedPlugins = pluginManager.mountedPlugins;
        const mountedPluginIds = mountedPlugins ? Array.from(mountedPlugins.keys()) : [];
        
        // Check for LibraryComponentPlugin specifically
        const hasLibraryComponent = mountedPlugins?.has('LibraryComponentPlugin');
        const libraryComponentPlugin = mountedPlugins?.get('LibraryComponentPlugin');
        
        // Get runtime mounted sequence IDs
        const runtimeMounted = conductor._runtimeMountedSeqIds;
        const runtimeMountedIds = runtimeMounted instanceof Set ? Array.from(runtimeMounted) : [];
        
        // Get sequence registry
        const sequenceRegistry = conductor._sequenceRegistry || conductor.sequenceRegistry;
        const allSequences = sequenceRegistry?.sequences ? Object.keys(sequenceRegistry.sequences) : [];
        const libraryComponentSequences = allSequences.filter(s => s.includes('library-component'));
        
        // Get EventBus subscribers for drop event
        const eventBus = conductor.eventBus || conductor.conductorCore?.eventBus;
        const dropEvent = 'library:component:drop';
        const dropSubscribers = eventBus?.events?.[dropEvent] || [];
        const hasDropSubscribers = dropSubscribers.length > 0;
        
        // Get all library-related events
        const allEvents = eventBus?.events ? Object.keys(eventBus.events) : [];
        const libraryEvents = allEvents.filter(e => e.includes('library'));
        
        // Get plugin statistics
        const pluginStats = pluginManager.getStatistics?.() || {};
        
        return {
          conductorExists: true,
          pluginManagerExists: true,
          
          // Plugin registration status
          mountedPluginIds,
          totalMountedPlugins: mountedPluginIds.length,
          hasLibraryComponent,
          
          // LibraryComponentPlugin details
          libraryComponentPlugin: libraryComponentPlugin ? {
            id: libraryComponentPlugin.metadata?.id,
            version: libraryComponentPlugin.metadata?.version,
            hasHandlers: Object.keys(libraryComponentPlugin.handlers || {}).length > 0,
            handlerNames: Object.keys(libraryComponentPlugin.handlers || {}),
            hasSequence: !!libraryComponentPlugin.sequence,
            sequenceName: libraryComponentPlugin.sequence?.name,
            sequenceId: libraryComponentPlugin.sequence?.id
          } : null,
          
          // Runtime mounted sequences
          runtimeMountedIds,
          totalRuntimeMounted: runtimeMountedIds.length,
          libraryComponentRuntimeMounted: runtimeMountedIds.filter(id => id.includes('library-component')),
          
          // Sequence registry
          libraryComponentSequences,
          totalSequences: allSequences.length,
          
          // EventBus subscribers
          hasDropSubscribers,
          dropSubscriberCount: dropSubscribers.length,
          libraryEvents,
          totalEvents: allEvents.length,
          
          // Plugin statistics
          pluginStats
        };
      })()
    `,
    id: `diagnose-${Date.now()}`
  };
  
  ws.send(JSON.stringify(diagnosticCommand));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  
  if (response.type === 'eval-result') {
    if (!response.success) {
      console.error('❌ Diagnostic failed:', response.error);
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
    
    // Display diagnostic results
    console.log('═'.repeat(70));
    console.log('📊 DIAGNOSTIC RESULTS');
    console.log('═'.repeat(70));
    console.log('');
    
    // Conductor status
    console.log('🎼 Conductor Status:');
    console.log(`   Conductor Exists: ${result.conductorExists ? '✅' : '❌'}`);
    console.log(`   PluginManager Exists: ${result.pluginManagerExists ? '✅' : '❌'}`);
    console.log('');

    // Plugin registration status
    console.log('🔌 Plugin Registration:');
    console.log(`   Total Mounted Plugins: ${result.totalMountedPlugins}`);
    console.log(`   LibraryComponentPlugin Mounted: ${result.hasLibraryComponent ? '✅ YES' : '❌ NO'}`);
    console.log('');

    if (result.hasLibraryComponent) {
      console.log('✅ LibraryComponentPlugin Details:');
      const plugin = result.libraryComponentPlugin;
      console.log(`   ID: ${plugin.id}`);
      console.log(`   Version: ${plugin.version}`);
      console.log(`   Has Handlers: ${plugin.hasHandlers ? '✅' : '❌'} (${plugin.handlerNames.length} handlers)`);
      console.log(`   Handler Names: ${plugin.handlerNames.join(', ')}`);
      console.log(`   Has Sequence: ${plugin.hasSequence ? '✅' : '❌'}`);
      console.log(`   Sequence Name: ${plugin.sequenceName || 'N/A'}`);
      console.log(`   Sequence ID: ${plugin.sequenceId || 'N/A'}`);
      console.log('');
    } else {
      console.log('❌ LibraryComponentPlugin NOT FOUND in mountedPlugins Map!');
      console.log('');
      console.log('   Mounted Plugins:');
      result.mountedPluginIds.slice(0, 10).forEach(id => console.log(`      - ${id}`));
      if (result.mountedPluginIds.length > 10) {
        console.log(`      ... and ${result.mountedPluginIds.length - 10} more`);
      }
      console.log('');
    }

    // Runtime mounted sequences
    console.log('🎵 Runtime Mounted Sequences:');
    console.log(`   Total Runtime Mounted: ${result.totalRuntimeMounted}`);
    console.log(`   LibraryComponent Sequences: ${result.libraryComponentRuntimeMounted.length}`);
    if (result.libraryComponentRuntimeMounted.length > 0) {
      result.libraryComponentRuntimeMounted.forEach(id => console.log(`      ✅ ${id}`));
    } else {
      console.log('      ❌ No library-component sequences marked as runtime mounted');
    }
    console.log('');

    // Sequence registry
    console.log('📚 Sequence Registry:');
    console.log(`   Total Sequences: ${result.totalSequences}`);
    console.log(`   LibraryComponent Sequences: ${result.libraryComponentSequences.length}`);
    if (result.libraryComponentSequences.length > 0) {
      result.libraryComponentSequences.forEach(id => console.log(`      ✅ ${id}`));
    } else {
      console.log('      ❌ No library-component sequences in registry');
    }
    console.log('');

    // EventBus subscribers
    console.log('📡 EventBus Subscribers:');
    console.log(`   Drop Event Subscribers: ${result.hasDropSubscribers ? '✅' : '❌'} (${result.dropSubscriberCount})`);
    console.log(`   Library Events: ${result.libraryEvents.length}`);
    if (result.libraryEvents.length > 0) {
      result.libraryEvents.forEach(e => console.log(`      - ${e}`));
    }
    console.log(`   Total Events: ${result.totalEvents}`);
    console.log('');

    // Plugin statistics
    console.log('📈 Plugin Statistics:');
    console.log(`   Total Plugins: ${result.pluginStats.totalPlugins || 0}`);
    console.log(`   Plugins Registered: ${result.pluginStats.pluginsRegistered ? '✅' : '❌'}`);
    console.log('');

    // Analysis and recommendations
    console.log('═'.repeat(70));
    console.log('🔍 ANALYSIS');
    console.log('═'.repeat(70));
    console.log('');

    if (!result.hasLibraryComponent) {
      console.log('❌ CRITICAL ISSUE: LibraryComponentPlugin is NOT in mountedPlugins Map!');
      console.log('');
      console.log('   Possible causes:');
      console.log('   1. The register() function is not being called');
      console.log('   2. The mount() call is failing silently');
      console.log('   3. The plugin is being mounted but then removed');
      console.log('   4. The pluginId mismatch (check if using different ID)');
      console.log('');

      if (result.libraryComponentRuntimeMounted.length > 0) {
        console.log('   ⚠️  Sequences ARE marked as runtime mounted, but plugin is NOT in Map!');
        console.log('   This suggests mount() is being called but failing after marking sequences.');
        console.log('');
      }

      if (result.libraryComponentSequences.length > 0) {
        console.log('   ✅ Sequences ARE in the registry');
        console.log('   This suggests the sequence registration is working.');
        console.log('');
      }

      if (!result.hasDropSubscribers) {
        console.log('   ❌ No subscribers for drop event');
        console.log('   This is expected if the plugin mount failed.');
        console.log('');
      }

      console.log('   🔧 Recommended actions:');
      console.log('   1. Check the startup logs for mount errors');
      console.log('   2. Add error logging to PluginManager.mount()');
      console.log('   3. Verify the pluginId is exactly "LibraryComponentPlugin"');
      console.log('   4. Check if validation is failing silently');
    } else {
      console.log('✅ LibraryComponentPlugin is properly mounted!');
      console.log('');

      if (!result.hasDropSubscribers) {
        console.log('   ⚠️  But no subscribers for drop event!');
        console.log('   This suggests the handler wiring failed.');
        console.log('');
        console.log('   🔧 Check:');
        console.log('   1. Are handlers being passed to mount()?');
        console.log('   2. Is the beat event name correct?');
        console.log('   3. Is EventBus blocking duplicate subscriptions?');
      } else {
        console.log('   ✅ Drop event has subscribers - everything looks good!');
      }
    }

    console.log('');
    console.log('═'.repeat(70));

    ws.close();
    process.exit(0);
  }
});

ws.on('close', () => {
  // Connection closed
});

