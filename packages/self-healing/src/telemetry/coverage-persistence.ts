import fs from 'fs';
import path from 'path';
import { BddTelemetryRecord } from './contract';

const ROOT = process.cwd();
const COV_ROOT = path.join(ROOT, '.generated', 'coverage');

function ensureDir() { if (!fs.existsSync(COV_ROOT)) fs.mkdirSync(COV_ROOT, { recursive: true }); }

export function persistCoverageSegment(rec: BddTelemetryRecord) {
  if (!rec.coverageId) return;
  ensureDir();
  const filePath = path.join(COV_ROOT, `${rec.coverageId}.json`);
  if (fs.existsSync(filePath)) return; // don't overwrite
  const payload = {
    feature: rec.feature,
    event: rec.event,
    coverageId: rec.coverageId,
    beats: rec.beats,
    timestamp: rec.timestamp
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
}