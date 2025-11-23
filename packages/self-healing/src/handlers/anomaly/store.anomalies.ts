import { TelemetryEvent, Anomaly } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export interface StoreAnomaliesResult extends TelemetryEvent { context: { filePath: string; count: number; }; }

/**
 * Persists anomalies to a generated JSON file for later diagnosis sequence.
 */
export function storeAnomalies(anomalies: Anomaly[], outDir: string = path.resolve(process.cwd(), '.generated')): StoreAnomaliesResult {
  if (!Array.isArray(anomalies)) throw new Error('anomalies must be array');
  try {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const filePath = path.join(outDir, 'anomalies.json');
    fs.writeFileSync(filePath, JSON.stringify({ timestamp: new Date().toISOString(), anomalies }, null, 2));
    return {
      timestamp: new Date().toISOString(),
      handler: 'storeAnomalies',
      event: 'anomaly.store.anomalies',
      context: { filePath, count: anomalies.length }
    };
  } catch (err: any) {
    return {
      timestamp: new Date().toISOString(),
      handler: 'storeAnomalies',
      event: 'anomaly.store.anomalies',
      error: err?.message || 'persist-failed',
      context: { filePath: '', count: anomalies.length }
    };
  }
}
