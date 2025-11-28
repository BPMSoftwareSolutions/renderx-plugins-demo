/**
 * enhance-handlers-with-scope.cjs
 * 
 * Enhances JSON sequence files with handler-level scope/kind metadata.
 * Identifies beats and adds "handler" field with scope/kind based on sequence category.
 * 
 * Usage:
 *   node scripts/enhance-handlers-with-scope.cjs <category>
 *   node scripts/enhance-handlers-with-scope.cjs orchestration  # For orchestration sequences
 *   node scripts/enhance-handlers-with-scope.cjs plugin        # For plugin sequences
 *   node scripts/enhance-handlers-with-scope.cjs all           # For all sequences
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Category configuration
const CATEGORIES = {
  orchestration: {
    scope: 'orchestration',
    kind: 'orchestration',
    patterns: [
      'packages/orchestration/json-sequences/**/*.json',
      '!packages/orchestration/json-sequences/orchestration-registry-audit-pipeline.json' // Skip audit initially
    ]
  },
  plugin: {
    scope: 'plugin',
    kind: 'plugin',
    patterns: [
      'src/RenderX.Plugins.**/json-sequences/**/*.json',
      'packages/plugins/**/json-sequences/**/*.json'
    ]
  }
};

/**
 * Generate handler ID from beat context
 */
function generateHandlerId(beat, sequenceId, movementIndex, beatIndex) {
  const handlerName = beat.handler || beat.name || `beat-${movementIndex}-${beatIndex}`;
  const normalized = handlerName
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .toLowerCase();
  
  return `${sequenceId}.${normalized}.${beatIndex}`;
}

/**
 * Add handler scope/kind to a beat
 */
function enhanceBeat(beat, sequenceId, movementIndex, beatIndex, config) {
  if (!beat.handler) {
    return beat; // Skip beats without handler names
  }

  if (beat.handler && !beat.handlerDef && !beat.handler.scope) {
    // Add handlerDef field
    beat.handlerDef = {
      id: generateHandlerId(beat, sequenceId, movementIndex, beatIndex),
      scope: config.scope,
      kind: config.kind
    };
    
    // If beat has additional metadata, include it
    if (beat.handler && typeof beat.handler === 'string') {
      // handler is just a string, keep it as-is
    }
  }

  return beat;
}

/**
 * Enhance sequence file with handler scope/kind
 */
function enhanceSequenceFile(filePath, config) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const sequence = JSON.parse(content);
    
    let modified = false;
    
    // Handle beatDetails array (orchestration sequences)
    if (Array.isArray(sequence.beatDetails)) {
      sequence.beatDetails = sequence.beatDetails.map((beat, idx) => {
        const originalHasHandler = beat.handlerDef || (beat.handler && beat.handler.scope);
        const enhanced = enhanceBeat(beat, sequence.id || sequence.sequenceId, 0, idx, config);
        if (!originalHasHandler && enhanced.handlerDef) {
          modified = true;
        }
        return enhanced;
      });
    }

    // Handle movements with beats (plugin sequences)
    if (Array.isArray(sequence.movements)) {
      sequence.movements = sequence.movements.map((movement, mvIdx) => {
        if (Array.isArray(movement.beats)) {
          movement.beats = movement.beats.map((beat, beatIdx) => {
            const originalHasHandler = beat.handlerDef || (beat.handler && beat.handler.scope);
            const enhanced = enhanceBeat(beat, sequence.id || sequence.sequenceId, mvIdx, beatIdx, config);
            if (!originalHasHandler && enhanced.handlerDef) {
              modified = true;
            }
            return enhanced;
          });
        }
        return movement;
      });
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(sequence, null, 2) + '\n');
      return { path: filePath, status: 'enhanced', modified: true };
    } else {
      return { path: filePath, status: 'already-enhanced', modified: false };
    }
  } catch (err) {
    return { path: filePath, status: 'error', error: err.message };
  }
}

/**
 * Process all files matching patterns for a category
 */
function processCategory(categoryName, config) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Processing ${categoryName.toUpperCase()} sequences`);
  console.log(`Scope: ${config.scope} | Kind: ${config.kind}`);
  console.log(`${'='.repeat(80)}\n`);

  const results = {
    total: 0,
    enhanced: 0,
    alreadyEnhanced: 0,
    errors: 0,
    files: []
  };

  // Resolve patterns
  let files = [];
  config.patterns.forEach(pattern => {
    const isNegation = pattern.startsWith('!');
    const actualPattern = isNegation ? pattern.slice(1) : pattern;
    const matches = glob.sync(actualPattern, { cwd: process.cwd() });
    
    if (isNegation) {
      files = files.filter(f => !matches.includes(f));
    } else {
      files = files.concat(matches);
    }
  });

  files = [...new Set(files)]; // Remove duplicates

  files.forEach(file => {
    const result = enhanceSequenceFile(file, config);
    results.files.push(result);
    results.total++;

    if (result.status === 'enhanced') {
      results.enhanced++;
      console.log(`✅ ENHANCED: ${result.path}`);
    } else if (result.status === 'already-enhanced') {
      results.alreadyEnhanced++;
      console.log(`ℹ️  ALREADY: ${result.path}`);
    } else {
      results.errors++;
      console.log(`❌ ERROR: ${result.path} - ${result.error}`);
    }
  });

  return results;
}

/**
 * Main execution
 */
function main() {
  const categoryArg = process.argv[2] || 'all';

  if (!['orchestration', 'plugin', 'all'].includes(categoryArg)) {
    console.error(`Invalid category: ${categoryArg}`);
    console.error(`Valid options: orchestration, plugin, all`);
    process.exit(1);
  }

  const allResults = {};

  if (categoryArg === 'orchestration' || categoryArg === 'all') {
    allResults.orchestration = processCategory('orchestration', CATEGORIES.orchestration);
  }

  if (categoryArg === 'plugin' || categoryArg === 'all') {
    allResults.plugin = processCategory('plugin', CATEGORIES.plugin);
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(80)}\n`);

  Object.entries(allResults).forEach(([category, results]) => {
    console.log(`${category.toUpperCase()}:`);
    console.log(`  Total files:       ${results.total}`);
    console.log(`  Enhanced:          ${results.enhanced}`);
    console.log(`  Already enhanced:  ${results.alreadyEnhanced}`);
    console.log(`  Errors:            ${results.errors}`);
    console.log();
  });

  // Overall stats
  const totalStats = Object.values(allResults).reduce((acc, r) => ({
    total: acc.total + r.total,
    enhanced: acc.enhanced + r.enhanced,
    alreadyEnhanced: acc.alreadyEnhanced + r.alreadyEnhanced,
    errors: acc.errors + r.errors
  }), { total: 0, enhanced: 0, alreadyEnhanced: 0, errors: 0 });

  console.log(`OVERALL:`);
  console.log(`  Total files processed:    ${totalStats.total}`);
  console.log(`  Total enhanced:           ${totalStats.enhanced}`);
  console.log(`  Already enhanced:         ${totalStats.alreadyEnhanced}`);
  console.log(`  Errors:                   ${totalStats.errors}`);
  console.log(`\n✅ Handler enhancement complete!`);
}

main();
