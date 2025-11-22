import { TelemetryEvent } from '../../types/index';

export interface NormalizeDataResult extends TelemetryEvent {
  context: {
    normalized: TelemetryEvent[];
  };
}

/**
 * Normalizes raw telemetry events into a consistent schema.
 */
export function normalizeTelemetryData(events: TelemetryEvent[]): NormalizeDataResult {
  if (!Array.isArray(events)) throw new Error('events must be an array');
  // Stub: passthrough
  return {
    timestamp: new Date().toISOString(),
    handler: 'normalizeTelemetryData',
    event: 'telemetry.normalize.data',
    context: { normalized: events }
  };
}
