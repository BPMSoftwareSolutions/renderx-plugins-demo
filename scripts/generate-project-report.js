#!/usr/bin/env node
/**
 * Generate PROJECT_STATUS_REPORT.md from SHAPE_EVOLUTION_PLAN.json
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, 'SHAPE_EVOLUTION_PLAN.json');
const OUT_PATH = path.join(ROOT, 'PROJECT_STATUS_REPORT.md');

function loadJson(p){ try { return JSON.parse(fs.readFileSync(p,'utf-8')); } catch(e){ return null; } }
function pct(v){ return typeof v === 'number' ? `${v}%` : 'n/a'; }

function render(){
  const plan = loadJson(PLAN_PATH);
  if(!plan){ fs.writeFileSync(OUT_PATH,'# Project Status\n\nPlan file missing.'); return; }
  const lines = [];
  lines.push('# Project Status Report','');
  const ss = plan.statusSummary || {};
  lines.push(`Last Updated: ${ss.lastUpdated || 'n/a'}`,'');
  lines.push('## Overview','');
  lines.push(`Overall Progress: ${pct(ss.overallProgressPercent)}`);
  if(ss.suggestedCommitMessage){
    lines.push('', 'Suggested Commit Message:', '', '```', ss.suggestedCommitMessage, '```');
  }
  if(Array.isArray(ss.notes) && ss.notes.length){
    lines.push('', 'Highlights:', ...ss.notes.map(n=>`- ${n}`));
  }
  // Blueprint statuses
  lines.push('', '## Blueprint Statuses','');
  const bps = plan.blueprintStatuses || {}; 
  lines.push('| Blueprint | Status | Completed At |','|-----------|--------|--------------|');
  for(const [slug, data] of Object.entries(bps)){
    lines.push(`| ${slug} | ${data.status || 'n/a'} | ${data.completionTs || 'n/a'} |`);
  }
  // Improvements backlog
  const backlog = plan.improvementsBacklog || [];
  lines.push('', '## Improvements Backlog','');
  if(backlog.length){
    lines.push('| ID | Title | Priority | Description |','|----|-------|----------|-------------|');
    for(const item of backlog){
      lines.push(`| ${item.id} | ${item.title} | ${item.priority} | ${(item.desc||'').replace(/\|/g,'/')} |`);
    }
  } else {
    lines.push('_No backlog items._');
  }
  // Sprint progress summary
  if(Array.isArray(plan.sprints)){
    lines.push('', '## Sprint Progress','');
    for(const sprint of plan.sprints){
      lines.push(`### ${sprint.id}: ${sprint.name}`);
      lines.push('* Objectives:');
      for(const o of sprint.objectives) lines.push(`  - ${o}`);
      lines.push('* Acceptance Criteria:');
      for(const ac of sprint.acceptanceCriteria) lines.push(`  - ${ac}`);
      lines.push('');
    }
  }
  fs.writeFileSync(OUT_PATH, lines.join('\n')+'\n');
  console.log('[project-report] generated:', OUT_PATH);
}

render();
