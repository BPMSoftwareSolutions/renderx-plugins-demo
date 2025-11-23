import { TelemetryEvent, Anomaly, CoverageIssue } from '../../types/index';

export interface AnalyzeCoverageIssuesResult extends TelemetryEvent { context: { issues: CoverageIssue[]; count: number; scoring: string; }; }

export function analyzeCoverageIssues(anomalies: Anomaly[]): AnalyzeCoverageIssuesResult {
  if (!Array.isArray(anomalies)) throw new Error('anomalies array required');
  const issues: CoverageIssue[] = anomalies
    .filter(a => a.type === 'coverage')
    .map(a => {
      const untested = typeof a.metrics?.untestedPaths === 'number' ? a.metrics.untestedPaths : undefined;
      const coveragePercent = typeof a.metrics?.coveragePercent === 'number' ? a.metrics.coveragePercent : undefined;
      let severity = a.severity;
      if (coveragePercent !== undefined) {
        if (coveragePercent < 40) severity = 'critical';
        else if (coveragePercent < 60 && severity !== 'critical') severity = 'high';
        else if (coveragePercent < 75 && severity === 'low') severity = 'medium';
      }
      return {
        anomalyId: a.id,
        handler: a.handler,
        untestedPaths: untested,
        coveragePercent,
        severity,
        description: a.description || 'coverage gap anomaly'
      };
    });
  return {
    timestamp: new Date().toISOString(),
    handler: 'analyzeCoverageIssues',
    event: 'diagnosis.analyze.coverage.issues',
    context: { issues, count: issues.length, scoring: 'coverage-rules-v1' }
  };
}

export default analyzeCoverageIssues;
