#!/usr/bin/env node
/**
 * Validate that handler sourcePath references in sequence JSON files point to actual files
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

          const handlers = [];
          if (sequence.movements && Array.isArray(sequence.movements)) {
            sequence.movements.forEach((movement, mIndex) => {
              if (movement.beats && Array.isArray(movement.beats)) {
                movement.beats.forEach((beat, bIndex) => {
                  if (beat.handler) {
                    const handlerDef = typeof beat.handler === 'string'
                      ? { name: beat.handler }
                      : beat.handler;

                    handlers.push({
                      name: handlerDef.name,
                      sourcePath: handlerDef.sourcePath,
                      beat: beat.beat || `${mIndex + 1}.${bIndex + 1}`
                    });
                  }
                });
              }
            });
          }

          sequences.push({
            sequenceId: seqId,
            name: sequence.name || seqId,
            handlers,
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
console.log('║ HANDLER SOURCE PATH VALIDATION                                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const domainId = process.argv[2] || 'renderx-web-orchestration';

console.log(`📋 Loading sequences for domain: ${domainId}\n`);
const sequences = discoverSequences(domainId);

let totalHandlers = 0;
let handlersWithSourcePath = 0;
let validSourcePaths = 0;
let invalidSourcePaths = 0;

const issues = [];

sequences.forEach(sequence => {
  sequence.handlers.forEach(handler => {
    totalHandlers++;

    if (handler.sourcePath) {
      handlersWithSourcePath++;

      const fullPath = path.join(process.cwd(), handler.sourcePath);

      if (fs.existsSync(fullPath)) {
        validSourcePaths++;
      } else {
        invalidSourcePaths++;
        issues.push({
          sequence: sequence.name,
          handler: handler.name,
          beat: handler.beat,
          sourcePath: handler.sourcePath,
          issue: 'FILE_NOT_FOUND'
        });
      }
    }
  });
});

console.log('═'.repeat(65));
console.log('SUMMARY');
console.log('═'.repeat(65));
console.log(`Total Handlers: ${totalHandlers}`);
console.log(`Handlers with sourcePath: ${handlersWithSourcePath} (${Math.round(handlersWithSourcePath / totalHandlers * 100)}%)`);
console.log(`Valid Source Paths: ${validSourcePaths}`);
console.log(`Invalid Source Paths: ${invalidSourcePaths}\n`);

if (issues.length > 0) {
  console.log('❌ VALIDATION ISSUES:\n');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.sequence} - Beat ${issue.beat} - ${issue.handler}`);
    console.log(`   sourcePath: ${issue.sourcePath}`);
    console.log(`   ❌ ${issue.issue}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ ALL HANDLER SOURCE PATHS VALIDATED SUCCESSFULLY!\n');
  console.log(`Coverage: ${handlersWithSourcePath}/${totalHandlers} handlers have sourcePath defined\n`);
  process.exit(0);
}
