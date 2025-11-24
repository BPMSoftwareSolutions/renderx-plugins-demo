#!/usr/bin/env node
/**
 * Sprint Integrity Snapshots
 * Writes canonical hash snapshots for completed sprints to .generated/sprint-integrity/sprint-<id>.json
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT,'orchestration-audit-system-project-plan.json');
const OUT_DIR = path.join(ROOT,'.generated','sprint-integrity');

function load(p){return JSON.parse(fs.readFileSync(p,'utf-8'));}
function ensureDir(p){if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});}
function stable(obj){return JSON.stringify(sort(obj));}
function sort(v){ if(Array.isArray(v)) return v.map(sort); if(v && typeof v==='object'){ return Object.keys(v).sort().reduce((a,k)=>{a[k]=sort(v[k]);return a;},{});} return v; }
function sha256(s){return crypto.createHash('sha256').update(s).digest('hex');}
function canonical(obj){
  if(Array.isArray(obj)) return obj.map(canonical);
  if(obj && typeof obj==='object'){
    const out={};
    for(const k of Object.keys(obj)){
      if(['integrity','updatedAt','generatedAt','timestamp','lastUpdated'].includes(k)) continue;
      out[k]=canonical(obj[k]);
    }
    return out;
  }
  return obj;
}

function main(){
  if(!fs.existsSync(PLAN_FILE)){console.error('[sprint-integrity] Plan missing');process.exit(1);}  
  const plan = load(PLAN_FILE);
  ensureDir(OUT_DIR);
  for(const sprint of plan.sprints||[]){
    if(sprint.status!=='complete') continue;
    const snapFile = path.join(OUT_DIR,`sprint-${sprint.id}.json`);
    if(fs.existsSync(snapFile)) continue; // don't overwrite
    const c = canonical(sprint);
    const hash = sha256(stable(c));
    const snapshot = { sprint: sprint.id, hash, generatedAt: new Date().toISOString(), fields: Object.keys(c)};
    fs.writeFileSync(snapFile, JSON.stringify(snapshot,null,2));
    console.log('[sprint-integrity] Snapshot created for sprint', sprint.id);
  }
}

main();
