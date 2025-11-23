import fs from 'fs';
import path from 'path';
import { BddTelemetryRecord } from './contract';
import { shortHash } from './hash';

const ROOT = process.cwd();
const TELEMETRY_ROOT = path.join(ROOT, '.generated', 'telemetry');
const INDEX_PATH = path.join(TELEMETRY_ROOT, 'index.json');
const RETENTION = 10;

interface FeatureIndexEntry {
  runs: { file: string; shapeHash?: string; timestamp: string }[];
}
interface TelemetryIndex {
  features: Record<string, FeatureIndexEntry>;
  lastUpdated: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadIndex(): TelemetryIndex {
  if (!fs.existsSync(INDEX_PATH)) return { features: {}, lastUpdated: new Date().toISOString() };
  try {
    return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8')) as TelemetryIndex;
  } catch {
    return { features: {}, lastUpdated: new Date().toISOString() };
  }
}

function saveIndex(idx: TelemetryIndex) {
  idx.lastUpdated = new Date().toISOString();
  ensureDir(TELEMETRY_ROOT);
  fs.writeFileSync(INDEX_PATH, JSON.stringify(idx, null, 2), 'utf-8');
}

export function persistTelemetry(rec: BddTelemetryRecord) {
  const featureDir = path.join(TELEMETRY_ROOT, rec.feature);
  ensureDir(featureDir);
  const runId = Date.now();
  const fileName = `run-${runId}.json`;
  const fullPath = path.join(featureDir, fileName);
  // Write trimmed record (exclude payload large objects if any) but keep shapeHash
  const toWrite = { ...rec };
  fs.writeFileSync(fullPath, JSON.stringify(toWrite, null, 2), 'utf-8');
  // Update index
  const index = loadIndex();
  if (!index.features[rec.feature]) index.features[rec.feature] = { runs: [] };
  index.features[rec.feature].runs.unshift({ file: path.join(rec.feature, fileName), shapeHash: shortHash(rec.shapeHash || ''), timestamp: rec.timestamp });
  // Retention
  if (index.features[rec.feature].runs.length > RETENTION) index.features[rec.feature].runs = index.features[rec.feature].runs.slice(0, RETENTION);
  saveIndex(index);
}
