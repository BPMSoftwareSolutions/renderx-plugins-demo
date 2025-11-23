import { TelemetryEvent, Anomaly } from '../../types';

export interface AggregateAnomaliesResult extends TelemetryEvent { context: { anomalies: Anomaly[]; counts: Record<string, number>; severity: Record<string, number>; }; }

/**
 * Aggregates anomalies from multiple detection passes into a single consolidated list.
 */
export function aggregateAnomalies(...groups: { anomalies: Anomaly[] }[]): AggregateAnomaliesResult {
  const consolidated: Anomaly[] = [];
  groups.forEach(g => { if (g?.anomalies?.length) consolidated.push(...g.anomalies); });
  const counts: Record<string, number> = {};
  const severity: Record<string, number> = {};
  consolidated.forEach(a => {
    counts[a.type] = (counts[a.type] || 0) + 1;
    severity[a.severity] = (severity[a.severity] || 0) + 1;
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'aggregateAnomalies',
    event: 'anomaly.aggregate.anomalies',
    context: { anomalies: consolidated, counts, severity }
  };
}
