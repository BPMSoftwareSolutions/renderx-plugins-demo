import { TelemetryEvent, TelemetryMetrics } from '../../types/index';
import * as fs from 'fs';
import * as path from 'path';

export interface StoreDatabaseResult extends TelemetryEvent {
  context: {
    stored: boolean;
    metrics: TelemetryMetrics;
    filePath: string;
    error?: string;
  };
}

function resolveMetricsPath(): string {
  // Store inside package .generated for easy inspection
  return path.resolve(__dirname, '../../../.generated/telemetry-metrics.json');
}

/**
 * Persists telemetry metrics to JSON file. Future enhancement: swap to SQLite or external DB.
 */
export async function storeTelemetryDatabase(metrics: TelemetryMetrics): Promise<StoreDatabaseResult> {
  if (!metrics || typeof metrics !== 'object') throw new Error('metrics object required');
  const filePath = resolveMetricsPath();
  let stored = false;
  let error: string | undefined;
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ metrics }, null, 2), 'utf8');
    stored = true;
  } catch (err: any) {
    error = err?.message || 'unknown';
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'storeTelemetryDatabase',
    event: 'telemetry.store.database',
    context: { stored, metrics, filePath, error }
  };
}
