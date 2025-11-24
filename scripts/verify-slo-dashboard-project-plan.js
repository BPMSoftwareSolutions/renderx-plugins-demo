#!/usr/bin/env node
/**
 * verify-slo-dashboard-project-plan.js
 * Validates that each task in the slo-dashboard project plan has its artifact present when status != pending.
 * Fails if done task missing artifact or plan hash mismatch (optional).
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = process.cwd();
const planPath = path.join(root,'packages','slo-dashboard','slo-dashboard-project-plan.json');
if(!fs.existsSync(planPath)){ console.error('[plan] Missing project plan file'); process.exit(1); }
const raw = fs.readFileSync(planPath,'utf-8');
let plan; try{ plan = JSON.parse(raw);}catch(e){ console.error('[plan] Invalid JSON', e.message); process.exit(1);} 
const hash = crypto.createHash('sha256').update(raw).digest('hex');
if(plan.hash && plan.hash !== 'will-be-computed' && plan.hash !== hash){
  console.error('[plan] Hash mismatch expected='+plan.hash+' actual='+hash); process.exit(1);
}
let failures = 0; const rows=[];
(plan.tasks||[]).forEach(t=>{
  const artifactPath = path.join(root, t.artifact || '');
  const exists = !!(t.artifact && fs.existsSync(artifactPath));
  if(t.status === 'done' && !exists){ failures++; }
  rows.push({ key: t.key, phase: t.phase, status: t.status, artifact: t.artifact, present: exists?'YES':'NO' });
});
console.log('\n[slo-dashboard-project-plan] Task Artifact Report');
console.table(rows);
if(failures>0){
  console.error(`[slo-dashboard-project-plan] FAILURES: ${failures}`);
  process.exit(1);
} else {
  console.log('[slo-dashboard-project-plan] PASS');
}
