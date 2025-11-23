#!/usr/bin/env node
/**
 * Build composite shape artifacts by aggregating latest records for a set of features.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, '.generated', 'telemetry', 'index.json');
const COMPOSITES_DIR = path.join(ROOT, 'composites');

function loadIndex() {
  try { return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8')); } catch { return null; }
}

function ensureDir() { if (!fs.existsSync(COMPOSITES_DIR)) fs.mkdirSync(COMPOSITES_DIR, { recursive: true }); }

function buildComposite(chainId, features) {
  const index = loadIndex();
  if (!index) throw new Error('Telemetry index missing');
  const runs = [];
  let totalBeats = 0;
  let totalBaton = 0;
  for (const f of features) {
    const entry = index.features[f];
    if (!entry || !entry.runs.length) continue;
    const latest = entry.runs[0];
    runs.push({ feature: f, file: latest.file, shapeHash: latest.shapeHash });
    // Load actual record for beats/batonDiffCount aggregation
    const fullPath = path.join(ROOT, '.generated', 'telemetry', latest.file);
    try {
      const rec = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      const beats = (rec.beats ?? rec.record?.beats) || 0;
      const baton = (rec.batonDiffCount ?? rec.record?.batonDiffCount) || 0;
      totalBeats += beats;
      totalBaton += baton;
    } catch { /* ignore */ }
  }
  ensureDir();
  const out = { chainId, features, runs, aggregated: { beats: totalBeats, batonDiffCount: totalBaton }, createdAt: new Date().toISOString() };
  const filePath = path.join(COMPOSITES_DIR, `${chainId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(out, null, 2), 'utf-8');
  return filePath;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const chainId = args.find(a => a.startsWith('chainId='))?.split('=')[1] || `chain-${Date.now()}`;
  const featuresArg = args.find(a => a.startsWith('features='))?.split('=')[1] || '';
  const features = featuresArg ? featuresArg.split(',') : [];
  return { chainId, features };
}

function main() {
  const { chainId, features } = parseArgs();
  if (!features.length) {
    console.error('Usage: node scripts/build-composite-shapes.js chainId=<id> features=f1,f2');
    process.exit(1);
  }
  const file = buildComposite(chainId, features);
  console.log('[composite] built:', file);
}

if (process.argv[1].endsWith('build-composite-shapes.js')) main();

export { buildComposite };