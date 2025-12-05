#!/usr/bin/env node
// Normalize userStory fields across discovered MusicalSequence JSON files
// - Converts string userStory -> { persona, goal, benefit }
// - Normalizes persona to lowercase (e.g., "design systems engineer")
// - Splits goal/benefit using ", so " or " so " heuristics

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_SEARCH_ROOTS = [
  path.join(repoRoot, 'packages', 'orchestration', 'json-sequences'),
  path.join(repoRoot, 'json-sequences'),
  path.join(repoRoot, 'docs', 'samples'),
  path.join(repoRoot, 'packages')
];

async function pathExists(p){ try{ await fs.access(p); return true;}catch{return false;} }

async function collectJsonFilesFromDir(dir){
  const files = [];
  async function walk(d){
    let entries; try{ entries = await fs.readdir(d, { withFileTypes:true }); }catch{return;}
    for(const ent of entries){
      if(ent.name.startsWith('.')) continue;
      const full = path.join(d, ent.name);
      if(ent.isDirectory()) await walk(full);
      else if(ent.isFile() && ent.name.toLowerCase().endsWith('.json')) files.push(full);
    }
  }
  await walk(dir);
  return files;
}

function normalizePersona(p){
  if(!p) return 'design systems engineer';
  return String(p).trim().toLowerCase();
}

function stripLeadingAsA(phrase){
  if(!phrase) return phrase || '';
  const re = /^\s*As a [^,]+,\s*I need\s+/i;
  return phrase.replace(re, '').trim();
}

function splitGoalAndBenefit(text){
  if(!text) return {goal:'', benefit:''};
  const idx = text.indexOf(', so ');
  if(idx !== -1){
    const left = text.slice(0, idx).trim();
    const right = text.slice(idx+5).trim();
    return { goal:left.replace(/[.\n]+$/,''), benefit:right.replace(/[.\n]+$/,'') };
  }
  const idx2 = text.indexOf(' so ');
  if(idx2 !== -1){
    const left = text.slice(0, idx2).trim();
    const right = text.slice(idx2+4).trim();
    return { goal:left.replace(/[.\n]+$/,''), benefit:right.replace(/[.\n]+$/,'') };
  }
  return { goal:text.replace(/[.\n]+$/,''), benefit: '' };
}

function transformUserStory(us, fallbackPersona){
  if(!us) return { persona: fallbackPersona, goal: '', benefit: '' };
  if(typeof us === 'string'){
    const stripped = stripLeadingAsA(us);
    const { goal, benefit } = splitGoalAndBenefit(stripped);
    return { persona: fallbackPersona, goal, benefit };
  }
  // object
  const persona = normalizePersona(us.persona || us.Persona || fallbackPersona);
  const rawGoal = us.goal || '';
  const stripped = stripLeadingAsA(rawGoal);
  const { goal, benefit } = splitGoalAndBenefit(stripped);
  const finalBenefit = (us.benefit || benefit || '').replace(/[.\n]+$/,'');
  return { persona, goal, benefit: finalBenefit };
}

async function main(){
  const fileSet = new Set();
  for(const root of DEFAULT_SEARCH_ROOTS){
    if(!(await pathExists(root))) continue;
    if(root.endsWith(path.join('packages'))){
      // discover packages/*/json-sequences
      let entries; try{ entries = await fs.readdir(root, { withFileTypes:true }); }catch{ continue; }
      for(const ent of entries){ if(!ent.isDirectory()) continue; const cand = path.join(root, ent.name, 'json-sequences'); if(await pathExists(cand)){
        const files = await collectJsonFilesFromDir(cand); files.forEach(f=>fileSet.add(f)); }
      }
    } else {
      const files = await collectJsonFilesFromDir(root); files.forEach(f=>fileSet.add(f));
    }
  }

  const all = Array.from(fileSet).sort();
  let changedCount = 0;
  for(const f of all){
    let raw; try{ raw = await fs.readFile(f,'utf8'); }catch{ continue; }
    let json; try{ json = JSON.parse(raw); }catch{ continue; }
    const candidate = json.musicalSequence && typeof json.musicalSequence === 'object' ? json.musicalSequence : json;
    if(!candidate || !candidate.movements) continue;
    const fallbackPersona = normalizePersona(candidate.persona || 'design systems engineer');
    let changed = false;
    // top-level
    const newTop = transformUserStory(candidate.userStory, fallbackPersona);
    if(JSON.stringify(candidate.userStory) !== JSON.stringify(newTop)) { candidate.userStory = newTop; changed = true; }
    // movements
    for(const mv of candidate.movements){
      const mvPersona = normalizePersona(mv.persona || candidate.persona || fallbackPersona);
      const newMv = transformUserStory(mv.userStory, mvPersona);
      if(JSON.stringify(mv.userStory) !== JSON.stringify(newMv)){ mv.userStory = newMv; changed = true; }
      if(Array.isArray(mv.beats)){
        for(const b of mv.beats){
          const bPersona = normalizePersona(b.persona || mv.persona || candidate.persona || fallbackPersona);
          const newB = transformUserStory(b.userStory, bPersona);
          if(JSON.stringify(b.userStory) !== JSON.stringify(newB)){ b.userStory = newB; changed = true; }
        }
      }
    }
    if(changed){
      try{
        await fs.copyFile(f, `${f}.bak-normalize-${Date.now()}`);
        await fs.writeFile(f, JSON.stringify(json, null, 2) + '\n', 'utf8');
        changedCount++;
        console.log('normalized', f);
      }catch(err){ console.error('write failed', f, err); }
    }
  }
  console.log('done. files normalized:', changedCount);
}

main().catch(err=>{ console.error(err); process.exit(1); });
