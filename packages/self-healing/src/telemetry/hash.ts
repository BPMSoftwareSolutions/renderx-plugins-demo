import crypto from 'crypto';
import { BddTelemetryRecord } from './contract';

// Stable serialization excluding volatile fields (timestamp, correlationId) and payload dynamic values depth >1.
function normalizeForHash(rec: BddTelemetryRecord) {
  const durationValue = typeof rec.durationMs === 'number' ? rec.durationMs : 0;
  const durationBucket = durationValue < 5 ? 0 : Math.round(durationValue / 5) * 5;
  const subset: any = {
    feature: rec.feature,
    event: rec.event,
    beats: rec.beats,
    status: rec.status,
    durationMs: durationBucket,
    batonDiffCount: rec.batonDiffCount || 0,
    sequenceSignature: rec.sequenceSignature || '',
  };
  if (rec.payload) {
    // only include top-level scalar keys to reduce churn
    const payloadReduced: Record<string, any> = {};
    Object.keys(rec.payload).sort().forEach(k => {
      const v = (rec.payload as any)[k];
      if (['string','number','boolean'].includes(typeof v)) payloadReduced[k] = v;
    });
    if (Object.keys(payloadReduced).length) subset.payload = payloadReduced;
  }
  return subset;
}

export function computeShapeHash(rec: BddTelemetryRecord): string {
  const norm = normalizeForHash(rec);
  const json = JSON.stringify(norm); // deterministic due to sorted keys in payload
  return crypto.createHash('sha256').update(json).digest('hex');
}

export function shortHash(hash: string): string {
  return hash.slice(0, 16); // convenience for display
}