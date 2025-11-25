#!/usr/bin/env node
/**
 * Build composite shape artifacts by aggregating latest records for a set of features.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TELEMETRY_ROOT = path.join(ROOT, '.generated', 'telemetry');
const INDEX_PATH = path.join(TELEMETRY_ROOT, 'index.json');
const COMPOSITES_DIR = path.join(ROOT, 'composites');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
}

function loadIndex() {
  return readJson(INDEX_PATH);
}

function ensureDir() { if (!fs.existsSync(COMPOSITES_DIR)) fs.mkdirSync(COMPOSITES_DIR, { recursive: true }); }

function listRunFiles(feature) {
  const dir = path.join(TELEMETRY_ROOT, feature);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => name.startsWith('run-') && name.endsWith('.json'))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
}

function loadLatestRunMeta(feature, index) {
  const entry = index?.features?.[feature];
  if (entry && entry.runs && entry.runs.length) return entry.runs[0];
  const [latestFile] = listRunFiles(feature);
  if (!latestFile) return null;
  return { file: path.join(feature, latestFile) };
}

function shortHash(hash) {
  return hash ? hash.slice(0, 16) : undefined;
}

function loadRunAggregates(relFile) {
  const fullPath = path.join(TELEMETRY_ROOT, relFile);
  const rec = readJson(fullPath);
  if (!rec) return null;
  const beats = (rec.beats ?? rec.record?.beats) || 0;
  const baton = (rec.batonDiffCount ?? rec.record?.batonDiffCount) || 0;
  const hash = rec.shapeHash ?? rec.record?.shapeHash;
  return { beats, batonDiffCount: baton, shapeHash: shortHash(hash) };
}

function buildComposite(chainId, features) {
  const index = loadIndex();
  const runs = [];
  let totalBeats = 0;
  let totalBaton = 0;
  for (const f of features) {
    const latest = loadLatestRunMeta(f, index);
    if (!latest) continue;
    const aggregates = loadRunAggregates(latest.file);
    if (!aggregates) continue;
    runs.push({ feature: f, file: latest.file, shapeHash: latest.shapeHash || aggregates.shapeHash });
    totalBeats += aggregates.beats;
    totalBaton += aggregates.batonDiffCount;
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