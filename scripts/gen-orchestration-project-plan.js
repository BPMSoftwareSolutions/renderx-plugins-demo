#!/usr/bin/env node
/**
 * Generates markdown reflection from orchestration-audit-system-project-plan.json
 * DO NOT EDIT the generated markdown. JSON is authoritative.
 */
import fs from 'fs';
import path from 'path';

function readJson(p){return JSON.parse(fs.readFileSync(p,'utf-8'));}

const root = process.cwd();
const jsonFile = path.join(root,'orchestration-audit-system-project-plan.json');
if(!fs.existsSync(jsonFile)){
  console.error('[plan-generator] Missing JSON source:', jsonFile);
  process.exit(1);
}
const plan = readJson(jsonFile);

const outDir = path.join(root,'docs','generated');
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
const outFile = path.join(outDir,'orchestration-audit-system-project-plan.md');

function fmtList(arr){return arr && arr.length ? arr.join(', ') : '—';}

function sprintTable(sprints){
  const headers = ['Sprint','Theme','Deliverables','Demo Criteria','Status'];
  const rows = sprints.map(s => [
    s.id,
    s.theme || s.name,
    fmtList(s.deliverables),
    fmtList(s.demoCriteria),
    s.status
  ]);
  const all = [headers, ...rows];
  const colWidths = headers.map((_,i)=> Math.max(...all.map(r=>String(r[i]).length)) );
  function pad(v,i){const w=colWidths[i];return String(v).padEnd(w,' ');}  
  const sep = '|' + colWidths.map(w=>'-'.repeat(w)).join('|') + '|';
  const lines = [];
  lines.push('|' + headers.map(pad).join('|') + '|');
  lines.push(sep);
  for(const r of rows){lines.push('|' + r.map(pad).join('|') + '|');}
  return lines.join('\n');
}

function sequencesSection(sequences){
  if(!sequences || !sequences.length) return 'No domain sequences declared.';
  const lines = ['| Sequence ID | BDD Spec | Coverage Target | Sprint Intro |','|-------------|----------|-----------------|-------------|'];
  for(const seq of sequences){
    lines.push(`| ${seq.id} | ${seq.bddSpec || '—'} | ${(seq.coverageTarget ?? '—')} | ${seq.sprintIntro ?? '—'} |`);
  }
  return lines.join('\n');
}

const content = `# Orchestration Audit System Project Plan\n\n> DO NOT EDIT. Generated from JSON: orchestration-audit-system-project-plan.json\n> Generated At: ${new Date().toISOString()}\n> JSON Version: ${plan.version}\n\n## Vision\n${plan.vision}\n\n## Principles\n${plan.principles.map(p=>`- ${p}`).join('\n')}\n\n## Sprints\n${sprintTable(plan.sprints)}\n\n## Domain Sequences / BDD Mapping\n${sequencesSection(plan.domainSequences)}\n\n## Demo Checklist\n${plan.demoChecklist.map(i=>`- [ ] ${i}`).join('\n')}\n\n## Backlog\n${plan.backlog.map(b=>`- ${b}`).join('\n')}\n\n## Integrity Strategy\n- Hash Strategy: ${plan.integrity?.hashStrategy || 'n/a'}\n- Planned: ${plan.integrity?.planned ? 'yes':'no'}\n\n## Link Rules\n${Object.entries(plan.linkRules || {}).map(([k,v])=>`- ${k}: ${v}`).join('\n')}\n\n*This file is regenerated on pre:manifests.*\n`;

fs.writeFileSync(outFile, content, 'utf-8');
console.log('[plan-generator] Wrote', outFile);
