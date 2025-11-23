import { loadLogFiles } from './load.logs';
import { extractTelemetryEvents } from './extract.events';
import { normalizeTelemetryData } from './normalize.data';
import { aggregateTelemetryMetrics } from './aggregate.metrics';
import { storeTelemetryDatabase } from './store.database';
import { parseTelemetryRequested } from './parse.requested';
import { parseTelemetryCompleted } from './parse.completed';
import { TelemetryEvent } from '../../types/index';
import * as path from 'path';

export interface TelemetryParseSummary {
  start: TelemetryEvent;
  load: Awaited<ReturnType<typeof loadLogFiles>>;
  extract: ReturnType<typeof extractTelemetryEvents>;
  normalize: ReturnType<typeof normalizeTelemetryData>;
  aggregate: ReturnType<typeof aggregateTelemetryMetrics>;
  store: Awaited<ReturnType<typeof storeTelemetryDatabase>>;
  completed: TelemetryEvent;
}

export interface RunTelemetryParsingOptions {
  /** Directory containing .log files (defaults to project .logs folder). */
  logsDir?: string;
  /** Sequence identifier for traceability. */
  sequenceId?: string;
  /** Max files to process (protect against huge directories). */
  maxFiles?: number;
}

/**
 * High-level orchestration for telemetry parsing sequence.
 */
export async function runTelemetryParsing(options: RunTelemetryParsingOptions = {}): Promise<TelemetryParseSummary> {
  const { logsDir = path.resolve(process.cwd(), '.logs'), sequenceId = 'telemetry-parse', maxFiles = 200 } = options;
  const start = parseTelemetryRequested(sequenceId);
  // Discover and load logs (directory passed as single path)
  const load = await loadLogFiles([logsDir]);
  // Optionally limit number of files for performance
  if (load.context.files.length > maxFiles) {
    load.context.files = load.context.files.slice(0, maxFiles);
  }
  const extract = extractTelemetryEvents(load.context.files.map(f => ({ path: f.path, content: f.content })));
  const normalize = normalizeTelemetryData(extract.context.events);
  const aggregate = aggregateTelemetryMetrics(normalize.context.normalized);
  const store = await storeTelemetryDatabase(aggregate.context.metrics);
  const completed = parseTelemetryCompleted(sequenceId, aggregate.context.metrics);
  return { start, load, extract, normalize, aggregate, store, completed };
}
