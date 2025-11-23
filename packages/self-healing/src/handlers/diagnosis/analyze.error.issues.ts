import { TelemetryEvent, Anomaly, ErrorIssue } from '../../types/index';

export interface AnalyzeErrorIssuesResult extends TelemetryEvent { context: { issues: ErrorIssue[]; count: number; scoring: string; }; }

export function analyzeErrorIssues(anomalies: Anomaly[]): AnalyzeErrorIssuesResult {
  if (!Array.isArray(anomalies)) throw new Error('anomalies array required');
  const issues: ErrorIssue[] = anomalies
    .filter(a => a.type === 'error')
    .map(a => {
      const errorRate = typeof a.metrics?.errorRate === 'number' ? a.metrics.errorRate : undefined;
      const pattern = typeof a.metrics?.pattern === 'string' ? a.metrics.pattern : undefined;
      let severity = a.severity;
      if (errorRate !== undefined) {
        if (errorRate >= 0.25) severity = 'critical';
        else if (errorRate >= 0.15 && severity !== 'critical') severity = 'high';
        else if (errorRate >= 0.08 && severity === 'low') severity = 'medium';
      }
      return {
        anomalyId: a.id,
        handler: a.handler,
        errorRate,
        pattern,
        severity,
        description: a.description || 'error pattern anomaly'
      };
    });
  return {
    timestamp: new Date().toISOString(),
    handler: 'analyzeErrorIssues',
    event: 'diagnosis.analyze.error.issues',
    context: { issues, count: issues.length, scoring: 'error-rules-v1' }
  };
}

export default analyzeErrorIssues;
