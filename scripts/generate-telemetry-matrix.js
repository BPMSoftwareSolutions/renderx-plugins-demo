#!/usr/bin/env node
/**
 * Telemetry Matrix Generator
 * Builds a matrix of required telemetry shapes per sprint and current signature coverage.
 * Outputs JSON + Markdown for governance review.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN = path.join(ROOT,'orchestration-audit-system-project-plan.json');
const OUT_JSON = path.join(ROOT,'.generated','telemetry-matrix.json');
const OUT_MD = path.join(ROOT,'docs','generated','orchestration-telemetry-matrix.md');

function load(p){ try { return JSON.parse(fs.readFileSync(p,'utf-8')); } catch { return null; } }
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }

function buildMatrix(plan){
  const rows = [];
  for(const sprint of plan.sprints){
    const tel = sprint.telemetry || {};
    rows.push({
      sprint: sprint.id,
      name: sprint.name,
      status: sprint.status,
      requiredShapes: tel.requiredShapes || [],
      baselineDefined: !!tel.baselineDefined,
      signatures: tel.signatures || [],
      coveragePct: (tel.signatures && tel.requiredShapes && tel.requiredShapes.length)
        ? (Math.min(tel.signatures.length, tel.requiredShapes.length) / tel.requiredShapes.length) : 0,
      notes: tel.notes || ''
    });
  }
  return rows;
}

function renderMarkdown(rows){
  let md = '# Telemetry Matrix\n\n> DO NOT EDIT. Generated from orchestration-audit-system-project-plan.json\n';
  md += '\n| Sprint | Name | Status | Baseline | Shapes | Signatures Count | Coverage % | Notes |\n';
  md += '|--------|------|--------|----------|--------|------------------|-----------|-------|\n';
  for(const r of rows){
    md += `| ${r.sprint} | ${r.name} | ${r.status} | ${r.baselineDefined?'YES':'NO'} | ${r.requiredShapes.join(',')} | ${r.signatures.length} | ${(r.coveragePct*100).toFixed(1)}% | ${r.notes.replace(/\|/g,'/')} |\n`;
  }
  return md;
}

function main(){
  const plan = load(PLAN);
  if(!plan){ console.error('[telemetry-matrix] Plan missing'); process.exit(1); }
  const rows = buildMatrix(plan);
  ensureDir(path.dirname(OUT_JSON));
  ensureDir(path.dirname(OUT_MD));
  fs.writeFileSync(OUT_JSON, JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));
  fs.writeFileSync(OUT_MD, renderMarkdown(rows));
  console.log('[telemetry-matrix] Wrote matrix artifacts');
}

main();
