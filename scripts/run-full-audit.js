#!/usr/bin/env node
/**
 * run-full-audit.js
 * Unified CLI runner sequencing all audit phases with timing & failure reporting.
 * Phases:
 *  1. Catalog Analysis (manifests, components, sequences, topics)
 *  2. IR Extraction (handlers, sequences, tests)
 *  3. Gap Comparison (catalog vs IR)
 *  4. External Interactions Audit (matrix & ownership validation)
 *  5. Comprehensive Audit (aggregated report)
 *  6. Proposed Tests (optional generation)
 */

import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const phases = [
  {
    name: 'Catalog: Manifests', cmd: ['node', ['scripts/analyze-catalog-manifests.js']]
  },
  {
    name: 'Catalog: Components', cmd: ['node', ['scripts/analyze-catalog-components.js']]
  },
  {
    name: 'Catalog: Sequences', cmd: ['node', ['scripts/analyze-catalog-sequences.js']]
  },
  {
    name: 'Catalog: Topics', cmd: ['node', ['scripts/analyze-catalog-topics.js']]
  },
  {
    name: 'IR: Handlers', cmd: ['node', ['scripts/extract-ir-handlers.js']]
  },
  {
    name: 'IR: Sequences', cmd: ['node', ['scripts/extract-ir-sequences.js']]
  },
  {
    name: 'IR: Tests', cmd: ['node', ['scripts/extract-handler-tests.js']]
  },
  {
    name: 'Compare Catalog vs IR', cmd: ['node', ['scripts/compare-catalog-vs-ir.js']]
  },
  {
    name: 'External Interactions Audit', cmd: ['node', ['scripts/generate-external-interactions-audit.js']]
  },
  {
    name: 'Comprehensive Audit', cmd: ['node', ['scripts/generate-comprehensive-audit.js']]
  },
  {
    name: 'Proposed Tests', cmd: ['node', ['scripts/generate-proposed-tests.js']], optional: true
  }
];

const results = [];
let hadError = false;

function runPhase(phase) {
  const start = Date.now();
  console.log(`\n▶ Phase Start: ${phase.name}`);
  const [command, args] = phase.cmd;
  const r = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  const durationMs = Date.now() - start;
  const success = r.status === 0;
  results.push({ name: phase.name, success, durationMs, status: r.status });
  if (!success && !phase.optional) {
    console.error(`❌ Phase Failed: ${phase.name} (exit ${r.status})`);
    hadError = true;
  } else {
    console.log(`✅ Phase Complete: ${phase.name} (${durationMs}ms)`);
  }
  return success;
}

console.log('🚀 Running Full Audit Sequence');
console.log('='.repeat(70));

for (const phase of phases) {
  if (hadError) break;
  runPhase(phase);
}

console.log('\n'.repeat(1) + '📦 Audit Summary');
console.log('-'.repeat(70));
results.forEach(r => {
  const status = r.success ? 'OK' : 'FAIL';
  console.log(`${status.padEnd(5)} | ${r.name.padEnd(35)} | ${String(r.durationMs).padStart(6)}ms | exit=${r.status}`);
});

if (hadError) {
  console.log('\n❌ Full audit did not complete successfully.');
  process.exit(1);
} else {
  console.log('\n✅ Full audit completed successfully.');
}
