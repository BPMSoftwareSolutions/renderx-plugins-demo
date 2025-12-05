#!/usr/bin/env node
/**
 * Debug script to see the order sequences are processed
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function discoverSequences(domainId) {
  const sequences = [];

  try {
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
          const seqId = sequence.sequenceId || sequence.id;
          const seqDomainId = sequence.domainId;

          if (domainId && seqDomainId && seqDomainId !== domainId) {
            continue;
          }

          const handlers = new Set();
          if (sequence.movements && Array.isArray(sequence.movements)) {
            sequence.movements.forEach(movement => {
              if (movement.beats && Array.isArray(movement.beats)) {
                movement.beats.forEach(beat => {
                  if (beat.handler) {
                    const handlerStr = typeof beat.handler === 'string' ? beat.handler : beat.handler.name;
                    if (handlerStr) {
                      const parts = handlerStr.split('#');
                      const handlerName = parts.length > 1 ? parts[1] : parts[0];
                      handlers.add(handlerName.toLowerCase());
                    }
                  }
                });
              }
            });
          }

          sequences.push({
            sequenceId: seqId,
            name: sequence.name || seqId,
            handlers: Array.from(handlers),
            file
          });
        } catch (err) {
          continue;
        }
      }
    }
  } catch (e) {
    // Return empty array on error
  }

  return sequences;
}

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║ SEQUENCE PROCESSING ORDER DEBUG                               ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const domainId = 'renderx-web-orchestration';
const sequences = discoverSequences(domainId);

console.log(`Found ${sequences.length} sequences\n`);

// Filter to sequences that use notifyUi
const sequencesWithNotifyUi = sequences.filter(s => s.handlers.includes('notifyui'));

console.log(`Sequences that use 'notifyUi': ${sequencesWithNotifyUi.length}\n`);

sequencesWithNotifyUi.forEach((seq, index) => {
  console.log(`${index + 1}. ${seq.name} (${seq.sequenceId})`);
  console.log(`   File: ${seq.file}`);
  console.log(`   Handlers: ${seq.handlers.join(', ')}\n`);
});

console.log('\n💡 ANALYSIS:');
console.log('If multiple sequences use the same handler name (notifyUi),');
console.log('and the matching logic deletes handlers after matching,');
console.log('then only the FIRST sequence processed will get the handler.\n');
console.log('The sequence processed first will "consume" the handler,');
console.log('leaving subsequent sequences unable to match it.\n');
