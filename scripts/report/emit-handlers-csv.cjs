#!/usr/bin/env node
// Emit CSV of beat handlers using JSON sequence/workflow specs and analysis artifacts.
// Inputs: sequence/workflow JSON under packages/<pkg>/json-sequences and handler-exports.json for enrichment
// Output: docs/generated/renderx-web-orchestration/handlers-portfolio.csv
// Columns: handler,symphony,file path,sub-domain,Movement,Beat
const fs = require('fs');
const path = require('path');

function readJson(p){
	  try {
	    // Some generated artifacts (like handler-exports.json) are UTF-16LE with a
	    // BOM and an optional log prefix line. Normalize to a clean JSON string
	    // before parsing so callers don't need to care about encoding details.
	    const buf = fs.readFileSync(p);
	    let raw;
	    // UTF-16LE BOM 0xFF 0xFE
	    if (buf[0] === 0xFF && buf[1] === 0xFE) {
	      raw = buf.toString('utf16le');
	    } else {
	      raw = buf.toString('utf8');
	    }
	    // Handle possible log prefix lines before JSON
	    const firstBrace = raw.indexOf('{');
	    if (firstBrace > 0) raw = raw.slice(firstBrace);
	    return JSON.parse(raw);
	  } catch(e){ return null; }
	}

function listAllHandlers(dir){
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.startsWith('handler-metrics-') && f.endsWith('.json'));
  const out = [];
  for (const f of files){
    const j = readJson(path.join(dir, f));
    if (!j || !Array.isArray(j.handlers)) continue;
    for (const h of j.handlers){
      out.push({
        handler: h.name || 'unknown',
        symphony: h.symphony || 'unknown',
        filePath: h.file || h.filePath || 'unknown',
        package: h.package || inferPackage(h.file || h.filePath)
      });
    }
  }
  return out;
}

