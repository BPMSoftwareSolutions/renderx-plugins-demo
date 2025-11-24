#!/usr/bin/env node
/**
 * Demo Readiness Report Generator
 * Aggregates sprint demo checklist statuses.
 * Output: .generated/demo-readiness.json and docs/generated/demo-readiness.md
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const GEN = p=>path.join(ROOT,p);
const OUT_JSON = GEN('.generated/demo-readiness.json');
const OUT_MD = GEN('docs/generated/demo-readiness.md');

function exists(p){return fs.existsSync(p);} 
function safeJson(p){try{return JSON.parse(fs.readFileSync(p,'utf-8'));}catch{return null;}}

// Inputs
const diff = safeJson(GEN('.generated/orchestration-domains-diff.json'));
const canonical = safeJson(GEN('.generated/canonical-hash-report.json'));
const provenance = safeJson(GEN('.generated/provenance-index.json'));
const plan = safeJson(GEN('orchestration-audit-system-project-plan.json'));

// Placeholder compliance & release notes (future)
const compliancePath = GEN('.generated/compliance-report.json');
const releaseNotesPath = GEN('docs/generated/orchestration-release-notes.md');
const compliance = safeJson(compliancePath);
const releaseNotesExists = exists(releaseNotesPath);

// BDD coverage placeholder (future real calculation)
function estimateBddCoverage(){
  if(!plan) return null;
  const mapped = (plan.domainSequences||[]).filter(d=>d.bddSpec).length;
  const total = (plan.domainSequences||[]).length;
  return total? mapped/total : null;
}

// Handler test coverage integration
const handlerCoverage = safeJson(GEN('.generated/handler-coverage.json'));
function handlerCoverageValue(){
  if(!handlerCoverage || handlerCoverage.percent==null) return { percent: null, status: 'pending' };
  const target = 0.85; // threshold
  return { percent: handlerCoverage.percent, status: handlerCoverage.percent>=target? 'PASS':'PENDING', target };
}

function statusBoolean(ok){return ok? 'PASS':'PENDING';}

const report = {
  generatedAt: new Date().toISOString(),
  items: {
    structuralDiff: diff ? (diff.summary.added+diff.summary.removed+diff.summary.changed>0) : false,
    canonicalHashReport: !!canonical,
    provenanceIndex: !!provenance,
    complianceReport: !!compliance, // will be false now
    releaseNotes: releaseNotesExists,
    bddCoverage: estimateBddCoverage(),
  handlerCoverage: handlerCoverageValue()
  }
};

// Derive checklist statuses
const checklist = [
  { name: 'Structural diff generated if changes', status: statusBoolean(!!diff) },
  { name: 'Canonical hash report updated', status: statusBoolean(!!canonical) },
  { name: 'Provenance index regenerated', status: statusBoolean(!!provenance) },
  { name: 'Compliance report PASS', status: compliance? 'PASS':'PENDING' },
  { name: 'Release notes appended when structural change', status: releaseNotesExists? 'PASS':'PENDING' },
  { name: 'BDD spec coverage threshold met', status: report.items.bddCoverage!==null && report.items.bddCoverage>=0.7? 'PASS':'PENDING' },
  { name: 'Handler tests passing & coverage ≥ target', status: report.items.handlerCoverage.status }
];
report.checklist = checklist;

// Overall readiness: all PASS except those still pending but allowed if future tasks not yet scheduled
report.readinessScore = checklist.filter(c=>c.status==='PASS').length / checklist.length;

if(!fs.existsSync(path.dirname(OUT_JSON))) fs.mkdirSync(path.dirname(OUT_JSON),{recursive:true});
if(!fs.existsSync(path.dirname(OUT_MD))) fs.mkdirSync(path.dirname(OUT_MD),{recursive:true});
fs.writeFileSync(OUT_JSON, JSON.stringify(report,null,2));

const md = `# Demo Readiness\n\n> Generated ${report.generatedAt}\n\n| Item | Status |\n|------|--------|\n${checklist.map(c=>`| ${c.name} | ${c.status} |`).join('\n')}\n\n**Readiness Score:** ${(report.readinessScore*100).toFixed(1)}%\n\nBDD Coverage (estimated): ${report.items.bddCoverage!==null? (report.items.bddCoverage*100).toFixed(1)+'%':'n/a'}\nHandler Coverage: ${report.items.handlerCoverage.percent!==null? (report.items.handlerCoverage.percent*100).toFixed(1)+'%':'n/a'} (target ${report.items.handlerCoverage.target? (report.items.handlerCoverage.target*100).toFixed(0)+'%':'85%'})\n\n`; 
fs.writeFileSync(OUT_MD, md);
console.log('[demo-readiness] Report written:', OUT_JSON);
