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

function calcProgress(plan){
  const blueprints = plan?.specGeneration?.blueprints || [];
  const statuses = plan?.blueprintStatuses || {};
  if(!blueprints.length) return 0;
  let completed = 0;
  for(const bp of blueprints){
    const st = statuses[bp.slug];
    if(st && st.status === 'completed') completed += 1;
  }
  return Math.round((completed / blueprints.length) * 100);
}

function summarizeBreaches(){
  const telemetryRoot = path.join(ROOT, '.generated', 'telemetry');
  const indexPath = path.join(telemetryRoot, 'index.json');
  try {
    const idx = JSON.parse(fs.readFileSync(indexPath,'utf-8'));
    const result = { totalFeatures: 0, featuresWithBreaches: 0, totalBreaches: 0, perFeature: [] };
    for(const [feature, entry] of Object.entries(idx.features || {})){
      result.totalFeatures += 1;
      let breachCount = 0;
      for(const r of entry.runs){
        try {
          const rec = JSON.parse(fs.readFileSync(path.join(telemetryRoot, r.file),'utf-8'));
          if(rec.budgetStatus === 'breach') breachCount += 1;
        } catch {/* ignore */}
      }
      if(breachCount > 0) result.featuresWithBreaches += 1;
      result.totalBreaches += breachCount;
      result.perFeature.push({ feature, breachCount });
    }
    result.perFeature.sort((a,b)=>b.breachCount - a.breachCount);
    return result;
  } catch { return null; }
}

function render(){
  const plan = loadJson(PLAN_PATH);
  if(!plan){ fs.writeFileSync(OUT_PATH,'# Project Status\n\nPlan file missing.'); return; }
  const lines = [];
  lines.push('# Project Status Report','');
  const ss = plan.statusSummary || {};
  lines.push(`Last Updated: ${ss.lastUpdated || 'n/a'}`,'');
  lines.push('## Overview','');
  const computedProgress = calcProgress(plan);
  lines.push(`Overall Progress: ${pct(computedProgress)}`);
  if(ss.suggestedCommitMessage){
    lines.push('', 'Suggested Commit Message:', '', '```', ss.suggestedCommitMessage, '```');
  }
  if(Array.isArray(ss.notes) && ss.notes.length){
    lines.push('', 'Highlights:', ...ss.notes.map(n=>`- ${n}`));
  }
  if(ss.currentSprint){
    lines.push('', `Current Sprint: ${ss.currentSprint}`);
    lines.push(`Completed Sprints: ${(ss.completedSprints||[]).join(', ') || 'none'}`);
    if(ss.blueprintSprintIntegrity){
      lines.push(`Sprint Integrity: ${ss.blueprintSprintIntegrity}`);
    }
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
  // Breach / anomaly summary
  const breachSummary = summarizeBreaches();
  lines.push('', '## Budget Breach & Anomaly Summary','');
  if(!breachSummary){
    lines.push('_No telemetry artifacts found._');
  } else {
    lines.push(`Total Features: ${breachSummary.totalFeatures}`);
    lines.push(`Features With Breaches: ${breachSummary.featuresWithBreaches}`);
    lines.push(`Total Breaches Across Runs: ${breachSummary.totalBreaches}`);
    if(breachSummary.perFeature.length){
      lines.push('', '| Feature | Breach Runs |','|---------|-------------|');
      for(const pf of breachSummary.perFeature){
        lines.push(`| ${pf.feature} | ${pf.breachCount} |`);
      }
    }
  }
  fs.writeFileSync(OUT_PATH, lines.join('\n')+'\n');
  console.log('[project-report] generated:', OUT_PATH);
}

render();
