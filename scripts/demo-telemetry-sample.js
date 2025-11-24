#!/usr/bin/env node
/**
 * Demo Telemetry Sample Generator
 * Simulates demo execution with telemetry emissions for testing/validation.
 * Usage: node scripts/demo-telemetry-sample.js <sprint-id> [--output-only]
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT, 'orchestration-audit-system-project-plan.json');

function load(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; } }

const plan = load(PLAN_FILE);
const sprintId = process.argv[2];
const outputOnly = process.argv.includes('--output-only');

if (!sprintId) {
  console.error('Usage: node scripts/demo-telemetry-sample.js <sprint-id> [--output-only]');
  process.exit(1);
}

const sprint = plan?.sprints?.find(s => s.id === sprintId);
if (!sprint) {
  console.error(`Sprint ${sprintId} not found`);
  process.exit(1);
}

// Simulate demo execution with telemetry emissions
console.log(`[DEMO] Starting sprint ${sprintId} (${sprint.name}) demo simulation...`);

// Emit telemetry events matching plan signatures
const signatures = sprint.telemetry?.signatures || [];
for (const sig of signatures) {
  console.log(`[TELEMETRY_EVENT] ${sig} Simulated execution of ${sig}`);
}

// Emit sample metrics
console.log('[TELEMETRY_METRIC] demo.duration_ms = 1234');
console.log('[TELEMETRY_METRIC] demo.status = success');

// Emit demo-specific outputs (passthrough)
console.log(`[DEMO] Sprint ${sprintId} objectives:`, (sprint.objectives || []).join(', '));
console.log(`[DEMO] Deliverables:`, (sprint.deliverables || []).join(', '));
console.log(`[DEMO] Acceptance criteria:`, (sprint.acceptanceCriteria || []).join(', '));

console.log(`[DEMO] Sprint ${sprintId} demo simulation completed`);

// If --output-only, exit successfully for testing
if (outputOnly) {
  console.log('[DEMO] Output-only mode; not running actual demo');
  process.exit(0);
}
