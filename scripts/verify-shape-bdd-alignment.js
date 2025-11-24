#!/usr/bin/env node
/**
 * verify-shape-bdd-alignment.js
 * Ensures each slo-dashboard BDD scenario has handler coverage and (optionally) telemetry shape presence.
 * Exit codes:
 * 0 = pass (or only warnings)
 * 1 = failures (missing handler coverage or required telemetry when STRICT)
 */
import fs from 'fs';
import path from 'path';

const STRICT = process.env.SHAPE_BDD_STRICT === '1';
const root = process.cwd();
const specPath = path.join(root, 'packages', 'slo-dashboard', '.generated', 'slo-dashboard-business-bdd-specifications.json');
const handlersDir = path.join(root, 'packages', 'slo-dashboard', '__tests__', 'business-bdd-handlers');
const telemetryIndex = path.join(root, '.generated', 'telemetry', 'index.json');

function loadJson(p){try{return JSON.parse(fs.readFileSync(p,'utf-8'));}catch{return null;}}
const spec = loadJson(specPath);
if(!spec){console.error('[alignment] Missing spec file', specPath); process.exit(1);} 
const scenarios = spec.scenarios || [];
const handlerFiles = fs.existsSync(handlersDir) ? fs.readdirSync(handlersDir).filter(f=>f.endsWith('.spec.ts')) : [];
const handlerNames = handlerFiles.map(f=>f.replace(/\.spec\.ts$/, ''));
const telemetry = loadJson(telemetryIndex);
const telemetryFeatures = telemetry && Array.isArray(telemetry.features) ? telemetry.features.map(f=>f.feature||f.id||'') : [];

// naive keyword mapping
const keywordToHandler = [
  { kw: 'load', handlers: ['01-load-budgets','02-load-metrics'] },
  { kw: 'compliance', handlers: ['03-compute-compliance'] },
  { kw: 'export', handlers: ['04-serialize-dashboard-state','05-trigger-export-download'] },
  { kw: 'projection', handlers: ['03-compute-compliance'] },
  { kw: 'burn', handlers: ['03-compute-compliance'] }
];

let failures = 0; let warnings = 0; const rows=[];
for(const sc of scenarios){
  const title = sc.title || 'untitled';
  const lower = title.toLowerCase();
  const mappedHandlers = new Set();
  keywordToHandler.forEach(m=>{ if(lower.includes(m.kw)) m.handlers.forEach(h=>mappedHandlers.add(h)); });
  const covered = [...mappedHandlers].every(h=>handlerNames.includes(h));
  if(!covered){
    warnings++; if(STRICT){ failures++; }
  }
  // telemetry requirement (optional until instrumentation added)
  const telemetryPresent = telemetryFeatures.some(tf=>tf.toLowerCase().includes('slo') || tf.toLowerCase().includes('dashboard'));
  if(!telemetryPresent){
    warnings++; if(STRICT){ failures++; }
  }
  rows.push({ scenario: title, handlerCoverage: covered?'OK':'MISSING', telemetry: telemetryPresent?'OK':'NONE' });
}

console.log('\n[shape-bdd-alignment] Scenario Coverage Report');
console.table(rows);
console.log(`[shape-bdd-alignment] Handler spec files: ${handlerFiles.length}`);
if(telemetryFeatures.length){
  console.log(`[shape-bdd-alignment] Telemetry features detected: ${telemetryFeatures.length}`);
}else{
  console.log('[shape-bdd-alignment] No telemetry features referencing slo-dashboard yet');
}
if(failures>0){
  console.error(`[shape-bdd-alignment] FAILURES: ${failures} (warnings=${warnings}) STRICT=${STRICT}`);
  process.exit(1);
} else {
  console.log(`[shape-bdd-alignment] PASS (warnings=${warnings}) STRICT=${STRICT}`);
}
