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
  const normalized = events.map(e => {
    let ts = e.timestamp.trim();
    // If format starts with month name (e.g., Nov 22 2025 13:00:10), attempt parse via Date
    if (/^[A-Za-z]{3}\s\d{1,2}\s\d{4}\s/.test(ts)) {
      const d = new Date(ts.replace(' ', ' '));
      if (!isNaN(d.getTime())) ts = d.toISOString();
    }
    if (!ts.includes('T')) {
      // Replace slashes with dashes and space between date/time with 'T'
      ts = ts.replace(/\//g, '-');
      // If pattern like YYYY-MM-DD HH:MM:SS
      ts = ts.replace(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})$/, '$1T$2Z');
    }
    // Fallback: if still no 'T' but parseable by Date
    if (!/\d{4}-\d{2}-\d{2}T/.test(ts)) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) ts = d.toISOString();
    }
    return { ...e, timestamp: ts } as TelemetryEvent;
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'normalizeTelemetryData',
    event: 'telemetry.normalize.data',
    context: { normalized }
  };
}
