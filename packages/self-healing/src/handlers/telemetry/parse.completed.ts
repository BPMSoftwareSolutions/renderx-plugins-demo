import { TelemetryEvent, TelemetryMetrics } from '../../types/index';

/**
 * Marks completion of telemetry parsing sequence and provides summary useful for next (anomaly detection) sequence.
 */
export function parseTelemetryCompleted(sequenceId: string, metrics: TelemetryMetrics): TelemetryEvent {
  if (!sequenceId) throw new Error('sequenceId required');
  if (!metrics) throw new Error('metrics required');
  const handlerSummary = Object.entries(metrics.handlers).map(([name, m]) => ({
    name,
    count: m.count,
    p95: m.p95Time,
    p99: m.p99Time,
    errorRate: m.errorRate
  })).slice(0, 25); // cap summary size
  return {
    timestamp: new Date().toISOString(),
    handler: 'parseTelemetryCompleted',
    event: 'telemetry.parse.completed',
    context: {
      sequenceId,
      totalEvents: metrics.totalEvents,
      handlers: handlerSummary,
      handlerCount: Object.keys(metrics.handlers).length
    }
  };
}
