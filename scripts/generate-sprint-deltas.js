#!/usr/bin/env node
/**
 * Sprint Deltas Generator
 * Compares metrics between consecutive sprints and outputs docs/generated/orchestration-sprint-deltas.md
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT,'orchestration-audit-system-project-plan.json');
const OUT_FILE = path.join(ROOT,'docs','generated','orchestration-sprint-deltas.md');

function load(p){return JSON.parse(fs.readFileSync(p,'utf-8'));}
function ensureDir(p){if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});}

function delta(a,b){ if(a==null||b==null) return null; return b - a; }

function render(plan){
  const sprints = plan.sprints||[];
  let md = '# Sprint Deltas\n\n> DO NOT EDIT. Generated from plan metrics.\n';
  md += '\n| From -> To | Metric | Prev | Next | Δ |\n|------------|--------|------|------|----|';
  for(let i=0;i<sprints.length-1;i++){
    const prev = sprints[i];
    const next = sprints[i+1];
    const keys = new Set([...(prev.metrics?Object.keys(prev.metrics):[]),...(next.metrics?Object.keys(next.metrics):[])]);
    for(const k of keys){
      const prevVal = prev.metrics? prev.metrics[k]: null;
      const nextVal = next.metrics? next.metrics[k]: null;
      const d = delta(prevVal,nextVal);
      md += `\n| ${prev.id} -> ${next.id} | ${k} | ${prevVal??'—'} | ${nextVal??'—'} | ${d===null?'—':d} |`;
    }
  }
  return md+'\n';
}

function main(){
  if(!fs.existsSync(PLAN_FILE)){console.error('[sprint-deltas] Plan missing');process.exit(1);}  
  const plan = load(PLAN_FILE);
  ensureDir(path.dirname(OUT_FILE));
  const md = render(plan);
  fs.writeFileSync(OUT_FILE, md);
  console.log('[sprint-deltas] Wrote', OUT_FILE);
}

main();
