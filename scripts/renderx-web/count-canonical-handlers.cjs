#!/usr/bin/env node

/**
 * Count Handlers from Canonical Sequences
 *
 * Reads canonical-sequences.manifest.json and counts all handlers across all sequences
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/canonical-sequences.manifest.json');

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifest not found. Run generate-canonical-sequence-index.cjs first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

function loadSequence(filePath) {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (err) {
    console.warn(`⚠️  Failed to parse ${filePath}: ${err.message}`);
    return null;
  }
}

function extractHandlers(sequence, filePath) {
  const handlers = new Set();

  if (!sequence) {
    return handlers;
  }

  // Handle both musicalSequence format (workflows) and direct format (sequences)
  let movements = [];

  if (sequence.musicalSequence) {
    movements = sequence.musicalSequence.movements || [];
  } else if (sequence.movements) {
    movements = sequence.movements;
  }

  for (const movement of movements) {
    const beats = movement.beats || [];

    for (const beat of beats) {
      // Extract handler from beat.handler (direct format)
      if (beat.handler && typeof beat.handler === 'string') {
        handlers.add(beat.handler);
      }

      // Extract handlers from beat.handlers array (workflow format)
      if (beat.handlers) {
        for (const handler of beat.handlers) {
          if (typeof handler === 'string') {
            handlers.add(handler);
          } else if (handler.function) {
            handlers.add(handler.function);
          } else if (handler.script) {
            // Skip scripts, we're counting handler functions
            continue;
          }
        }
      }

      // Extract handler from handlerRef
      if (beat.handlerRef) {
        handlers.add(beat.handlerRef);
      }
    }
  }

  return handlers;
}

function main() {
  console.log('🔍 Counting Handlers from Canonical Sequences\n');

  const manifest = loadManifest();

  console.log(`📊 Manifest Info:`);
  console.log(`   Domains: ${manifest.totals.domains}`);
  console.log(`   Sequences: ${manifest.totals.sequences}`);
  console.log(`   Missing: ${manifest.totals.missing}\n`);

  const allHandlers = new Set();
  const handlersByFile = new Map();
  const handlerCounts = new Map();

  let sequencesProcessed = 0;
  let sequencesWithHandlers = 0;

  for (const filePath of manifest.sequenceFiles) {
    const sequence = loadSequence(filePath);

    if (!sequence) {
      continue;
    }

    sequencesProcessed++;
    const handlers = extractHandlers(sequence, filePath);

    if (handlers.size > 0) {
      sequencesWithHandlers++;
      handlersByFile.set(filePath, Array.from(handlers));

      for (const handler of handlers) {
        allHandlers.add(handler);
        handlerCounts.set(handler, (handlerCounts.get(handler) || 0) + 1);
      }
    }
  }

  console.log(`📈 Handler Summary:`);
  console.log(`   Sequences processed: ${sequencesProcessed}/${manifest.totals.sequences}`);
  console.log(`   Sequences with handlers: ${sequencesWithHandlers}`);
  console.log(`   Unique handlers: ${allHandlers.size}`);
  console.log(`   Total handler references: ${Array.from(handlerCounts.values()).reduce((a, b) => a + b, 0)}\n`);

  // Top handlers by usage
  const sortedHandlers = Array.from(handlerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  console.log(`🔥 Top 20 Handlers by Usage:`);
  for (const [handler, count] of sortedHandlers) {
    console.log(`   ${handler}: ${count} references`);
  }
  console.log('');

  // Group by package
  const byPackage = new Map();
  for (const handler of allHandlers) {
    const pkg = handler.split('/')[0] || 'unknown';
    if (!byPackage.has(pkg)) {
      byPackage.set(pkg, []);
    }
    byPackage.get(pkg).push(handler);
  }

  console.log(`📦 Handlers by Package:`);
  for (const [pkg, handlers] of Array.from(byPackage.entries()).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`   ${pkg}: ${handlers.length} handlers`);
  }
  console.log('');

  // Write report
  const reportPath = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/handler-count.json');
  const report = {
    generatedAt: new Date().toISOString(),
    manifest: {
      domains: manifest.totals.domains,
      sequences: manifest.totals.sequences,
      missing: manifest.totals.missing
    },
    handlers: {
      unique: allHandlers.size,
      total: Array.from(handlerCounts.values()).reduce((a, b) => a + b, 0),
      byPackage: Object.fromEntries(
        Array.from(byPackage.entries()).map(([pkg, handlers]) => [pkg, handlers.length])
      ),
      topHandlers: sortedHandlers.map(([handler, count]) => ({ handler, count })),
      allHandlers: Array.from(allHandlers).sort()
    },
    sequences: {
      processed: sequencesProcessed,
      withHandlers: sequencesWithHandlers
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Report written: ${reportPath}\n`);
}

main();
