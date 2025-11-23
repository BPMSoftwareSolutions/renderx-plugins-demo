import { TelemetryEvent, TelemetryMetrics, Anomaly, SeverityLevel } from '../../types';

export interface BehavioralAnomaliesResult extends TelemetryEvent { context: { anomalies: Anomaly[]; assessed: number; }; }

function severityFromDelta(delta: number): SeverityLevel {
  if (delta >= 2.5) return 'critical';
  if (delta >= 2.0) return 'high';
  if (delta >= 1.5) return 'medium';
  return 'low';
}

/**
 * Detects behavioral anomalies such as sudden surge in handler invocation count or
 * appearance of previously unseen handlers (possible new behavior / feature flag change).
 */
export function detectBehavioralAnomalies(current: TelemetryMetrics, baselines: TelemetryMetrics): BehavioralAnomaliesResult {
  if (!current || !baselines) throw new Error('metrics required');
  const anomalies: Anomaly[] = [];
  // New handlers not in baseline
  Object.keys(current.handlers).forEach(handlerName => {
    if (!baselines.handlers[handlerName]) {
      const data = current.handlers[handlerName];
      anomalies.push({
        id: `${handlerName}-behavior-new-${Date.now()}`,
        type: 'behavioral',
        severity: 'medium',
        handler: handlerName,
        description: `Handler appeared with count=${data.count} not present in baseline`,
        metrics: { count: data.count },
        detectedAt: new Date().toISOString(),
        confidence: 0.6
      });
    }
  });
  // Surges in invocation counts
  Object.entries(current.handlers).forEach(([handlerName, data]) => {
    const base = baselines.handlers[handlerName];
    if (!base) return; // already handled as new above
    const delta = base.count ? data.count / base.count : 0;
    if (delta >= 1.5 && data.count >= 20) {
      anomalies.push({
        id: `${handlerName}-behavior-surge-${Date.now()}`,
        type: 'behavioral',
        severity: severityFromDelta(delta),
        handler: handlerName,
        description: `Invocation count surge ${(delta*100).toFixed(0)}% vs baseline (current=${data.count}, baseline=${base.count})`,
        metrics: { current: data.count, baseline: base.count, delta },
        detectedAt: new Date().toISOString(),
        confidence: Math.min(1, delta / 3)
      });
    }
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'detectBehavioralAnomalies',
    event: 'anomaly.detect.behavioral',
    context: { anomalies, assessed: anomalies.length }
  };
}
