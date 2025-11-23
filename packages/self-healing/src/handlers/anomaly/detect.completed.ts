import { TelemetryEvent, Anomaly } from '../../types';

export interface DetectCompletedResult extends TelemetryEvent { context: { total: number; byType: Record<string, number>; bySeverity: Record<string, number>; sequenceId: string; }; }

export function detectAnomaliesCompleted(sequenceId: string, anomalies: Anomaly[]): DetectCompletedResult {
  if (!sequenceId) throw new Error('sequenceId required');
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  anomalies.forEach(a => {
    byType[a.type] = (byType[a.type] || 0) + 1;
    bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'detectAnomaliesCompleted',
    event: 'anomaly.detect.completed',
    context: { total: anomalies.length, byType, bySeverity, sequenceId }
  };
}
