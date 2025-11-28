/**
 * analyze-handlers-by-scope.cjs
 * 
 * Analyzes orchestration and plugin handlers separately, generating per-scope metrics.
 * 
 * Outputs:
 *   - handlers-by-scope-summary.json: Aggregated counts and statistics
 *   - handlers-orchestration-list.json: All orchestration handlers
 *   - handlers-plugin-list.json: All plugin handlers
 * 
 * Usage:
 *   node scripts/analyze-handlers-by-scope.cjs
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Extract handlers from a sequence file
 */
function extractHandlersFromSequence(filePath, sequenceJson) {
  const handlers = [];
  const sequenceId = sequenceJson.id || sequenceJson.sequenceId;
  const sequenceCategory = sequenceJson.category || 'plugin'; // Default to plugin if not specified
  
  // Extract from beatDetails (orchestration sequences)
  if (Array.isArray(sequenceJson.beatDetails)) {
    sequenceJson.beatDetails.forEach((beat, idx) => {
      if (beat.handler || beat.handlerDef) {
        handlers.push({
          sequenceId,
          sequenceCategory,
          beatIndex: idx,
          beatName: beat.name,
          handlerName: beat.handler || 'unknown',
          scope: beat.handlerDef?.scope || 'unknown',
          kind: beat.handlerDef?.kind || 'unknown',
          handlerId: beat.handlerDef?.id || `${sequenceId}.${beat.handler}.${idx}`,
          stage: beat.handlerDef?.stage,
          implementationRef: beat.handlerDef?.implementationRef
        });
      }
    });
  }

  // Extract from movements.beats (both orchestration and plugin)
  if (Array.isArray(sequenceJson.movements)) {
    sequenceJson.movements.forEach((movement, mvIdx) => {
      if (Array.isArray(movement.beats)) {
        movement.beats.forEach((beat, beatIdx) => {
          if (beat.handler || beat.handlerDef) {
            handlers.push({
              sequenceId,
              sequenceCategory,
              movementIndex: mvIdx,
              movementName: movement.name || movement.id,
              beatIndex: beatIdx,
              beatName: beat.name || `beat-${beatIdx}`,
              handlerName: beat.handler || 'unknown',
              scope: beat.handlerDef?.scope || 'unknown',
              kind: beat.handlerDef?.kind || 'unknown',
              handlerId: beat.handlerDef?.id || `${sequenceId}.${beat.handler}.${beatIdx}`,
              stage: beat.handlerDef?.stage,
              implementationRef: beat.handlerDef?.implementationRef
            });
          }
        });
      }
    });
  }

  return handlers;
}

/**
 * Main analysis
 */
function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Analyzing Handlers by Scope');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Find all sequence files
  const patterns = [
    'packages/orchestration/json-sequences/**/*.json',
    'src/RenderX.Plugins.**/json-sequences/**/*.json',
    'packages/plugins/**/json-sequences/**/*.json'
  ];

  let allFiles = [];
  patterns.forEach(pattern => {
    allFiles = allFiles.concat(glob.sync(pattern, { cwd: process.cwd() }));
  });
  allFiles = [...new Set(allFiles)]; // Remove duplicates

  console.log(`📁 Found ${allFiles.length} sequence files\n`);

  // Extract all handlers
  const allHandlers = [];
  const errors = [];

  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const json = JSON.parse(content);
      const handlers = extractHandlersFromSequence(file, json);
      allHandlers.push(...handlers);
    } catch (err) {
      errors.push({ file, error: err.message });
    }
  });

  // Separate by scope
  const orchestrationHandlers = allHandlers.filter(h => h.scope === 'orchestration');
  const pluginHandlers = allHandlers.filter(h => h.scope === 'plugin');
  const unknownScope = allHandlers.filter(h => h.scope === 'unknown');

  // Generate statistics
  const stats = {
    timestamp: new Date().toISOString(),
    totalFiles: allFiles.length,
    totalHandlers: allHandlers.length,
    handlersByScope: {
      orchestration: {
        count: orchestrationHandlers.length,
        handlers: orchestrationHandlers
      },
      plugin: {
        count: pluginHandlers.length,
        handlers: pluginHandlers
      },
      unknown: {
        count: unknownScope.length,
        handlers: unknownScope
      }
    },
    sequencesCovered: {
      orchestration: [...new Set(orchestrationHandlers.map(h => h.sequenceId))],
      plugin: [...new Set(pluginHandlers.map(h => h.sequenceId))],
      total: [...new Set(allHandlers.map(h => h.sequenceId))]
    },
    summary: {
      'Orchestration Handlers': orchestrationHandlers.length,
      'Plugin Handlers': pluginHandlers.length,
      'Unknown Scope': unknownScope.length,
      'Total Sequences': [...new Set(allHandlers.map(h => h.sequenceId))].length
    },
    errors: errors.length > 0 ? errors : 'none'
  };

  // Write output files
  const outputDir = 'docs/generated/handler-analysis';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Summary
  fs.writeFileSync(
    path.join(outputDir, 'handlers-by-scope-summary.json'),
    JSON.stringify(stats, null, 2)
  );

  // Orchestration handlers list
  fs.writeFileSync(
    path.join(outputDir, 'handlers-orchestration-list.json'),
    JSON.stringify({
      timestamp: stats.timestamp,
      count: orchestrationHandlers.length,
      handlers: orchestrationHandlers.sort((a, b) => a.sequenceId.localeCompare(b.sequenceId))
    }, null, 2)
  );

  // Plugin handlers list
  fs.writeFileSync(
    path.join(outputDir, 'handlers-plugin-list.json'),
    JSON.stringify({
      timestamp: stats.timestamp,
      count: pluginHandlers.length,
      handlers: pluginHandlers.sort((a, b) => a.sequenceId.localeCompare(b.sequenceId))
    }, null, 2)
  );

  // Display results
  console.log('📊 Handler Scope Analysis Results:\n');
  console.log(`  🎭 Orchestration Handlers: ${orchestrationHandlers.length}`);
  console.log(`  🎨 Plugin Handlers:        ${pluginHandlers.length}`);
  console.log(`  ❓ Unknown Scope:         ${unknownScope.length}`);
  console.log(`\n  Total Unique Sequences: ${stats.sequencesCovered.total.length}`);
  console.log(`  Orchestration Sequences: ${stats.sequencesCovered.orchestration.length}`);
  console.log(`  Plugin Sequences:        ${stats.sequencesCovered.plugin.length}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Errors: ${errors.length}`);
    errors.forEach(e => console.log(`    - ${e.file}: ${e.error}`));
  }

  console.log(`\n📁 Output files written to: ${outputDir}`);
  console.log('   - handlers-by-scope-summary.json');
  console.log('   - handlers-orchestration-list.json');
  console.log('   - handlers-plugin-list.json');
  console.log('\n✅ Handler scope analysis complete!\n');
}

main();
