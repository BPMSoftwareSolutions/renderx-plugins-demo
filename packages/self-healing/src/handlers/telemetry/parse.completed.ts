import { TelemetryEvent, TelemetryMetrics } from '../../types/index';

/**
 * Marks completion of telemetry parsing sequence.
 */
export function parseTelemetryCompleted(sequenceId: string, metrics: TelemetryMetrics): TelemetryEvent {
  if (!sequenceId) throw new Error('sequenceId required');
  if (!metrics) throw new Error('metrics required');
  return {
    timestamp: new Date().toISOString(),
    handler: 'parseTelemetryCompleted',
    event: 'telemetry.parse.completed',
    context: { sequenceId, totalEvents: metrics.totalEvents }
  };
}
