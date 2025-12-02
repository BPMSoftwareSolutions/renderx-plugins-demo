#!/usr/bin/env node
/*
 Emitting ASCII handlers portfolio from existing analysis artifacts.
 Reads: .generated/analysis/renderx-web/handler-exports.json
 Writes: docs/generated/renderx-web-orchestration/handlers-portfolio.txt
 Groups by: package (symphony hint) → file → handler name
*/
const fs = require('fs');
const path = require('path');

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('Failed to read JSON at', p, e.message);
    process.exit(1);
  }
}

const root = process.cwd();
// Prefer latest handler-metrics JSON which includes names and file paths (if available)
const analysisDirWeb = path.join(root, '.generated', 'analysis', 'renderx-web');
const analysisDirOrch = path.join(root, '.generated', 'analysis', 'renderx-web-orchestration');
const outDir = path.join(root, 'docs', 'generated', 'renderx-web-orchestration');
const outPath = path.join(outDir, 'handlers-portfolio.txt');

function findLatestMetrics(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.startsWith('handler-metrics-') && f.endsWith('.json'));
  if (files.length === 0) return null;
  files.sort();
  const latest = files[files.length - 1];
  const p = path.join(dir, latest);
  const j = readJson(p);
  if (j && Array.isArray(j.handlers)) return j.handlers.map(h => ({
    name: h.name,
    package: h.package || 'unknown-package',
    symphony: h.symphony || 'unknown',
    filePath: h.file || h.filePath || 'unknown',
  }));
  return null;
}

const fromWeb = findLatestMetrics(analysisDirWeb) || [];
const fromOrch = findLatestMetrics(analysisDirOrch) || [];
const exportsList = [...fromWeb, ...fromOrch];
if (exportsList.length === 0) {
  console.error('No handler metrics found in analysis directories.');
  process.exit(2);
}

// Normalize entries: { package, symphony?, filePath, name }
function symphonyKeyFrom(entry) {
  // Heuristic: use package + possible symphony name hints from export names
  // e.g., "create.symphony", "resize.symphony"; else fall back to package
  const n = entry.name || '';
  const pkg = entry.package || 'unknown-package';
  let sym = null;
  const m = n.match(/([a-z0-9_\.-]+)\.symphony/i);
  if (m) sym = m[1].toLowerCase();
  return `${pkg}::${sym || 'general'}`;
}

const groups = new Map();
for (const e of exportsList) {
  const key = symphonyKeyFrom(e);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(e);
}

// Sort groups alphabetically for stable output
const sortedKeys = Array.from(groups.keys()).sort((a,b)=>a.localeCompare(b));

const lines = [];
lines.push('HANDLER PORTFOLIO (broad exports)');
lines.push(`Total: ${exportsList.length}`);
lines.push('');

for (const key of sortedKeys) {
  const [pkg, sym] = key.split('::');
  const items = groups.get(key);
  lines.push(`${pkg} :: ${sym}  (${items.length})`);
  lines.push('---------------------------------------------');
  // Sort items by file path then name
  items.sort((a,b)=>{
    const af = (a.filePath||'').localeCompare(b.filePath||'');
    if (af !== 0) return af;
    return (a.name||'').localeCompare(b.name||'');
  });
  for (const it of items) {
    const fp = it.filePath || it.file || it.source || 'unknown-file';
    lines.push(`- ${it.name}  |  ${fp}`);
  }
  lines.push('');
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, lines.join('\n'));
console.log('Wrote portfolio:', outPath);
