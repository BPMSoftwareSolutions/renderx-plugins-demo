#!/usr/bin/env node
/**
 * BDD Feature Stub Generator
 * Creates missing .feature files for each domain sequence defined in plan.domainSequences.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT,'orchestration-audit-system-project-plan.json');

function load(p){ try { return JSON.parse(fs.readFileSync(p,'utf-8')); } catch { return null; } }
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }

function stub(id){
  return `# ${id} feature\n# AUTO-GENERATED STUB. Replace with real scenarios.\n\nFeature: ${id.replace(/-/g,' ')}\n  In order to audit orchestration domain '${id}'\n  As a governance observer\n  I want baseline BDD coverage for '${id}'\n\n  Scenario: Baseline coverage placeholder for ${id}\n    Given the orchestration audit system is initialized\n    When the '${id}' sequence executes baseline flow\n    Then an audit artifact is produced for '${id}'\n`;
}

function main(){
  const plan = load(PLAN_FILE);
  if(!plan){ console.error('[bdd-feature-stubs] Plan file missing or unreadable'); process.exit(1); }
  const sequences = plan.domainSequences || [];
  let created = 0;
  for(const seq of sequences){
    if(!seq.bddSpec) continue;
    const filePath = path.join(ROOT, seq.bddSpec);
    ensureDir(path.dirname(filePath));
    if(!fs.existsSync(filePath)){
      fs.writeFileSync(filePath, stub(seq.id));
      created++; console.log('[bdd-feature-stubs] Created stub', filePath);
    }
  }
  if(created===0) console.log('[bdd-feature-stubs] No stubs needed');
  else console.log(`[bdd-feature-stubs] Created ${created} feature stub(s)`);
}

main();
