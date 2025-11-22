import { TelemetryEvent } from '../../types/index';

/**
 * Initiates telemetry parsing sequence. Validates required inputs, returns an initiation event.
 */
export function parseTelemetryRequested(sequenceId: string) : TelemetryEvent {
  if (!sequenceId || typeof sequenceId !== 'string') {
    throw new Error('sequenceId is required');
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'parseTelemetryRequested',
    event: 'telemetry.parse.requested',
    context: { sequenceId }
  };
}
