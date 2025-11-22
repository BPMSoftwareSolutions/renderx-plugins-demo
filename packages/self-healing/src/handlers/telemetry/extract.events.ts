import { TelemetryEvent } from '../../types/index';

export interface ExtractEventsResult extends TelemetryEvent {
  context: {
    rawCount: number;
    events: TelemetryEvent[];
  };
}

/**
 * Extracts telemetry events from raw log representations. Stub returns empty.
 */
export function extractTelemetryEvents(rawLogs: { path: string; content: string }[]): ExtractEventsResult {
  if (!Array.isArray(rawLogs)) throw new Error('rawLogs must be an array');
  return {
    timestamp: new Date().toISOString(),
    handler: 'extractTelemetryEvents',
    event: 'telemetry.extract.events',
    context: { rawCount: rawLogs.length, events: [] }
  };
}
