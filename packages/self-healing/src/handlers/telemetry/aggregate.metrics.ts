import { TelemetryEvent, TelemetryMetrics } from '../../types/index';

export interface AggregateMetricsResult extends TelemetryEvent {
  context: {
    metrics: TelemetryMetrics;
    handlersCount: number;
  };
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

/**
 * Aggregates telemetry into metrics object computing counts, avg, p95, p99 and errorRate per handler.
 */
export function aggregateTelemetryMetrics(events: TelemetryEvent[]): AggregateMetricsResult {
  if (!Array.isArray(events)) throw new Error('events must be an array');
  const byHandler: Record<string, TelemetryEvent[]> = {};
  for (const e of events) {
    const h = e.handler || 'unknown';
    (byHandler[h] ||= []).push(e);
  }
  const handlers: TelemetryMetrics['handlers'] = {};
  Object.entries(byHandler).forEach(([handlerName, list]) => {
    const durations = list.map(l => l.duration).filter(d => typeof d === 'number') as number[];
    durations.sort((a, b) => a - b);
    const errors = list.filter(l => l.error).length;
    const count = list.length;
    const avgTime = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const p95Time = percentile(durations, 95);
    const p99Time = percentile(durations, 99);
    const errorRate = count ? errors / count : 0;
    const lastSeen = list.reduce((latest, l) => (l.timestamp > latest ? l.timestamp : latest), '');
    handlers[handlerName] = { count, avgTime, p95Time, p99Time, errorRate, lastSeen };
  });
  const metrics: TelemetryMetrics = {
    handlers,
    sequences: {}, // sequence metrics can be added once sequence attribution exists
    timestamp: new Date().toISOString(),
    totalEvents: events.length
  };
  return {
    timestamp: new Date().toISOString(),
    handler: 'aggregateTelemetryMetrics',
    event: 'telemetry.aggregate.metrics',
    context: { metrics, handlersCount: Object.keys(handlers).length }
  };
}
