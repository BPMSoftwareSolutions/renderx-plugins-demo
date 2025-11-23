import { TelemetryEvent } from '../../types/index';

export interface ExtractEventsResult extends TelemetryEvent {
  context: {
    rawCount: number;
    events: TelemetryEvent[];
    parseErrors: number;
  };
}

interface LineParseContext {
  handler?: string;
  duration?: number;
  error?: string;
  eventName?: string;
}

const TIMESTAMP_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/, // ISO
  /^[A-Za-z]{3}\s\d{1,2}\s\d{4}\s\d{2}:\d{2}:\d{2}/ // MMM DD YYYY HH:MM:SS
];

const SEVERITY_PATTERN = /(INFO|WARN|ERROR|DEBUG)/;
const HANDLER_PATTERN = /(?:handler[:=]\s?)([A-Za-z0-9_.-]+)/;
const DURATION_PATTERN = /duration[:=]\s?(\d+)(ms|s)?/;
const ERROR_PATTERN = /(ERROR)\s+-?\s?(.*)$/;

function parseLine(line: string): TelemetryEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  // Attempt JSON parse first if looks like JSON.
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const obj = JSON.parse(trimmed);
      if (obj && obj.timestamp && obj.event) {
        return {
          timestamp: String(obj.timestamp),
          handler: String(obj.handler || 'unknown'),
          event: String(obj.event),
          duration: typeof obj.duration === 'number' ? obj.duration : undefined,
          error: obj.error ? String(obj.error) : undefined,
          context: obj.context && typeof obj.context === 'object' ? obj.context : {}
        };
      }
    } catch {/* fall through */}
  }
  // Extract timestamp if present
  let timestamp = new Date().toISOString();
  for (const pattern of TIMESTAMP_PATTERNS) {
    const m = trimmed.match(pattern);
    if (m) {
      timestamp = m[0];
      break;
    }
  }
  const severityMatch = trimmed.match(SEVERITY_PATTERN);
  const handlerMatch = trimmed.match(HANDLER_PATTERN);
  const durationMatch = trimmed.match(DURATION_PATTERN);
  const errorMatch = trimmed.match(ERROR_PATTERN);
  const ctx: LineParseContext = {};
  if (handlerMatch) ctx.handler = handlerMatch[1];
  if (durationMatch) {
    const value = parseInt(durationMatch[1], 10);
    ctx.duration = durationMatch[2] === 's' ? value * 1000 : value;
  }
  if (errorMatch) ctx.error = errorMatch[2];
  const eventName = severityMatch ? 'log.' + severityMatch[1].toLowerCase() : 'log.line';
  ctx.eventName = eventName;
  return {
    timestamp,
    handler: ctx.handler || 'unknown',
    event: ctx.eventName,
    duration: ctx.duration,
    error: ctx.error,
    context: { raw: trimmed }
  };
}

/**
 * Extracts telemetry events from raw log representations.
 */
export function extractTelemetryEvents(rawLogs: { path: string; content: string }[]): ExtractEventsResult {
  if (!Array.isArray(rawLogs)) throw new Error('rawLogs must be an array');
  const events: TelemetryEvent[] = [];
  let parseErrors = 0;
  for (const file of rawLogs) {
    if (!file.content) continue;
    const lines = file.content.split(/\r?\n/);
    for (const line of lines) {
      try {
        const evt = parseLine(line);
        if (evt) events.push(evt);
      } catch {
        parseErrors++;
      }
    }
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'extractTelemetryEvents',
    event: 'telemetry.extract.events',
    context: { rawCount: rawLogs.length, events, parseErrors }
  };
}
