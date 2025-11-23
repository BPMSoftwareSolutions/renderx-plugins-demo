import { TelemetryEvent, DiagnosisSlice } from '../../types/index';
import * as fs from 'fs';
import * as path from 'path';

export interface StoreDiagnosisResult extends TelemetryEvent { context: { filePath: string; stored: boolean; error?: string; slice: DiagnosisSlice; }; }

function resolveDiagnosisPath(): string {
  return path.resolve(process.cwd(), '.generated', 'diagnosis-results.json');
}

export function storeDiagnosis(slice: DiagnosisSlice): StoreDiagnosisResult {
  if (!slice || !Array.isArray(slice.performanceIssues) || !Array.isArray(slice.behavioralIssues) || !Array.isArray(slice.coverageIssues) || !Array.isArray(slice.errorIssues)) throw new Error('valid extended diagnosis slice required');
  const filePath = resolveDiagnosisPath();
  let stored = false; let error: string | undefined;
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({ timestamp: new Date().toISOString(), slice }, null, 2), 'utf8');
    stored = true;
  } catch (err: any) {
    error = err?.message || 'diagnosis-persist-failed';
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'storeDiagnosis',
    event: 'diagnosis.store.results',
    context: { filePath, stored, error, slice }
  };
}

export default storeDiagnosis;