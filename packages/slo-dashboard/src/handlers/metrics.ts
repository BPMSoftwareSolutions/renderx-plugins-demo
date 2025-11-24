/**
 * SLO Dashboard handler implementations
 * Progressive enrichment: initial skeleton replaced with telemetry-aware logic.
 * NOTE: Real data fetching will replace the static helpers when backend wiring exists.
 */
import crypto from 'crypto';
import { computeWeightedCompliance, sortByRemainingBudget, isBurnRateSpike, calculateProjectionStatus, getProgressColor } from '../domain/compliance';
import { emitTelemetry, getTelemetryBuffer } from '../telemetry/emitter';

export interface SLOInput {
  id: string;
  weight: number; // importance weighting
  compliance: number; // 0-1
  remainingBudgetPercent: number; // % remaining error budget
  burnRateShortTerm: number; // recent hourly percent consumption
  burnRateLongTerm: number; // 24h average percent consumption
  hasRecentData?: boolean; // marks availability of fresh metrics
  selfHealingDelta?: number; // positive indicates improving trend due to auto-healing
}

export async function loadBudgets() {
  // Placeholder: would fetch budgets service
  emitTelemetry('dashboard.load.budgets.requested', {});
  return { budgets: [] };
}

export async function loadMetrics() {
  // Placeholder: would fetch metrics service
  emitTelemetry('dashboard.load.metrics.requested', {});
  return { metrics: [] };
}

/**
 * Computes overall compliance and emits telemetry events describing per-SLO status.
 * Empty list: emits dashboard.empty-state.
 */
export function computeCompliance(input?: { slos: SLOInput[] }) {
  const slos = input?.slos || [];
  if(slos.length === 0){
    emitTelemetry('dashboard.empty-state', { reason: 'no-slos' });
    emitTelemetry('dashboard.compliance.calculated', { overallCompliance: 0, consideredCount: 0, omittedIds: [] });
    return { overallCompliance: 0, sortedBudgets: [], projections: [] };
  }

  const incomplete = slos.filter(s=>s.hasRecentData === false).map(s=>s.id);
  const considered = slos.filter(s=>s.hasRecentData !== false);
  const overallCompliance = computeWeightedCompliance(considered.map(s=>({ id: s.id, weight: s.weight, compliance: s.compliance })));

  // Sorted budgets
  const budgetEntries = considered.map(s=>({ id: s.id, remainingBudgetPercent: s.remainingBudgetPercent, burnRate: s.burnRateShortTerm }));
  const sortedBudgets = sortByRemainingBudget(budgetEntries);
  emitTelemetry('slo.budget.sorted', { order: sortedBudgets.map(b=>b.id) });

  // Per-SLO projection + spike + self-healing telemetry
  const projections = considered.map(s=>{
    const proj = calculateProjectionStatus(s.remainingBudgetPercent, s.burnRateShortTerm, 24);
    const color = getProgressColor(s.compliance);
    emitTelemetry('slo.projection.evaluated', { id: s.id, status: proj.status, hoursToBreach: proj.hoursToBreach });
    emitTelemetry('slo.accessibility.color-labeled', { id: s.id, color: color.color, label: color.label });
    if(isBurnRateSpike(s.burnRateShortTerm, s.burnRateLongTerm)){
      emitTelemetry('slo.burnRate.spike', { id: s.id, shortTerm: s.burnRateShortTerm, longTerm: s.burnRateLongTerm });
    }
    if((s.selfHealingDelta || 0) > 0){
      emitTelemetry('slo.selfHealing.trend', { id: s.id, delta: s.selfHealingDelta });
    }
    return { id: s.id, ...proj };
  });

  emitTelemetry('dashboard.compliance.calculated', { overallCompliance, consideredCount: considered.length, omittedIds: incomplete });
  return { overallCompliance, sortedBudgets, projections };
}

/**
 * Builds a deterministic export payload including a cryptographic hash and signature.
 */
export function serializeDashboardState(slos: SLOInput[] = []) {
  const comp = computeCompliance({ slos });
  const payload = { slos, overallCompliance: comp.overallCompliance, generatedAt: new Date().toISOString(), projections: comp.projections };
  const json = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(json).digest('hex');
  // Signature: simple HMAC for demo purposes
  const secret = process.env.SLO_DASHBOARD_EXPORT_SECRET || 'demo-export-secret';
  const signature = crypto.createHmac('sha256', secret).update(hash).digest('base64');
  emitTelemetry('dashboard.export.serialized', { count: slos.length, hash });
  return { data: payload, hash, signature };
}

export function validateExportSignature(hash: string, signature: string) {
  const secret = process.env.SLO_DASHBOARD_EXPORT_SECRET || 'demo-export-secret';
  const expected = crypto.createHmac('sha256', secret).update(hash).digest('base64');
  return expected === signature;
}

export async function triggerExportDownload(payload: any) {
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  emitTelemetry('dashboard.export.triggered', { size: str.length });
  // Placeholder side-effect (would create Blob + download in real UI)
  return { downloaded: str.length };
}

// Convenience for tests to clear telemetry between scenarios
export function _testClearTelemetry(){
  getTelemetryBuffer().length = 0;
}
