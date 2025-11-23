import { TelemetryEvent, Anomaly, PerformanceIssue } from '../../types/index';

export interface AnalyzePerformanceIssuesResult extends TelemetryEvent { context: { issues: PerformanceIssue[]; count: number; scoring: string; }; }

export function analyzePerformanceIssues(anomalies: Anomaly[]): AnalyzePerformanceIssuesResult {
  if (!Array.isArray(anomalies)) throw new Error('anomalies array required');
  const issues: PerformanceIssue[] = anomalies
    .filter(a => a.type === 'performance')
    .map(a => {
      const latencyRatio = a.metrics?.latencyRatio;
      let severity: PerformanceIssue['severity'] = a.severity;
      // Simple normalization based on latencyRatio
      if (typeof latencyRatio === 'number') {
        if (latencyRatio >= 5) severity = 'critical';
        else if (latencyRatio >= 3) severity = 'high';
        else if (latencyRatio >= 2) severity = 'medium';
        else severity = 'low';
      }
      return {
        anomalyId: a.id,
        handler: a.handler,
        latencyRatio,
        severity,
        description: a.description || 'performance anomaly'
      };
    });
  return {
    timestamp: new Date().toISOString(),
    handler: 'analyzePerformanceIssues',
    event: 'diagnosis.analyze.performance.issues',
    context: { issues, count: issues.length, scoring: 'latency-ratio-v1' }
  };
}

export default analyzePerformanceIssues;