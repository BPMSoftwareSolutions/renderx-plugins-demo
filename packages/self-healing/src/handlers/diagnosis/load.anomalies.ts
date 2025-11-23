import { TelemetryEvent, Anomaly } from '../../types/index';
import * as fs from 'fs';
import * as path from 'path';

export interface LoadAnomaliesResult extends TelemetryEvent {
  context: {
    anomalies: Anomaly[];
    count: number;
    filePath: string;
    missing: boolean;
    error?: string;
  };
}

function resolveAnomaliesPath(): string {
  // Align with anomaly store output (.generated/anomalies.json at project root)
  return path.resolve(process.cwd(), '.generated', 'anomalies.json');
}

/**
 * Loads previously detected anomalies for diagnosis. Gracefully degrades if file is missing
 * by returning an empty list (allowing upstream to proceed and potentially note absence).
 */
export function loadAnomalies(): LoadAnomaliesResult {
  const filePath = resolveAnomaliesPath();
  let anomalies: Anomaly[] = [];
  let missing = false;
  let error: string | undefined;
  try {
    if (!fs.existsSync(filePath)) {
      missing = true;
    } else {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      anomalies = Array.isArray(raw?.anomalies) ? raw.anomalies : [];
    }
  } catch (err: any) {
    error = err?.message || 'read-failed';
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'loadAnomalies',
    event: 'diagnosis.load.anomalies',
    context: { anomalies, count: anomalies.length, filePath, missing, error }
  };
}

export default loadAnomalies;