function inferPackage(fp){
  if (!fp || typeof fp !== 'string') return 'unknown-package';
  const m = fp.match(/packages\/(.*?)\//);
  return m ? m[1] : 'unknown-package';
}

function inferSubDomain(pkg){
  // Treat package name as sub-domain for this CSV
  if (!pkg) return 'unknown';
  return pkg;
}

function inferSymphonyFromFile(fp){
  if (!fp || typeof fp !== 'string') return 'unknown';
  const m1 = fp.match(/symphonies\/(.*?)\//);
  if (m1) return m1[1];
  const m2 = fp.match(/symphony\.(.*?)\./);
  if (m2) return m2[1];
  return 'unknown';
}

const root = process.cwd();
const dirWeb = path.join(root, '.generated', 'analysis', 'renderx-web');
const dirOrch = path.join(root, '.generated', 'analysis', 'renderx-web-orchestration');
// Prefer explicit handler-exports.json produced by scan-handlers.cjs
const exportsPath = path.join(root, '.generated', 'analysis', 'renderx-web', 'handler-exports.json');
let list = [];
if (fs.existsSync(exportsPath)) {
  const data = readJson(exportsPath);
  if (data && Array.isArray(data.handlers)) {
    list = data.handlers.map(h => ({
      handler: h.name || 'unknown',
      symphony: h.symphony || inferSymphonyFromFile(h.file || h.filePath),
      filePath: h.file || h.filePath || 'unknown',
      package: h.package || inferPackage(h.file || h.filePath)
    }));
    console.log('[emit-handlers-csv] Using handler-exports.json with count:', list.length);
  }
}
if (list.length === 0) {
  list = [...listAllHandlers(dirWeb), ...listAllHandlers(dirOrch)];
  console.log('[emit-handlers-csv] Fallback to handler-metrics with count:', list.length);
}

// Augment with Movement/Beat from JSON sequence/workflow specs
function collectJsonSequenceDirs(base){
  const dirs = [];
  const stack = [base];
  while (stack.length){
    const cur = stack.pop();
    if (!fs.existsSync(cur)) continue;
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries){
      const p = path.join(cur, e.name);
      if (e.isDirectory()){
        if (e.name === 'json-sequences'){
          dirs.push(p);
        } else {
          stack.push(p);
        }
      }
    }
  }
  return dirs;
}

function collectBeatHandlersFromJsonSequences(){
  const out = [];
  const seqDirs = collectJsonSequenceDirs(path.join(root, 'packages'));
  if (seqDirs.length === 0) {
    console.warn('[emit-handlers-csv] No json-sequences directories found under packages/. Check DOMAIN_REGISTRY.json.');
  }
  for (const seqDir of seqDirs){
      const files = fs.readdirSync(seqDir).filter(f => f.endsWith('.json'));
      for (const f of files){
        const full = path.join(seqDir, f);
        const j = readJson(full);
        if (!j) continue;
        // Support common roots: direct, musicalSequence, sequence, workflow
        const rootCandidate = (j.musicalSequence || j.sequence || j.workflow || j);
        const movements = Array.isArray(rootCandidate.movements) ? rootCandidate.movements : (Array.isArray(rootCandidate.Movements) ? rootCandidate.Movements : []);
        for (const m of movements){
          const movementName = m.name || m.movement || m.id || m.index;
          const beats = Array.isArray(m.beats) ? m.beats : (Array.isArray(m.Beats) ? m.Beats : (Array.isArray(m.steps) ? m.steps : []));
          if (!Array.isArray(beats)) continue;
          let beatIndex = 0;
          for (const b of beats){
            beatIndex += 1;
            const beatName = b.name || b.id || beatIndex;
            const handlers = [];
            const acLines = [];
            // Common shapes: b.handlers, b.execution.handlers, b.actions, Given/When/Then handlers
            if (Array.isArray(b.handlers)) handlers.push(...b.handlers);
            if (b.execution && Array.isArray(b.execution.handlers)) handlers.push(...b.execution.handlers);
            if (Array.isArray(b.actions)) handlers.push(...b.actions);
            // AC-style: Given/When/Then arrays with handler fields
            for (const k of ['Given','When','Then']){
              const arr = b[k];
              if (Array.isArray(arr)){
                for (const step of arr){
                  if (step && step.handler) handlers.push(step.handler);
                  else if (step && step.action) handlers.push(step.action);
                  else if (step && step.name) handlers.push(step.name);
                  else if (typeof step === 'string') handlers.push(step);
                  // Capture AC/GWT text lines for CSV
                  const txt = (typeof step === 'string') ? step : (step.text || step.description || step.title || step.ac || step.gwt);
                  if (txt) acLines.push(`${k}: ${txt}`);
                }
              }
            }
            // Also support beat.handler and beat.action singular
            if (b.handler) handlers.push(b.handler);
            if (b.action) handlers.push(b.action);
            for (const h of handlers){
              if (!h) continue;
              const pkgMatch = full.match(/packages\/(.*?)\//);
              const pkg = pkgMatch ? pkgMatch[1] : undefined;
              out.push({
                handler: typeof h === 'string' ? h : (h.name || 'unknown'),
                movement: movementName,
                beat: beatName,
                // Path/package can be resolved later via exports list
                filePath: undefined,
                package: pkg,
                symphony: 'unknown',
                ac: acLines.join('\n')
              });
            }
          }
        }
      }
  }
  console.log('[emit-handlers-csv] Beat handlers discovered from JSON:', out.length);
  return out;
}

const beatHandlers = collectBeatHandlersFromJsonSequences();

// Build a quick map from handler name -> file path/package from exports to enrich
const exportByName = new Map();
for (const e of list){
  if (!e || !e.handler) continue;
  if (!exportByName.has(e.handler)){
    exportByName.set(e.handler, { filePath: e.filePath, package: e.package, symphony: e.symphony });
  }
}

if (list.length === 0) {
  console.error('No handler metrics found. Run the analysis pipeline first.');
  process.exit(2);
}

// Deduplicate by handler + filePath to avoid double-count entries
const seen = new Set();
const rows = [];
// First, include beat handlers enriched with exports
for (const bh of beatHandlers){
  const enrich = exportByName.get(bh.handler) || {};
  const filePath = bh.filePath || enrich.filePath || 'unknown';
  const subDomain = inferSubDomain(bh.package || enrich.package);
  const symphony = bh.symphony || enrich.symphony || inferSymphonyFromFile(filePath);
  const key = `${bh.handler}||${bh.movement}||${bh.beat}||${filePath}`;
  if (seen.has(key)) continue;
  seen.add(key);
  rows.push({
    handler: bh.handler,
    symphony,
    filePath,
    subDomain,
    Movement: bh.movement,
    Beat: bh.beat,
    AC: bh.ac || ''
  });
}
// Do NOT include export-only handlers; emit beat handlers exclusively

const outDir = path.join(root, 'docs', 'generated', 'renderx-web-orchestration');
const outPath = path.join(outDir, 'handlers-portfolio.csv');
fs.mkdirSync(outDir, { recursive: true });

function toCsvValue(v){
  if (v == null) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
  return s;
}

const header = ['handler','symphony','file path','sub-domain','Movement','Beat','AC'];
const lines = [header.join(',')];
for (const r of rows){
  lines.push([r.handler, r.symphony, r.filePath, r.subDomain, r.Movement, r.Beat, r.AC].map(toCsvValue).join(','));
}
fs.writeFileSync(outPath, lines.join('\n'));
console.log('Wrote CSV:', outPath, 'rows=', rows.length);
if (rows.length === 0) {
  console.warn('[emit-handlers-csv] WARNING: 0 beat handlers emitted. Ensure JSON sequence files contain movements/beats with handler references under packages/*/json-sequences.');
}
