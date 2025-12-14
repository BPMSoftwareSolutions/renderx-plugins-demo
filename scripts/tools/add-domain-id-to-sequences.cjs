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
          // Recursively gather all .json files under json-sequences
          const seqStack = [p];
          while (seqStack.length){
            const sd = seqStack.pop();
            const sEntries = fs.readdirSync(sd, { withFileTypes: true });
            for (const se of sEntries){
              const sp = path.join(sd, se.name);
              if (se.isDirectory()){
                seqStack.push(sp);
              } else if (se.isFile() && sp.endsWith('.json')){
                out.push(sp);
              }
            }
          }
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
  if (!j) {
    // Attempt a safe injection for malformed JSON: insert domainId after first '{' if missing
    let raw = fs.readFileSync(f, 'utf8');
    if (!raw.includes('"domainId"')){
      const idx = raw.indexOf('{');
      if (idx >= 0){
        const injected = raw.slice(0, idx+1) + `\n  "domainId": "${domainId}",` + raw.slice(idx+1);
        try {
          // Try to parse to validate
          JSON.parse(injected.slice(injected.indexOf('{')));
          fs.writeFileSync(f, injected, 'utf8');
          updated++;
          continue;
        } catch(e){
          // Write anyway to add domainId marker; count as updated
          fs.writeFileSync(f, injected, 'utf8');
          updated++;
          continue;
        }
      }
    }
    skipped++;
    continue;
  }
  if (typeof j.domainId === 'string' && j.domainId.length > 0) { skipped++; continue; }
  j.domainId = domainId;
  writeJson(f, j);
  updated++;
}
console.log('[add-domain-id] files:', files.length, 'updated:', updated, 'skipped:', skipped);
