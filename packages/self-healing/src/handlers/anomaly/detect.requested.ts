import { TelemetryEvent } from '../../types';

export function detectAnomaliesRequested(sequenceId: string): TelemetryEvent {
  if (!sequenceId) throw new Error('sequenceId required');
  return {
    timestamp: new Date().toISOString(),
    handler: 'detectAnomaliesRequested',
    event: 'anomaly.detect.requested',
    context: { sequenceId }
  };
}
