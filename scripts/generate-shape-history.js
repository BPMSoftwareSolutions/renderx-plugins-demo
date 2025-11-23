#!/usr/bin/env node
/**
 * Generate SHAPE_HISTORY.md summarizing telemetry index and annotations.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TELEMETRY_ROOT = path.join(ROOT, '.generated', 'telemetry');
const INDEX_PATH = path.join(TELEMETRY_ROOT, 'index.json');
const ANNOTATIONS_PATH = path.join(ROOT, 'shape-evolutions.json');
const OUT_PATH = path.join(ROOT, 'SHAPE_HISTORY.md');

function load(p, fallback) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return fallback; } }

function formatRow(cols) { return `| ${cols.join(' | ')} |`; }

function main() {
  const index = load(INDEX_PATH, null);
  const evol = load(ANNOTATIONS_PATH, { annotations: [] });
  if (!index) {
    fs.writeFileSync(OUT_PATH, '# Shape History\n\n_No telemetry index generated yet._\n');
    console.log('[shape-history] Written empty history.');
    return;
  }
  const lines = ['# Shape History', '', `Last Updated: ${index.lastUpdated}`, '', '## Feature Runs', '', formatRow(['Feature','Runs','Latest Hash','Prev Hash','CoverageId','Annotated Last Diff','Earliest Timestamp','Annotations']), formatRow(['---','---','---','---','---','---','---','---'])];
  for (const [feature, entry] of Object.entries(index.features || {})) {
    const runs = entry.runs || [];
    const latest = runs[0];
    const prev = runs[1];
    const latestShort = latest?.shapeHash || 'n/a';
    const prevShort = prev?.shapeHash || 'n/a';
    const annotatedCount = evol.annotations.filter(a => a.feature === feature).length;
    let annotatedLastDiff = 'n/a';
    if (prev && latest && latestShort !== prevShort) {
      const annotated = evol.annotations.some(a => a.feature === feature && a.previousHash?.startsWith(prevShort) && a.newHash?.startsWith(latestShort));
      annotatedLastDiff = annotated ? 'yes' : 'no';
    } else if (prev && latest) {
      annotatedLastDiff = 'same';
    }
    const earliestTs = runs.length ? runs[runs.length - 1].timestamp || 'n/a' : 'n/a';
    // Attempt to read latest coverage artifact (presence implies coupling)
    let coverageId = 'n/a';
    if (latest && latest.shapeHash) {
      const covDir = path.join(process.cwd(), '.generated', 'coverage');
      const covCandidate = (entry.runs[0].coverageId) || null;
      if (covCandidate) coverageId = covCandidate;
    }
    lines.push(formatRow([feature, String(runs.length), latestShort, prevShort, coverageId, annotatedLastDiff, earliestTs, String(annotatedCount)]));
  }
  // Recent annotations table
  if (evol.annotations.length) {
    lines.push('', '## Recent Annotations', '', formatRow(['Feature','Previous (short)','New (short)','Reason','AnnotatedAt']), formatRow(['---','---','---','---','---']));
    for (const ann of evol.annotations.slice(-20).reverse()) {
      lines.push(formatRow([
        ann.feature,
        ann.previousHash?.slice(0,12) || '',
        ann.newHash?.slice(0,12) || '',
        (ann.reason || '').replace(/\|/g,'/'),
        ann.annotatedAt
      ]));
    }
  }
  fs.writeFileSync(OUT_PATH, lines.join('\n') + '\n');
  console.log('[shape-history] History generated:', OUT_PATH);
}

main();