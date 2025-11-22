import { TelemetryEvent } from '../../types/index';

export interface LoadLogsResult extends TelemetryEvent {
  context: {
    paths: string[];
    files: { path: string; size: number; content: string }[];
  };
}

/**
 * Loads raw log files given paths. For now returns empty content placeholders.
 */
export async function loadLogFiles(paths: string[]): Promise<LoadLogsResult> {
  if (!Array.isArray(paths)) throw new Error('paths must be an array');
  return {
    timestamp: new Date().toISOString(),
    handler: 'loadLogFiles',
    event: 'telemetry.load.logs',
    context: { paths, files: paths.map(p => ({ path: p, size: 0, content: '' })) }
  };
}
