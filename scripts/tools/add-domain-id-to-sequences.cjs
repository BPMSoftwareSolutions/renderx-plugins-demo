#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const domainId = 'renderx-web-orchestration';

function readJson(p){
  try {
    let raw = fs.readFileSync(p,'utf8');
    const i = raw.indexOf('{');
    if (i > 0) raw = raw.slice(i);
    return JSON.parse(raw);
  } catch(e){ return null; }
}

function writeJson(p, obj){
  const s = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(p, s, 'utf8');
}

function collectJsonSequenceFiles(base){
  const out = [];
  const stack = [base];
  while (stack.length){
    const cur = stack.pop();
    if (!fs.existsSync(cur)) continue;
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries){
      const p = path.join(cur, e.name);
      if (e.isDirectory()){
        if (e.name === 'json-sequences'){
          const files = fs.readdirSync(p).filter(f => f.endsWith('.json'));
          for (const f of files){ out.push(path.join(p, f)); }
        } else {
          stack.push(p);
        }
      }
    }
  }
  return out;
}

const files = collectJsonSequenceFiles(path.join(root, 'packages'));
let updated = 0;
let skipped = 0;
for (const f of files){
  const j = readJson(f);
  if (!j) { skipped++; continue; }
  if (j.domainId === domainId) { skipped++; continue; }
  j.domainId = domainId;
  writeJson(f, j);
  updated++;
}
console.log('[add-domain-id] files:', files.length, 'updated:', updated, 'skipped:', skipped);
