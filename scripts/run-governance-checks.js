#!/usr/bin/env node
/**
 * run-governance-checks.js
 * Orchestrates structural governance validation.
 */
import { spawnSync } from 'child_process';
import path from 'path';

const ROOT = process.cwd();

const STEPS = [
  { name: 'structure-report', cmd: ['node', 'scripts/gen-structure-report.js'] },
  { name: 'import-policy', cmd: ['node', 'scripts/import-policy-check.js'] },
  { name: 'plan-integrity', cmd: ['node', 'scripts/validate-plan-integrity.js'] },
  { name: 'doc-provenance', cmd: ['node', 'scripts/verify-doc-provenance.js'] },
  { name: 'tools-registry', cmd: ['node', 'scripts/validate-tools-registry.js'] }
];

function runStep(step){
  const start = Date.now();
  const r = spawnSync(step.cmd[0], step.cmd.slice(1), { stdio: 'inherit' });
  return { name: step.name, code: r.status ?? 0, ms: Date.now()-start };
}

function summarize(results){
  console.log('\n[governance] Summary:');
  for(const r of results){
    console.log(`- ${r.name}: ${r.code === 0 ? 'PASS' : 'FAIL'} (${r.ms}ms)`);
  }
  const failed = results.filter(r=>r.code!==0);
  if(failed.length){
    console.error(`[governance] FAILED (${failed.length} steps)`);
    process.exit(10);
  } else {
    console.log('[governance] ALL PASS');
  }
}

function main(){
  const results = [];
  for(const s of STEPS){ results.push(runStep(s)); }
  summarize(results);
}

if (process.argv[1].endsWith('run-governance-checks.js')) main();
