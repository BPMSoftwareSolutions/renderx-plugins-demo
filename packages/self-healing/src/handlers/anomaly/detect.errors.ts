import { TelemetryEvent, TelemetryMetrics, Anomaly, SeverityLevel } from '../../types';

export interface ErrorAnomaliesResult extends TelemetryEvent { context: { anomalies: Anomaly[]; assessed: number; }; }

function severityFromErrorRate(rate: number): SeverityLevel {
  if (rate >= 0.5) return 'critical';
  if (rate >= 0.3) return 'high';
  if (rate >= 0.15) return 'medium';
  return 'low';
}

/**
 * Detects error anomalies by comparing error rate increases vs baseline.
 */
export function detectErrorAnomalies(current: TelemetryMetrics, baselines: TelemetryMetrics): ErrorAnomaliesResult {
  if (!current || !baselines) throw new Error('metrics required');
  const anomalies: Anomaly[] = [];
  Object.entries(current.handlers).forEach(([handlerName, data]) => {
    const base = baselines.handlers[handlerName];
    if (!base) return;
    const increase = data.errorRate - base.errorRate;
    if (increase >= 0.05 && data.errorRate >= 0.1) {
      const ratio = base.errorRate ? data.errorRate / base.errorRate : (data.errorRate > 0 ? 10 : 0);
      anomalies.push({
        id: `${handlerName}-errors-${Date.now()}`,
        type: 'error',
        severity: severityFromErrorRate(data.errorRate),
        handler: handlerName,
        description: `Error rate increased ${(increase*100).toFixed(1)}% (current ${(data.errorRate*100).toFixed(1)}%, baseline ${(base.errorRate*100).toFixed(1)}%)`,
        metrics: { currentErrorRate: data.errorRate, baselineErrorRate: base.errorRate, increase, ratio },
        detectedAt: new Date().toISOString(),
        confidence: Math.min(1, ratio / 4)
      });
    }
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'detectErrorAnomalies',
    event: 'anomaly.detect.errors',
    context: { anomalies, assessed: anomalies.length }
  };
}
