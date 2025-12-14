#!/usr/bin/env node

/**
 * Report sourcePath compliance metrics for handlers
 * Shows which handlers have sourcePath defined in sequence JSON
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║ HANDLER SOURCEPATH COMPLIANCE REPORT                          ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const domainId = process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration';
console.log(`📋 Domain: ${domainId}\n`);

// Discover all sequences
function discoverSequences() {
  const sequences = [];
  const searchPaths = [
    'packages/*/json-sequences/**/*.json',
    'packages/orchestration/json-sequences/*.json'
  ];

  for (const searchPattern of searchPaths) {
    const files = glob.sync(searchPattern, { cwd: process.cwd() });

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      if (!fs.existsSync(fullPath)) continue;

      try {
        const sequence = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const seqDomainId = sequence.domainId;

        if (domainId && seqDomainId && seqDomainId !== domainId) {
          continue;
        }

        const handlers = [];
        if (sequence.movements && Array.isArray(sequence.movements)) {
          sequence.movements.forEach(movement => {
            if (movement.beats && Array.isArray(movement.beats)) {
              movement.beats.forEach(beat => {
                if (beat.handler) {
                  let handlerName, sourcePath = null, valid = false;

                  if (typeof beat.handler === 'string') {
                    handlerName = beat.handler;
                  } else if (beat.handler.name) {
                    handlerName = beat.handler.name;
                    sourcePath = beat.handler.sourcePath;

                    if (sourcePath) {
                      const fullSourcePath = path.join(process.cwd(), sourcePath);
                      valid = fs.existsSync(fullSourcePath);
                    }
                  }

                  handlers.push({
                    beat: beat.beat,
                    name: handlerName,
                    sourcePath,
                    valid
                  });
                }
              });
            }
          });
        }

        sequences.push({
          sequenceId: sequence.id || sequence.sequenceId,
          name: sequence.name,
          file,
          handlers
        });
      } catch (err) {
        // Skip invalid JSON
      }
    }
  }

  return sequences;
}

const sequences = discoverSequences();

let totalHandlers = 0;
let handlersWithSource = 0;
let validSourcePaths = 0;

console.log('═'.repeat(65));
console.log('SEQUENCE COMPLIANCE\n');

sequences.forEach(sequence => {
  const withSource = sequence.handlers.filter(h => h.sourcePath !== null).length;
  const validSource = sequence.handlers.filter(h => h.valid).length;
  const compliance = sequence.handlers.length > 0
    ? Math.round((validSource / sequence.handlers.length) * 100)
    : 0;

  totalHandlers += sequence.handlers.length;
  handlersWithSource += withSource;
  validSourcePaths += validSource;

  const status = compliance === 100 ? '✅' : compliance > 0 ? '🟡' : '❌';

  console.log(`${status} ${sequence.name}`);
  console.log(`   Handlers: ${sequence.handlers.length} | With Source: ${validSource}/${sequence.handlers.length} (${compliance}%)`);

  if (compliance < 100) {
    const missing = sequence.handlers.filter(h => !h.valid);
    missing.forEach(h => {
      console.log(`      ⚠️  Beat ${h.beat}: ${h.name} - ${h.sourcePath ? 'Invalid path' : 'No sourcePath'}`);
    });
  }
  console.log('');
});

console.log('═'.repeat(65));
console.log('OVERALL COMPLIANCE\n');

const overallCompliance = totalHandlers > 0
  ? Math.round((validSourcePaths / totalHandlers) * 100)
  : 0;

console.log(`Total Handlers: ${totalHandlers}`);
console.log(`Handlers with sourcePath: ${handlersWithSource} (${Math.round((handlersWithSource / totalHandlers) * 100)}%)`);
console.log(`Valid Source Paths: ${validSourcePaths} (${overallCompliance}%)`);
console.log('');

if (overallCompliance === 100) {
  console.log('✅ ALL HANDLERS HAVE VALID SOURCE PATHS!\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${totalHandlers - validSourcePaths} handlers missing valid sourcePath\n`);
  console.log('Recommendation: Add sourcePath to remaining handler references in sequence JSON files.\n');
  process.exit(0);
}
