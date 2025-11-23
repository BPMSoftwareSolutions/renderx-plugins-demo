import { randomUUID } from 'crypto';
import { BddTelemetryRecord } from './contract';
import { recordTelemetry } from './collector';

interface ActiveFeatureContext {
  feature: string;
  event: string;
  startTime: number;
  beats: number;
  correlationId: string;
  batonDiffCount: number;
  sequenceSignature?: string;
}

const active: Record<string, ActiveFeatureContext> = {};

export function startFeature(feature: string, event: string, opts?: { sequenceSignature?: string }) {
  const correlationId = randomUUID();
  active[correlationId] = {
    feature,
    event,
    startTime: Date.now(),
    beats: 0,
    correlationId,
    batonDiffCount: 0,
    sequenceSignature: opts?.sequenceSignature
  };
  return correlationId;
}

export function beat(correlationId: string) {
  const ctx = active[correlationId];
  if (ctx) ctx.beats += 1;
}

export function registerBatonMutation(correlationId: string, count: number = 1) {
  const ctx = active[correlationId];
  if (ctx) ctx.batonDiffCount += count;
}

export function endFeature(correlationId: string, status: 'ok' | 'warn' | 'error', payload?: Record<string, any>) {
  const ctx = active[correlationId];
  if (!ctx) return;
  const durationMs = Date.now() - ctx.startTime;
  const record: BddTelemetryRecord = {
    timestamp: new Date().toISOString(),
    feature: ctx.feature,
    event: ctx.event,
    beats: ctx.beats,
    status,
    correlationId,
    durationMs,
    sequenceSignature: ctx.sequenceSignature,
    batonDiffCount: ctx.batonDiffCount,
    payload
  };
  recordTelemetry(record);
  delete active[correlationId];
  return record;
}

// Convenience wrapper for common single-step features
export async function emitFeature<T>(feature: string, event: string, run: () => Promise<T> | T, opts?: { sequenceSignature?: string }): Promise<{ result: T; record: BddTelemetryRecord; correlationId: string; }> {
  const id = startFeature(feature, event, opts);
  beat(id); // initial beat
  let result: T;
  try {
    result = await run();
    beat(id); // completion beat
    const record = endFeature(id, 'ok', { result });
    return { result, record: record!, correlationId: id };
  } catch (e: any) {
    beat(id);
    endFeature(id, 'error', { error: e?.message || String(e) });
    throw e;
  }
}
