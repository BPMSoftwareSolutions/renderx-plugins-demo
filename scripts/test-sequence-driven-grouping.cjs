#!/usr/bin/env node
/**
 * Test script to verify sequence-driven symphony grouping
 * Validates that all handlers defined in sequence JSON files are properly matched
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Load the generate-architecture-diagram.cjs functions
const { generateDiagram } = require('./generate-architecture-diagram.cjs');

/**
 * Discover sequences and extract handler names
 */
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
                      handlers.add(handlerName);
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
            beatCount: sequence.beats || 0
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

/**
 * Find handlers in generated report
 */
function findHandlersInReport(reportContent, symphonyName) {
  const handlers = [];

  // Find the symphony section
  const symphonyPattern = new RegExp(`HANDLER SYMPHONY: ${symphonyName.toUpperCase()}[\\s\\S]*?(?=HANDLER SYMPHONY:|$)`, 'i');
  const match = reportContent.match(symphonyPattern);

  if (!match) {
    return handlers;
  }

  const section = match[0];

  // Extract handlers from the beat lines (format: "║ 1.1  M1  handlerName  ...")
  const handlerPattern = /║\s+\d+\.\d+\s+M\d+\s+(\w+)/g;
  let handlerMatch;

  while ((handlerMatch = handlerPattern.exec(section)) !== null) {
    handlers.push(handlerMatch[1]);
  }

  return handlers;
}

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║ SEQUENCE-DRIVEN GROUPING TEST                                 ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Test focus: canvas-component-create-symphony
const domainId = 'renderx-web-orchestration';
const testSequences = [
  { id: 'canvas-component-create-symphony', name: 'Canvas Component Create' },
  { id: 'canvas-component-augment-symphony', name: 'Canvas Component Augment' }
];

console.log('📋 Loading sequences...\n');
const sequences = discoverSequences(domainId);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

testSequences.forEach(testSeq => {
  const sequence = sequences.find(s => s.sequenceId === testSeq.id);

  if (!sequence) {
    console.log(`❌ FAIL: Sequence ${testSeq.id} not found`);
    failedTests++;
    totalTests++;
    return;
  }

  console.log(`\n📦 Testing: ${sequence.name}`);
  console.log(`   Sequence ID: ${sequence.sequenceId}`);
  console.log(`   Expected handlers: ${sequence.handlers.length}`);
  console.log(`   Handlers: ${sequence.handlers.join(', ')}\n`);

  // Read the latest report
  const reportFiles = glob.sync('.generated/analysis/renderx-web/*rich-markdown*.md');
  if (reportFiles.length === 0) {
    console.log('❌ FAIL: No report file found');
    failedTests++;
    totalTests++;
    return;
  }

  // Get most recent report
  const reportPath = reportFiles.sort().reverse()[0];
  const reportContent = fs.readFileSync(reportPath, 'utf8');

  const foundHandlers = findHandlersInReport(reportContent, testSeq.name);

  console.log(`   Found in report: ${foundHandlers.length} handlers`);
  console.log(`   Handlers: ${foundHandlers.join(', ')}\n`);

  // Test: All sequence handlers should be in report
  const missingHandlers = sequence.handlers.filter(h =>
    !foundHandlers.some(fh => fh.toLowerCase() === h.toLowerCase())
  );

  const extraHandlers = foundHandlers.filter(fh =>
    !sequence.handlers.some(h => h.toLowerCase() === fh.toLowerCase())
  );

  totalTests++;

  if (missingHandlers.length === 0 && extraHandlers.length === 0) {
    console.log(`   ✅ PASS: All handlers match\n`);
    passedTests++;
  } else {
    console.log(`   ❌ FAIL: Handler mismatch\n`);

    if (missingHandlers.length > 0) {
      console.log(`   Missing from report: ${missingHandlers.join(', ')}`);
    }

    if (extraHandlers.length > 0) {
      console.log(`   Extra in report: ${extraHandlers.join(', ')}`);
    }

    console.log('');
    failedTests++;
  }
});

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║ TEST SUMMARY                                                  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}\n`);

if (failedTests > 0) {
  console.log('❌ TESTS FAILED\n');
  process.exit(1);
} else {
  console.log('✅ ALL TESTS PASSED\n');
  process.exit(0);
}
