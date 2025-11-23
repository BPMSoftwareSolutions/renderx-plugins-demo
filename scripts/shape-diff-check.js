#!/usr/bin/env node
/**
 * Shape diff annotation enforcement (Sprint 1 scaffold).
 * Compares latest two persisted telemetry runs per feature. If shapeHash changed and no annotation exists, warns (future: fail).
 * Usage:
 *   node scripts/shape-diff-check.js            # check only
 *   node scripts/shape-diff-check.js --annotate feature="shape-persistence" reason="Adjust beats"
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TELEMETRY_ROOT = path.join(ROOT, '.generated', 'telemetry');
const INDEX_PATH = path.join(TELEMETRY_ROOT, 'index.json');
const ANNOTATIONS_PATH = path.join(ROOT, 'shape-evolutions.json');

function loadJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return fallback; }
}

function loadRun(feature, relFile) {
  const full = path.join(TELEMETRY_ROOT, relFile);
  return loadJson(full, null);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { annotate: false, feature: undefined, reason: undefined };
  if (args.includes('--annotate')) parsed.annotate = true;
  for (const arg of args) {
    if (arg.startsWith('feature=')) parsed.feature = arg.split('=')[1];
    if (arg.startsWith('reason=')) parsed.reason = arg.split('=')[1];
  }
  return parsed;
}

function saveAnnotations(json) {
  fs.writeFileSync(ANNOTATIONS_PATH, JSON.stringify(json, null, 2), 'utf-8');
}

function main() {
  const index = loadJson(INDEX_PATH, null);
  if (!index) {
    console.log('[shape-diff] No telemetry index present; skipping diff check.');
    return;
  }
  const annotations = loadJson(ANNOTATIONS_PATH, { version: '1.0.0', annotations: [] });
  const { annotate, feature: annotateFeature, reason } = parseArgs();
  const diffs = [];
  for (const [feature, entry] of Object.entries(index.features || {})) {
    if (!entry.runs || entry.runs.length < 2) continue;
    const [latest, previous] = entry.runs;
    const latestRun = loadRun(feature, latest.file);
    const prevRun = loadRun(feature, previous.file);
    if (!latestRun || !prevRun) continue;
    const latestHash = latestRun.shapeHash || latestRun.record?.shapeHash;
    const prevHash = prevRun.shapeHash || prevRun.record?.shapeHash;
    if (!latestHash || !prevHash) continue;
    if (latestHash !== prevHash) {
      const annotated = annotations.annotations.some(a => a.feature === feature && a.previousHash === prevHash && a.newHash === latestHash);
      diffs.push({ feature, previousHash: prevHash, newHash: latestHash, annotated });
    }
  }
  if (annotate) {
    if (!annotateFeature) {
      console.error('[shape-diff] --annotate requires feature=<name> reason="..."');
      process.exit(1);
    }
    const target = diffs.find(d => d.feature === annotateFeature && !d.annotated);
    if (!target) {
      console.error(`[shape-diff] No unannotated diff found for feature=${annotateFeature}`);
      process.exit(1);
    }
    annotations.annotations.push({
      feature: target.feature,
      previousHash: target.previousHash,
      newHash: target.newHash,
      annotatedAt: new Date().toISOString(),
      reason: reason || 'unspecified'
    });
    saveAnnotations(annotations);
    console.log(`[shape-diff] Annotation added for feature=${target.feature}`);
    return;
  }
  if (!diffs.length) {
    console.log('[shape-diff] No shape hash changes detected.');
    return;
  }
  const unannotated = diffs.filter(d => !d.annotated);
  if (unannotated.length) {
    const enforce = process.env.SHAPE_DIFF_ENFORCE !== '0';
    const msg = '[shape-diff] Unannotated shape changes detected:';
    if (enforce) {
      console.error(msg);
      for (const d of unannotated) {
        console.error(`  • ${d.feature}: ${d.previousHash.slice(0,12)} -> ${d.newHash.slice(0,12)}`);
      }
      process.exit(1);
    } else {
      console.warn(msg + ' (warning only; enforcement disabled)');
      for (const d of unannotated) {
        console.warn(`  • ${d.feature}: ${d.previousHash.slice(0,12)} -> ${d.newHash.slice(0,12)}`);
      }
    }
  } else {
    console.log('[shape-diff] All shape changes annotated.');
  }
}

main();