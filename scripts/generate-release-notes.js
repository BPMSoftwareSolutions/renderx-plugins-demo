#!/usr/bin/env node
/**
 * Release Notes Generator
 * Appends structured entry to docs/generated/orchestration-release-notes.md
 * Trigger conditions:
 *  - Structural diff has any added/removed/changed domains
 *  - Compliance status changed vs last entry
 *  - Plan JSON version changed
 *  - Canonical hash driftFalsePositive changed to false (stability achieved)
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DIFF = path.join(ROOT,'.generated','orchestration-domains-diff.json');
const COMPLIANCE = path.join(ROOT,'.generated','compliance-report.json');
const PLAN = path.join(ROOT,'orchestration-audit-system-project-plan.json');
const CANONICAL = path.join(ROOT,'.generated','canonical-hash-report.json');
const NOTES = path.join(ROOT,'docs','generated','orchestration-release-notes.md');
const SPRINT_INTEGRITY_DIR = path.join(ROOT,'.generated','sprint-integrity');

function load(p){try{return JSON.parse(fs.readFileSync(p,'utf-8'));}catch{return null;}}
function ensureDir(p){if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});}

const diff = load(DIFF);
const compliance = load(COMPLIANCE);
const plan = load(PLAN);
const canonical = load(CANONICAL);

ensureDir(path.dirname(NOTES));
let existing = '';
let previousEntries = [];
if(fs.existsSync(NOTES)){
  existing = fs.readFileSync(NOTES,'utf-8');
  const blocks = existing.split('\n## Release');
  // crude parse: count entries
  previousEntries = blocks.length>1? blocks.slice(1) : [];
}

function lastField(regex){
  const m = existing.match(regex);
  return m? m[m.length-1] : null;
}

const lastComplianceStatusMatch = existing.match(/Compliance Status: (PASS|FAIL)/g);
const lastComplianceStatus = lastComplianceStatusMatch? lastComplianceStatusMatch[lastComplianceStatusMatch.length-1].split(': ')[1] : null;
const lastPlanVersionMatch = existing.match(/Plan Version: ([0-9]+\.[0-9]+\.[0-9]+)/g);
const lastPlanVersion = lastPlanVersionMatch? lastPlanVersionMatch[lastPlanVersionMatch.length-1].split(': ')[1] : null;

// Determine triggers
const diffChange = diff && (diff.summary.added>0 || diff.summary.removed>0 || diff.summary.changed>0);
const complianceChanged = compliance && compliance.status !== lastComplianceStatus;
const planVersionChanged = plan && plan.version && plan.version !== lastPlanVersion;
let canonicalStabilityAchieved = false;
if(canonical){
  const treeEntry = canonical.artifacts?.find(a=>a.file==='.generated/context-tree-orchestration-audit-session.json');
  canonicalStabilityAchieved = treeEntry? treeEntry.driftFalsePositive===false : false;
}

const shouldEmit = diffChange || complianceChanged || planVersionChanged || canonicalStabilityAchieved;

if(!shouldEmit){
  console.log('[release-notes] No triggering changes; skipping append.');
  process.exit(0);
}

const ts = new Date().toISOString();
// Collect sprint integrity hashes
let integrityLines = [];
if(fs.existsSync(SPRINT_INTEGRITY_DIR)){
  const files = fs.readdirSync(SPRINT_INTEGRITY_DIR).filter(f=>f.endsWith('.json'));
  for(const f of files){
    try{
      const data = JSON.parse(fs.readFileSync(path.join(SPRINT_INTEGRITY_DIR,f),'utf-8'));
      if(data && data.hash){
        integrityLines.push(`  - Sprint ${data.sprint}: ${data.hash}`);
      }
    }catch{ /* ignore */ }
  }
}
const integrityBlock = integrityLines.length? ['- Sprint Integrity Hashes:', ...integrityLines].join('\n') : '- Sprint Integrity Hashes: none';

const entry = `\n## Release ${ts}\n\n### Summary\n- Structural Diff: ${diffChange? 'CHANGE':'NO CHANGE'} (added=${diff?.summary.added||0}, removed=${diff?.summary.removed||0}, changed=${diff?.summary.changed||0})\n- Compliance Status: ${compliance? compliance.status:'n/a'}${complianceChanged? ' (changed)':''}\n- Plan Version: ${plan?.version||'n/a'}${planVersionChanged? ' (changed)':''}\n- Canonical Stability: ${canonicalStabilityAchieved? 'achieved':'pending'}\n\n### Details\n**Added Domains:** ${diff?.addedDomains?.length? diff.addedDomains.slice(0,10).join(', ')+(diff.addedDomains.length>10?' …':''):'None'}\n\n### Integrity\n- Canonical Hash Report Present: ${!!canonical}\n${integrityBlock}\n\n### Provenance\n- Index Present: ${fs.existsSync(path.join(ROOT,'.generated','provenance-index.json'))}\n\n### Demo Readiness (Snapshot)\n${(() => { try { const dr = JSON.parse(fs.readFileSync(path.join(ROOT,'.generated','demo-readiness.json'),'utf-8')); return `Readiness Score: ${(dr.readinessScore*100).toFixed(1)}%`; } catch { return 'Readiness Score: n/a'; } })()}\n\n*Automated entry. Do not edit.*\n`;

if(!existing){
  existing = '# Orchestration Release Notes\n\n> DO NOT EDIT. Generated automatically from diff/compliance/plan/canonical reports.\n';
}

fs.writeFileSync(NOTES, existing + entry);
console.log('[release-notes] Appended new release entry.');
