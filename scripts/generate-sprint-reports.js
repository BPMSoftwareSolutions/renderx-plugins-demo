#!/usr/bin/env node
/**
 * Sprint Reports Generator
 * Produces docs/generated/orchestration-sprint-reports.md with detailed per-sprint breakdown.
 * Project summary constrained to currentSprint (no drift beyond open sprint).
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT,'orchestration-audit-system-project-plan.json');
const OUT_FILE = path.join(ROOT,'docs','generated','orchestration-sprint-reports.md');

function load(p){return JSON.parse(fs.readFileSync(p,'utf-8'));}
function ensureDir(p){if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});}

function pct(part,total){ if(!total) return '0%'; return ((part/total)*100).toFixed(1)+'%'; }

function render(plan){
  const current = plan.currentSprint;
  const sprints = plan.sprints || [];
  const currentIdx = sprints.findIndex(s=>s.id===current);
  const completed = sprints.filter(s=>s.status==='complete').map(s=>s.id);

  let md = '# Orchestration Sprint Reports\n\n> DO NOT EDIT. Generated from orchestration-audit-system-project-plan.json\n';
  md += `\n## Project Summary (Up To Sprint ${current})\n`;
  md += `Version: ${plan.version} | Updated: ${plan.updatedAt} | Current Sprint: ${current}\n`;
  md += `Completed Sprints: ${completed.length? completed.join(', '): 'none'}\n`;
  // Velocity summary (actual vs target for sprints up to current)
  const considered = sprints.filter(s=>parseInt(s.id,10) <= parseInt(current,10));
  let totalTarget=0,totalActual=0; considered.forEach(s=>{totalTarget += (s.velocityTarget||0); totalActual += (s.velocityActual|| (s.status==='complete'? (s.deliverables||[]).length:0));});
  md += `Velocity (aggregate actual/target): ${totalActual}/${totalTarget} (${pct(totalActual,totalTarget)})\n`;

  md += '\n---\n';
  for(const sprint of sprints){
    md += `\n### Sprint ${sprint.id}: ${sprint.name}\n`;
    md += `Status: ${sprint.status} | Theme: ${sprint.theme}\n`;
    if(sprint.startDate) md += `Dates: ${sprint.startDate} → ${sprint.endDate || 'TBD'}\n`;
    if(sprint.velocityTarget) md += `Velocity Target: ${sprint.velocityTarget} | Actual: ${sprint.velocityActual ?? 'n/a'}\n`;
    if(sprint.metrics) md += 'Metrics: ' + Object.entries(sprint.metrics).map(([k,v])=>`${k}=${v}`).join(', ') + '\n';
  if(sprint.completionCommitSuggestion) md += `Commit Suggestion: ${sprint.completionCommitSuggestion}\n`;
    if(sprint.telemetry){
      md += 'Telemetry:\n';
      md += `- Baseline Defined: ${sprint.telemetry.baselineDefined? 'YES':'NO'}\n`;
      md += `- Required Shapes: ${(sprint.telemetry.requiredShapes||[]).join(', ') || 'none'}\n`;
      md += `- Signatures: ${(sprint.telemetry.signatures||[]).join(', ') || 'none'}\n`;
      if(sprint.telemetry.notes) md += `- Notes: ${sprint.telemetry.notes}\n`;
    }
    if(sprint.objectives){ md += '\nObjectives:\n' + sprint.objectives.map(o=>`- ${o}`).join('\n') + '\n'; }
    if(sprint.acceptanceCriteria){ md += '\nAcceptance Criteria:\n' + sprint.acceptanceCriteria.map(a=>`- ${a}`).join('\n') + '\n'; }
    if(sprint.acceptanceCriteriaStatus){
      md += '\nAcceptance Criteria Status:\n' + sprint.acceptanceCriteriaStatus.map(s=>`- ${s.criteria}: ${s.status}`).join('\n') + '\n';
    }
    md += '\nDeliverables:\n' + (sprint.deliverables||[]).map(d=>`- ${d}`).join('\n') + '\n';
    if(sprint.risks){ md += '\nRisks:\n' + (sprint.risks.length? sprint.risks.map(r=>`- ${r}`).join('\n'):'- None') + '\n'; }
    if(sprint.blockers){ md += '\nBlockers:\n' + (sprint.blockers.length? sprint.blockers.map(b=>`- ${b}`).join('\n'):'- None') + '\n'; }
    if(sprint.qualityGates){ md += '\nQuality Gates:\n' + Object.entries(sprint.qualityGates).map(([k,v])=>`- ${k}: ${v}`).join('\n') + '\n'; }
    if(parseInt(sprint.id,10) > parseInt(current,10)){
      md += '\n(Upcoming sprint - details subject to change)\n';
    }
    md += '\n---\n';
  }
  return md.trim()+ '\n';
}

function main(){
  if(!fs.existsSync(PLAN_FILE)){
    console.error('[sprint-reports] Plan file missing');
    process.exit(1);
  }
  const plan = load(PLAN_FILE);
  ensureDir(path.dirname(OUT_FILE));
  const md = render(plan);
  fs.writeFileSync(OUT_FILE, md);
  console.log('[sprint-reports] Wrote', OUT_FILE);
}

main();
