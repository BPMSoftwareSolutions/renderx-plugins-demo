#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();

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

function collectFiles(patternDirs){
  const files = [];
  for (const base of patternDirs){
    if (!fs.existsSync(base)) continue;
    const stack = [base];
    while (stack.length){
      const cur = stack.pop();
      const entries = fs.existsSync(cur) ? fs.readdirSync(cur, { withFileTypes: true }) : [];
      for (const e of entries){
        const p = path.join(cur, e.name);
        if (e.isDirectory()) stack.push(p);
        else if (e.isFile() && p.endsWith('.json')) files.push(p);
      }
    }
  }
  return files;
}

function refineBeatACs(b){
  const ac = b.acceptanceCriteria || [];
  const newAC = [];
  const handler = b.handler;
  // Helper to add lines
  function addBlock(givenArr, whenArr, thenArr, andArr){
    newAC.push({ given: givenArr, when: whenArr, then: thenArr, and: andArr || [] });
  }
  switch(handler){
    case 'resolveTemplate':
      addBlock([
        'handler resolveTemplate is available',
        'template id exists and cache is empty'
      ],[
        'resolveTemplate(templateId) executes'
      ],[
        'schema and bindings are resolved deterministically'
      ],[
        'concurrent fetches are deduped',
        "telemetry template.resolve includes { id, latencyMs, cacheHit }",
        'completes within ≤ 1000ms P95'
      ]);
      addBlock([
        'malformed template input'
      ],[
        'resolveTemplate executes'
      ],[
        'returns an error and never fetches remotely'
      ],[
        'telemetry includes errorCode and latencyMs'
      ]);
      break;
    case 'registerInstance':
      addBlock([
        'node has tag and no instanceId'
      ],[
        'registerInstance(node) executes'
      ],[
        'assigns stable instanceId and persists registration'
      ],[
        'adds class rx-comp-<tag>-<id>',
        "telemetry component.register includes { tag, instanceId, latencyMs }",
        'completes within ≤ 1000ms P95'
      ]);
      addBlock([
        'node missing tag'
      ],[
        'registerInstance executes'
      ],[
        'returns validation error and does not mutate node'
      ],[
        'telemetry includes errorCode'
      ]);
      break;
    case 'createNode':
      addBlock([
        'resolved template and bindings available'
      ],[
        'createNode executes'
      ],[
        'assembles canvas node without rendering React directly'
      ],[
        'forwards to drop symphony',
        'validates schema',
        'completes within ≤ 2000ms P95'
      ]);
      break;
    case 'renderReact':
      addBlock([
        'composed node ready for render'
      ],[
        'renderReact executes'
      ],[
        'instantiates React component with memoized props and keyed lists'
      ],[
        'emits perf telemetry',
        'completes within ≤ 200ms P95'
      ]);
      break;
    case 'notifyUi':
      addBlock([
        'UI state change present'
      ],[
        'notifyUi executes'
      ],[
        'publishes FIFO events with backpressure'
      ],[
        "telemetry ui.notify includes { event, latencyMs }",
        'end-to-end delivery < 20ms',
        '99.9% success on valid input'
      ]);
      break;
    case 'enhanceLine':
      addBlock([
        'line element and geometry available'
      ],[
        'enhanceLine executes'
      ],[
        'applies augmentation (measurements, anchors, hit areas)'
      ],[
        'validates geometry',
        'emits change events',
        'completes within ≤ 1000ms P95'
      ]);
      break;
    default:
      // Keep existing ACs if unknown handler
      return ac;
  }
  return newAC;
}

const targets = [
  path.join(root, 'packages', 'canvas-component', 'json-sequences'),
  path.join(root, 'packages', 'control-panel', 'json-sequences')
];
const files = collectFiles(targets);
let updated = 0;
for (const f of files){
  const j = readJson(f);
  if (!j) continue;
  const ms = j.movements || (j.musicalSequence && j.musicalSequence.movements) || [];
  let changed = false;
  for (const m of ms){
    const beats = m.beats || m.Beats || m.steps || [];
    for (const b of beats){
      const refined = refineBeatACs(b);
      if (refined && JSON.stringify(refined) !== JSON.stringify(b.acceptanceCriteria || [])){
        b.acceptanceCriteria = refined;
        changed = true;
      }
    }
  }
  if (changed){
    writeJson(f, j);
    updated++;
  }
}
console.log('[refine-acs] files:', files.length, 'updated:', updated);
