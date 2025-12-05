#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function inferDomainIdFromPath(file) {
  const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
  if (rel.startsWith('packages/orchestration')) return 'renderx-web-orchestration';
  const m = rel.match(/^packages\/([^/]+)\//);
  if (m) return m[1];
  const m2 = rel.match(/^json-sequences\/([^/]+)\//);
  if (m2) return m2[1];
  return 'renderx-web-orchestration';
}

function normalizeAcceptanceCriteriaStructured(item) {
  if (!item || typeof item !== 'object') return item;
  const normalize = (v) => {
    if (v == null) return undefined;
    if (Array.isArray(v)) return v.map(x => typeof x === 'string' ? x : String(x));
    if (typeof v === 'string') return [v];
    if (typeof v === 'object') {
      try {
        const vals = [];
        for (const kk of Object.keys(v)) {
          const vv = v[kk];
          if (vv == null) continue;
          if (Array.isArray(vv)) vals.push(...vv.map(x => String(x)));
          else vals.push(String(vv));
        }
        return vals.length ? vals : undefined;
      } catch {
        return [String(v)];
      }
    }
    return [String(v)];
  };
  const out = {};
  ['given','when','then','and'].forEach(k=>{ const nv = normalize(item[k]); if(nv !== undefined) out[k]=nv; });
  return out;
}

function stripLeadingAsA(phrase){
  if(!phrase) return '';
  // remove 'As a X, I need ' or 'As a X, I want '
  return phrase.replace(/^\s*As a [^,]+,\s*(I need|I want)\s+/i,'').trim();
}

function transformUserStory(us, fallbackPersona){
  if(!us) return { persona: fallbackPersona, goal: '', benefit: '' };
  if(typeof us === 'string'){
    const stripped = stripLeadingAsA(us);
    // try to split by ' so ' or ', so '
    let goal = stripped; let benefit = '';
    const idx = stripped.indexOf(', so ');
    if(idx !== -1){ goal = stripped.slice(0, idx).trim(); benefit = stripped.slice(idx+5).trim(); }
    else { const i2 = stripped.indexOf(' so '); if(i2 !== -1){ goal = stripped.slice(0,i2).trim(); benefit = stripped.slice(i2+4).trim(); } }
    return { persona: fallbackPersona, goal, benefit };
  }
  const persona = (us.persona||fallbackPersona).toLowerCase();
  const rawGoal = us.goal || '';
  const stripped = stripLeadingAsA(rawGoal);
  let goal = stripped; let benefit = us.benefit || '';
  const idx = stripped.indexOf(', so ');
  if(idx !== -1){ goal = stripped.slice(0, idx).trim(); if(!benefit) benefit = stripped.slice(idx+5).trim(); }
  else { const i2 = stripped.indexOf(' so '); if(i2 !== -1){ goal = stripped.slice(0,i2).trim(); if(!benefit) benefit = stripped.slice(i2+4).trim(); } }
  return { persona, goal, benefit };
}

async function run(){
  const argv = process.argv.slice(2);
  if(argv.length===0){ console.error('Usage: node scripts/fix-one.js <relative-json-path>'); process.exit(2); }
  const file = path.resolve(repoRoot, argv[0]);
  try{
    const raw = await fs.readFile(file,'utf8');
    let json = JSON.parse(raw);
    // allow wrapped
    const wrapped = Boolean(json.musicalSequence && typeof json.musicalSequence === 'object');
    let root = wrapped ? json.musicalSequence : json;

    if(!root.domainId) root.domainId = inferDomainIdFromPath(file);
    if(typeof root.userStory === 'string') root.userStory = transformUserStory(root.userStory, (root.persona||'product owner').toLowerCase());
    if(Array.isArray(root.movements)){
      for(const mv of root.movements){
        if(typeof mv.userStory === 'string') mv.userStory = transformUserStory(mv.userStory, (mv.persona||root.persona||'system operator').toLowerCase());
        if(Array.isArray(mv.beats)){
          for(const beat of mv.beats){
            if(typeof beat.userStory === 'string') beat.userStory = transformUserStory(beat.userStory, (beat.persona||mv.persona||root.persona||'developer').toLowerCase());
            // move acceptanceCriteriaStructured -> acceptanceCriteria
            if(beat.acceptanceCriteriaStructured && !beat.acceptanceCriteria){
              // normalize entries
              beat.acceptanceCriteria = beat.acceptanceCriteriaStructured.map(normalizeAcceptanceCriteriaStructured);
              delete beat.acceptanceCriteriaStructured;
            }
          }
        }
      }
    }
    // write back
    if(wrapped) json.musicalSequence = root; else json = root;
    await fs.writeFile(file, JSON.stringify(json, null, 2)+'\n', 'utf8');
    console.log('fixed', argv[0]);
  }catch(err){ console.error('failed', err); process.exit(1); }
}
run();
