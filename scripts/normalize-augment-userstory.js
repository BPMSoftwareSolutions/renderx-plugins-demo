import fs from 'fs/promises';
import path from 'path';

const file = path.resolve('packages/canvas-component/json-sequences/canvas-component/augment.json');
const backup = `${file}.bak-normalize-${Date.now()}`;

function normalizePersona(p){
  if(!p) return 'design systems engineer';
  return String(p).trim().toLowerCase();
}

function splitGoalAndBenefit(text){
  if(!text) return {goal:'', benefit:''};
  // split at ", so " or " so " (prefer ", so ")
  let idx = text.indexOf(', so ');
  let sepLen = 4;
  if(idx === -1){ idx = text.indexOf(' so '); sepLen = 3; }
  if(idx !== -1){
    const left = text.slice(0, idx).trim();
    const right = text.slice(idx + sepLen).trim();
    return {goal:left, benefit:right};
  }
  return {goal:text.trim(), benefit:''};
}

function stripLeadingAsA(phrase){
  if(!phrase) return phrase;
  // remove patterns like "As a X, I need ", case-insensitive
  const re = /^\s*As a [^,]+,\s*I need\s+(the\s+)?/i;
  return phrase.replace(re, '').trim();
}

async function run(){
  try{
    const raw = await fs.readFile(file,'utf8');
    await fs.copyFile(file, backup);
    const obj = JSON.parse(raw);

    const transform = (us) =>{
      if(!us) return { persona: 'design systems engineer', goal: '', benefit: '' };
      let persona = normalizePersona(us.persona || us.Persona || 'design systems engineer');
      let goalText = us.goal || (typeof us === 'string' ? us : '');
      // split off benefit
      const {goal, benefit} = splitGoalAndBenefit(goalText);
      let newGoal = stripLeadingAsA(goal);
      newGoal = newGoal.replace(/\s+/g,' ').trim();
      let newBenefit = (us.benefit || benefit || '').trim();
      // remove trailing periods
      if(newBenefit.endsWith('.')) newBenefit = newBenefit.slice(0,-1).trim();
      if(newGoal.endsWith('.')) newGoal = newGoal.slice(0,-1).trim();
      return { persona, goal: newGoal, benefit: newBenefit };
    };

    // top-level
    obj.userStory = transform(obj.userStory || {});
    if(Array.isArray(obj.movements)){
      for(const mv of obj.movements){
        mv.userStory = transform(mv.userStory || {});
        if(Array.isArray(mv.beats)){
          for(const b of mv.beats){
            b.userStory = transform(b.userStory || {});
          }
        }
      }
    }

    await fs.writeFile(file, JSON.stringify(obj,null,2)+'\n','utf8');
    console.log('normalized', file);
    console.log('backup at', backup);
  }catch(err){
    console.error('error', err);
    process.exit(1);
  }
}

run();
