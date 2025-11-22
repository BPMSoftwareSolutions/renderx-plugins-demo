import { TelemetryEvent, TelemetryMetrics } from '../../types/index';

export interface AggregateMetricsResult extends TelemetryEvent {
  context: {
    metrics: TelemetryMetrics;
  };
}

/**
 * Aggregates telemetry into metrics object. Stub builds empty baseline.
 */
export function aggregateTelemetryMetrics(events: TelemetryEvent[]): AggregateMetricsResult {
  if (!Array.isArray(events)) throw new Error('events must be an array');
  const metrics: TelemetryMetrics = {
    handlers: {},
    sequences: {},
    timestamp: new Date().toISOString(),
    totalEvents: events.length
  };
  return {
    timestamp: new Date().toISOString(),
    handler: 'aggregateTelemetryMetrics',
    event: 'telemetry.aggregate.metrics',
    context: { metrics }
  };
}
