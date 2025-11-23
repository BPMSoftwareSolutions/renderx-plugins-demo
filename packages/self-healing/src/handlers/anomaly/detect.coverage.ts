import { TelemetryEvent, TelemetryMetrics, Anomaly, SeverityLevel } from '../../types';

export interface CoverageAnomaliesResult extends TelemetryEvent { context: { anomalies: Anomaly[]; assessed: number; }; }

function severityFromGap(gap: number): SeverityLevel {
  if (gap >= 0.5) return 'critical';
  if (gap >= 0.35) return 'high';
  if (gap >= 0.2) return 'medium';
  return 'low';
}

/**
 * Coverage anomalies attempt to infer untested growth by looking for large increases in handler activity
 * without proportional historical presence (rough heuristic until explicit test coverage is integrated).
 */
export function detectCoverageAnomalies(current: TelemetryMetrics, baselines: TelemetryMetrics): CoverageAnomaliesResult {
  if (!current || !baselines) throw new Error('metrics required');
  const anomalies: Anomaly[] = [];
  Object.entries(current.handlers).forEach(([handlerName, data]) => {
    const base = baselines.handlers[handlerName];
    if (!base) return; // new handlers are treated as behavioral
    // Heuristic: large growth in count combined with moderate error rate could indicate missing tests around edge behaviors.
    const growth = base.count ? (data.count - base.count) / base.count : 0;
    const gapScore = growth * (data.errorRate + 0.05); // slight bias to ensure tiny error rates still considered
    if (gapScore >= 0.2 && data.count >= 30) {
      anomalies.push({
        id: `${handlerName}-coverage-${Date.now()}`,
        type: 'coverage',
        severity: severityFromGap(gapScore),
        handler: handlerName,
        description: `Potential coverage gap: growth ${(growth*100).toFixed(0)}% with errorRate ${(data.errorRate*100).toFixed(1)}% (gapScore=${gapScore.toFixed(2)})`,
        metrics: { currentCount: data.count, baselineCount: base.count, growth, errorRate: data.errorRate, gapScore },
        detectedAt: new Date().toISOString(),
        confidence: Math.min(1, gapScore + 0.2)
      });
    }
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'detectCoverageAnomalies',
    event: 'anomaly.detect.coverage',
    context: { anomalies, assessed: anomalies.length }
  };
}
