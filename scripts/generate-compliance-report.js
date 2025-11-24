#!/usr/bin/env node
/**
 * Compliance Report Generator
 * Validates MusicalSequence registry fields and linkage to project plan.
 * Output JSON: .generated/compliance-report.json
 * Output Markdown: docs/generated/compliance-report.md
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT,'orchestration-domains.json');
const PLAN = path.join(ROOT,'orchestration-audit-system-project-plan.json');
const OUT_JSON = path.join(ROOT,'.generated','compliance-report.json');
const OUT_MD = path.join(ROOT,'docs','generated','compliance-report.md');

function load(p){return JSON.parse(fs.readFileSync(p,'utf-8'));}
function exists(p){return fs.existsSync(p);} 

function checkRegistry(domains){
  const requiredDomainFields = ['id','name','tempo','key','timeSignature','category'];
  const domainIssues = [];
  for(const d of domains){
    const missing = requiredDomainFields.filter(f=> !(f in d) || d[f]===null || d[f]==='');
    if(missing.length){
      domainIssues.push({id:d.id || '(no-id)', missing});
    }
  }
  return {domainIssues, requiredDomainFields};
}

function checkPlanSequences(plan, domains){
  const domainIds = new Set(domains.map(d=>d.id));
  const coverage = [];
  const missing = [];
  for(const seq of (plan.domainSequences||[])){
    if(domainIds.has(seq.id)) coverage.push(seq.id); else missing.push(seq.id);
  }
  return {total: (plan.domainSequences||[]).length, covered: coverage.length, missing};
}

function main(){
  if(!exists(REGISTRY) || !exists(PLAN)){
    console.error('[compliance] Missing required source files.');
    process.exit(1);
  }
  const registry = load(REGISTRY);
  const plan = load(PLAN);
  const domains = registry.domains || registry; // fallback if structure differs
  const {domainIssues, requiredDomainFields} = checkRegistry(domains);
  const seqCoverage = checkPlanSequences(plan, domains);

  const status = (domainIssues.length===0 && seqCoverage.missing.length===0) ? 'PASS' : 'FAIL';

  const report = {
    generatedAt: new Date().toISOString(),
    status,
    registryDomains: domains.length,
    requiredDomainFields,
    domainIssues,
    planSequences: seqCoverage.total,
    planSequencesCovered: seqCoverage.covered,
    planSequencesMissing: seqCoverage.missing,
    coverageRatio: seqCoverage.total? seqCoverage.covered/seqCoverage.total : null
  };

  fs.mkdirSync(path.dirname(OUT_JSON), {recursive:true});
  fs.mkdirSync(path.dirname(OUT_MD), {recursive:true});
  fs.writeFileSync(OUT_JSON, JSON.stringify(report,null,2));

  const md = `# Compliance Report\n\n> Generated ${report.generatedAt}\n> Status: ${status}\n\n## Registry Summary\n- Domains: ${report.registryDomains}\n- Required Fields: ${report.requiredDomainFields.join(', ')}\n\n## Plan Sequence Coverage\n- Sequences in Plan: ${report.planSequences}\n- Covered in Registry: ${report.planSequencesCovered}\n- Missing: ${report.planSequencesMissing.length? report.planSequencesMissing.join(', '): 'None'}\n- Coverage Ratio: ${report.coverageRatio!==null? (report.coverageRatio*100).toFixed(1)+'%':'n/a'}\n\n## Domain Issues\n${report.domainIssues.length? report.domainIssues.map(i=>`- ${i.id}: missing [${i.missing.join(', ')}]`).join('\n'):'None'}\n\n*This file is generated. Do not edit.*\n`;
  fs.writeFileSync(OUT_MD, md);
  console.log('[compliance] Report written:', OUT_JSON);
}

main();
