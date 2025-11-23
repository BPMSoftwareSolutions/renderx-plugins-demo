#!/usr/bin/env node
// verify-demo-spec.js
// Ensures demo process spec exists and contains required fields before demo/test runs.
import fs from 'fs';
import path from 'path';

const SPEC_PATH = path.join('packages','self-healing','docs','DEMO_PROCESS_SPEC.json');
function fail(reason, details) {
  console.error('\n[DEMO-SPEC-ENFORCEMENT] FAIL');
  console.error('Reason:', reason);
  if (details) console.error('Details:', details);
  process.exit(1);
}

if (!fs.existsSync(SPEC_PATH)) fail('Demo spec missing', SPEC_PATH);
let raw; try { raw = fs.readFileSync(SPEC_PATH,'utf8'); } catch(e){ fail('Read error', e.message);} 
let spec; try { spec = JSON.parse(raw); } catch(e){ fail('JSON parse error', e.message); }

const requiredRoot = ['version','iteration','objectives','resources','steps','andonTriggers'];
for (const key of requiredRoot) {
  if (!(key in spec)) fail('Required field missing', key);
  if (Array.isArray(spec[key]) && spec[key].length === 0) fail('Required array empty', key);
}

// Basic objectives sanity
if (spec.objectives.length < 2) fail('Insufficient objectives (need >=2)', spec.objectives);

// Steps must be ordered sequentially starting at 1
const orders = spec.steps.map(s => s.order).sort((a,b)=>a-b);
for (let i=0;i<orders.length;i++){ if (orders[i] !== i+1) fail('Step order sequence broken', orders); }

console.log('[DEMO-SPEC-ENFORCEMENT] PASS');
console.log('Demo spec path:', SPEC_PATH);
console.log('Objectives:', spec.objectives.length);
console.log('Steps:', spec.steps.length);