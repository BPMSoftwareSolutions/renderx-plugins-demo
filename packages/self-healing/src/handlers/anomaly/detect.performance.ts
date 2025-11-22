import { TelemetryEvent, TelemetryMetrics, Anomaly, SeverityLevel } from '../../types';

export interface PerformanceAnomaliesResult extends TelemetryEvent { context: { anomalies: Anomaly[]; assessed: number; }; }

function assessSeverity(ratio: number): SeverityLevel {
  if (ratio >= 3) return 'critical';
  if (ratio >= 2) return 'high';
  if (ratio >= 1.5) return 'medium';
  return 'low';
}

export function detectPerformanceAnomalies(current: TelemetryMetrics, baselines: TelemetryMetrics): PerformanceAnomaliesResult {
  if (!current || !baselines) throw new Error('metrics required');
  const anomalies: Anomaly[] = [];
  Object.entries(current.handlers).forEach(([name, data]) => {
    const base = baselines.handlers[name];
    if (!base) return;
    const ratio = base.avgTime ? data.avgTime / base.avgTime : 0;
    if (ratio >= 1.25) {
      anomalies.push({
        id: `${name}-perf-${Date.now()}`,
        type: 'performance',
        severity: assessSeverity(ratio),
        handler: name,
        description: `Latency increased by ${(ratio*100).toFixed(0)}% vs baseline`,
        metrics: { current: data.avgTime, baseline: base.avgTime, ratio },
        detectedAt: new Date().toISOString(),
        confidence: Math.min(1, ratio / 2)
      });
    }
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'detectPerformanceAnomalies',
    event: 'anomaly.detect.performance',
    context: { anomalies, assessed: anomalies.length }
  };
}
