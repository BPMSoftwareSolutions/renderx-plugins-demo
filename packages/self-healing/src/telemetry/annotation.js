import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, 'shape-evolutions.json');

function loadRegistry(){
  try { return JSON.parse(fs.readFileSync(REGISTRY_PATH,'utf-8')); } catch { return { version: '1.0.0', annotations: [] }; }
}
function saveRegistry(reg){ fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg,null,2),'utf-8'); }

export function annotateShapeEvolution(feature, previousHash, newHash, reason){
  const reg = loadRegistry();
  const exists = reg.annotations.some(a=>a.feature===feature && a.previousHash===previousHash && a.newHash===newHash);
  if(exists) return { added: false, message: 'Annotation already exists.' };
  reg.annotations.push({ feature, previousHash, newHash, annotatedAt: new Date().toISOString(), reason });
  saveRegistry(reg);
  return { added: true, message: 'Annotation added.' };
}
export function hasAnnotation(feature, previousHash, newHash){
  const reg = loadRegistry();
  return reg.annotations.some(a=>a.feature===feature && a.previousHash===previousHash && a.newHash===newHash);
}
