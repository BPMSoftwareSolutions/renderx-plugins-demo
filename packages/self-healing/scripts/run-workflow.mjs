#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, 'json-sequences', 'handler-implementation.workflow.json');

function printHeader(title) {
  console.log('\n=== ' + title + ' ===');
}

function printPhase(phase) {
  console.log(`\nPhase ${phase.phase}: ${phase.name} (${phase.duration})`);
  console.log(`  ${phase.description}`);
  for (const step of phase.steps) {
    console.log(`  - Step ${step.step}: ${step.action}`);
    console.log(`      • ${step.details}`);
    console.log(`      → Outcome: ${step.expected_outcome}`);
  }
}

function printSummary(data) {
  printHeader(data.title);
  console.log(data.description);
  console.log(`\nPurpose: ${data.purpose}`);
  console.log(`Version: ${data.version}`);
}

function printRelated(related) {
  printHeader('Related Files');
  Object.entries(related).forEach(([k, v]) => {
    console.log(`- ${k}: ${v}`);
  });
}

try {
  const raw = fs.readFileSync(workflowPath, 'utf-8');
  const data = JSON.parse(raw);

  printSummary(data);

  printHeader('Phases');
  for (const phase of data.phases) {
    printPhase(phase);
  }

  printHeader('Quality Checklist');
  for (const item of data.quality_checklist || []) {
    console.log('- ' + item);
  }

  printHeader('Key Principles');
  for (const item of data.key_principles || []) {
    console.log('- ' + item);
  }

  if (data.related_files) {
    printRelated(data.related_files);
  }

  console.log('\nTip: Start at Phase 1, Step 1. Use the business spec to implement the business BDD test first, then drive unit tests (Red → Green → Refactor).');
} catch (err) {
  console.error('Failed to read workflow file:', workflowPath);
  console.error(err?.message || err);
  process.exit(1);
}
