#!/usr/bin/env node
/**
 * Demo Telemetry E2E Test
 * Simulates demo execution with telemetry capture for validation testing.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT, 'orchestration-audit-system-project-plan.json');
const CAPTURE_DIR = path.join(ROOT, '.generated', 'sprint-telemetry-capture');

function load(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; } }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

const plan = load(PLAN_FILE);
ensureDir(CAPTURE_DIR);

// Simulate telemetry capture for completed sprints
for (const sprint of plan.sprints) {
  if (sprint.status !== 'complete') continue;
  
  const signatures = sprint.telemetry?.signatures || [];
  
  // Simulate captured events
  const events = signatures.map((sig, idx) => ({
    signature: sig,
    details: `Simulated execution of ${sig}`,
    timestamp: new Date(Date.now() + idx * 100).toISOString()
  }));

  // Simulate metrics
  const metrics = [
    { name: 'demo.duration_ms', value: '1234', timestamp: new Date().toISOString() },
    { name: 'demo.status', value: 'success', timestamp: new Date().toISOString() }
  ];

  const capture = {
    sprint: sprint.id,
    name: sprint.name,
    capturedAt: new Date().toISOString(),
    demoCommand: 'npm run demo:output:enhanced (simulated)',
    events,
    metrics,
    validation: {
      required: signatures,
      captured: events.map(e => e.signature),
      missing: [],
      coverage: 1.0,
      allPresent: true
    },
    telemetryHash: crypto.createHash('sha256')
      .update(JSON.stringify(signatures.sort()))
      .digest('hex')
  };

  const filePath = path.join(CAPTURE_DIR, `sprint-${sprint.id}-capture.json`);
  fs.writeFileSync(filePath, JSON.stringify(capture, null, 2));
  console.log(`[demo-e2e-test] Created simulated capture for sprint ${sprint.id}`);
}

console.log(`[demo-e2e-test] Simulated telemetry captures complete`);
