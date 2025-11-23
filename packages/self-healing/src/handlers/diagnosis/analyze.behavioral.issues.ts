import { TelemetryEvent, Anomaly, BehavioralIssue } from '../../types/index';

export interface AnalyzeBehavioralIssuesResult extends TelemetryEvent { context: { issues: BehavioralIssue[]; count: number; scoring: string; }; }

export function analyzeBehavioralIssues(anomalies: Anomaly[]): AnalyzeBehavioralIssuesResult {
  if (!Array.isArray(anomalies)) throw new Error('anomalies array required');
  const issues: BehavioralIssue[] = anomalies
    .filter(a => a.type === 'behavioral')
    .map(a => {
      const missingHandlers: string[] | undefined = Array.isArray(a.metrics?.missingHandlers) ? a.metrics.missingHandlers : undefined;
      const outOfOrder: boolean = !!a.metrics?.outOfOrder;
      // Severity escalation heuristic
      let severity = a.severity;
      if (missingHandlers && missingHandlers.length >= 3 && severity !== 'critical') severity = 'high';
      if (outOfOrder && severity === 'low') severity = 'medium';
      return {
        anomalyId: a.id,
        handler: a.handler,
        sequence: a.sequence,
        missingHandlers,
        outOfOrder,
        severity,
        description: a.description || 'behavioral anomaly'
      };
    });
  return {
    timestamp: new Date().toISOString(),
    handler: 'analyzeBehavioralIssues',
    event: 'diagnosis.analyze.behavioral.issues',
    context: { issues, count: issues.length, scoring: 'behavioral-rules-v1' }
  };
}

export default analyzeBehavioralIssues;
