import crypto from 'crypto';
import { BddTelemetryRecord } from './contract';

// Scaffold: derive a deterministic coverageId without real coverage integration yet.
// Future: integrate with Vitest coverage map to hash touched files+lines.
export function computeCoverageId(rec: BddTelemetryRecord): string {
  const base = `${rec.feature}|${rec.event}|${rec.beats}|${rec.status}`;
  return crypto.createHash('sha256').update(base).digest('hex').slice(0, 24);
}