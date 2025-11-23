import { TelemetryEvent } from '../../types/index';

export interface NormalizeDataResult extends TelemetryEvent {
  context: {
    normalized: TelemetryEvent[];
    dropped: number;
  };
}

function normalizeTimestamp(raw: string): string {
  let ts = (raw || '').trim();
  if (!ts) return new Date().toISOString();
  // Month name format e.g. Nov 22 2025 13:00:10
  if (/^[A-Za-z]{3}\s\d{1,2}\s\d{4}\s\d{2}:\d{2}:\d{2}/.test(ts)) {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  // Plain date time e.g. 2025-11-22 13:00:10
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(ts)) {
    return ts.replace(' ', 'T') + 'Z';
  }
  // Epoch milliseconds
  if (/^\d{13}$/.test(ts)) {
    const d = new Date(Number(ts));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  // If already ISO-like
  if (/^\d{4}-\d{2}-\d{2}T/.test(ts)) return ts;
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

/**
 * Normalizes raw telemetry events into a consistent schema; drops clearly invalid structures.
 */
export function normalizeTelemetryData(events: TelemetryEvent[]): NormalizeDataResult {
  if (!Array.isArray(events)) throw new Error('events must be an array');
  let dropped = 0;
  const normalized = events.map(e => {
    try {
      const ts = normalizeTimestamp(e.timestamp);
      const handler = e.handler?.trim() || 'unknown';
      const eventName = e.event?.trim() || 'unknown.event';
      return { ...e, timestamp: ts, handler, event: eventName } as TelemetryEvent;
    } catch {
      dropped++;
      return null;
    }
  }).filter(Boolean) as TelemetryEvent[];
  return {
    timestamp: new Date().toISOString(),
    handler: 'normalizeTelemetryData',
    event: 'telemetry.normalize.data',
    context: { normalized, dropped }
  };
}
