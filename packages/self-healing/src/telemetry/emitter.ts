import { randomUUID } from 'crypto';
import { BddTelemetryRecord } from './contract';
import { computeShapeHash } from './hash';
import { persistTelemetry } from './persistence';
import { computeCoverageId } from './coverage-coupling';
import { persistCoverageSegment } from './coverage-persistence';
import { evaluateBudgets } from './budget-evaluator';
import { getAnomalies } from './anomalies';
import { recordTelemetry } from './collector';

interface ActiveFeatureContext {
  feature: string;
  event: string;
  startTime: number;
  beats: number;
  correlationId: string;
  batonDiffCount: number;
  sequenceSignature?: string;
  domains?: Record<string, number>; // for mutation localization
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

export function registerDomainMutation(correlationId: string, domain: string, count: number = 1) {
  const ctx = active[correlationId];
  if (ctx) {
    if (!ctx.domains) ctx.domains = {};
    ctx.domains[domain] = (ctx.domains[domain] || 0) + count;
  }
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
    payload,
    domainMutations: ctx.domains
  };
  // Attach shape hash (exclude volatile fields internally)
  try {
    record.shapeHash = computeShapeHash(record);
  } catch (e) {
    // Non-fatal: hash failure should not block telemetry emission; surface warning for diagnosability
    console.warn('[telemetry] shape hash failed:', (e as any)?.message || e);
    record.shapeHash = 'hash_error';
  }
  try {
    record.coverageId = computeCoverageId(record);
  } catch (e) {
    console.warn('[telemetry] coverageId generation failed:', (e as any)?.message || e);
  }
  try {
    persistCoverageSegment(record);
  } catch (e) {
    console.warn('[telemetry] coverage persistence failed:', (e as any)?.message || e);
  }
  // Persist for history (best-effort; ignore errors to avoid test flakiness)
  try {
    persistTelemetry(record);
  } catch (e) {
    console.warn('[telemetry] persistence failed:', (e as any)?.message || e);
  }
  try {
    evaluateBudgets(record);
  } catch (e) {
    console.warn('[telemetry] budget evaluation failed:', (e as any)?.message || e);
  }
  // Attach anomaliesCount (correlation-level + feature-level filter)
  try {
    const all = getAnomalies();
    record.anomaliesCount = all.filter(a => a.feature === record.feature && a.correlationId === record.correlationId).length;
  } catch (e) {
    console.warn('[telemetry] anomaliesCount derivation failed:', (e as any)?.message || e);
  }
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
