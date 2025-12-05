#!/usr/bin/env node
/**
 * Comprehensive test to validate ALL sequences match the report
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
            beatCount: sequence.beats || 0,
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

function findHandlersInReport(reportContent, symphonyName) {
  const handlers = [];

  // Find the symphony section
  const symphonyPattern = new RegExp(`HANDLER SYMPHONY: ${symphonyName.toUpperCase()}[\\s\\S]*?(?=║ HANDLER SYMPHONY:|$)`, 'i');
  const match = reportContent.match(symphonyPattern);

  if (!match) {
    return null; // Symphony not found in report
  }

  const section = match[0];

  // Extract handler count from Scope line (format: "X Beats · Y Handlers")
  const scopeMatch = section.match(/(\d+)\s+Handlers/);
  const reportedCount = scopeMatch ? parseInt(scopeMatch[1], 10) : 0;

  // Extract handlers from the beat lines
  const handlerPattern = /║\s+\d+\.\d+\s+M\d+\s+(\w+)/g;
  let handlerMatch;

  while ((handlerMatch = handlerPattern.exec(section)) !== null) {
    handlers.push(handlerMatch[1]);
  }

  return { handlers, reportedCount };
}

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║ COMPREHENSIVE SEQUENCE VALIDATION                             ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const domainId = 'renderx-web-orchestration';

console.log('📋 Loading all sequences...\n');
const sequences = discoverSequences(domainId);

console.log(`Found ${sequences.length} sequences in domain: ${domainId}\n`);

// Read the latest report
const reportFiles = glob.sync('.generated/analysis/renderx-web/*rich-markdown*.md');
if (reportFiles.length === 0) {
  console.log('❌ FAIL: No report file found');
  process.exit(1);
}

const reportPath = reportFiles.sort().reverse()[0];
const reportContent = fs.readFileSync(reportPath, 'utf8');

console.log(`📊 Using report: ${path.basename(reportPath)}\n`);
console.log('═'.repeat(65) + '\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

sequences.forEach(sequence => {
  if (sequence.handlers.length === 0) {
    return; // Skip sequences with no handlers
  }

  totalTests++;

  const reportData = findHandlersInReport(reportContent, sequence.name);

  if (!reportData) {
    // Symphony not in report
    failures.push({
      sequence: sequence.name,
      issue: 'NOT_IN_REPORT',
      expected: sequence.handlers,
      found: []
    });
    failedTests++;
    return;
  }

  const { handlers: foundHandlers, reportedCount } = reportData;

  // Check for mismatches
  const missingHandlers = sequence.handlers.filter(h =>
    !foundHandlers.some(fh => fh.toLowerCase() === h.toLowerCase())
  );

  const extraHandlers = foundHandlers.filter(fh =>
    !sequence.handlers.some(h => h.toLowerCase() === fh.toLowerCase())
  );

  const countMismatch = reportedCount !== sequence.handlers.length;

  if (missingHandlers.length === 0 && extraHandlers.length === 0 && !countMismatch) {
    passedTests++;
  } else {
    failedTests++;
    failures.push({
      sequence: sequence.name,
      sequenceId: sequence.sequenceId,
      expected: sequence.handlers,
      found: foundHandlers,
      reportedCount,
      missingHandlers,
      extraHandlers,
      countMismatch
    });
  }
});

// Print results
if (failedTests === 0) {
  console.log('✅ ALL SEQUENCES VALIDATED SUCCESSFULLY!\n');
} else {
  console.log('❌ VALIDATION FAILURES DETECTED\n');
  console.log(`Failed: ${failedTests} / ${totalTests}\n`);
  console.log('═'.repeat(65) + '\n');

  failures.forEach((failure, index) => {
    console.log(`${index + 1}. ${failure.sequence}`);

    if (failure.issue === 'NOT_IN_REPORT') {
      console.log('   ❌ Symphony not found in report');
      console.log(`   Expected ${failure.expected.length} handlers: ${failure.expected.join(', ')}\n`);
      return;
    }

    console.log(`   Sequence ID: ${failure.sequenceId}`);
    console.log(`   Expected: ${failure.expected.length} handlers`);
    console.log(`   Found: ${failure.found.length} handlers`);
    console.log(`   Reported count: ${failure.reportedCount}`);

    if (failure.countMismatch) {
      console.log(`   ⚠️  Count mismatch: report says ${failure.reportedCount} but lists ${failure.found.length}`);
    }

    if (failure.missingHandlers.length > 0) {
      console.log(`   ❌ Missing: ${failure.missingHandlers.join(', ')}`);
    }

    if (failure.extraHandlers.length > 0) {
      console.log(`   ⚠️  Extra: ${failure.extraHandlers.join(', ')}`);
    }

    console.log('');
  });
}

console.log('═'.repeat(65));
console.log(`\nTotal: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
