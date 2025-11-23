import { TelemetryEvent, ImpactAssessment, DiagnosisSlice, SeverityLevel } from '../../types/index';

export interface AssessImpactResult extends TelemetryEvent { context: { impact: ImpactAssessment }; }

function severityRank(sev: SeverityLevel): number {
  switch (sev) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    default: return 1;
  }
}

export function assessImpact(slice: DiagnosisSlice): AssessImpactResult {
  const totals = {
    performance: slice.performanceIssues.length,
    behavioral: slice.behavioralIssues.length,
    coverage: slice.coverageIssues.length,
    error: slice.errorIssues.length
  };
  const allSeverities: SeverityLevel[] = [
    ...slice.performanceIssues.map(i => i.severity),
    ...slice.behavioralIssues.map(i => i.severity),
    ...slice.coverageIssues.map(i => i.severity),
    ...slice.errorIssues.map(i => i.severity)
  ];
  const overallSeverity = allSeverities.reduce<SeverityLevel>((acc: SeverityLevel, sev: SeverityLevel) =>
    severityRank(sev) > severityRank(acc) ? sev : acc
  , 'low');
  const highestLatencyRatio = slice.performanceIssues.reduce<number | undefined>((acc, i) => i.latencyRatio && (acc === undefined || i.latencyRatio > acc) ? i.latencyRatio : acc, undefined);
  const highestErrorRate = slice.errorIssues.reduce<number | undefined>((acc, i) => i.errorRate && (acc === undefined || i.errorRate > acc) ? i.errorRate : acc, undefined);
  const affectedHandlers = new Set([
    ...slice.performanceIssues.map(i => i.handler),
    ...slice.behavioralIssues.map(i => i.handler),
    ...slice.coverageIssues.map(i => i.handler),
    ...slice.errorIssues.map(i => i.handler)
  ].filter(Boolean)).size;
  const estimatedUsers = overallSeverity === 'critical' ? 1000 : overallSeverity === 'high' ? 500 : overallSeverity === 'medium' ? 200 : 50;
  const rationale = `Severity ${overallSeverity} due to totals perf=${totals.performance}, beh=${totals.behavioral}, cov=${totals.coverage}, err=${totals.error}`;
  const impact: ImpactAssessment = { overallSeverity, totals, highestLatencyRatio, highestErrorRate, affectedHandlers, estimatedUsers, rationale };
  return {
    timestamp: new Date().toISOString(),
    handler: 'assessImpact',
    event: 'diagnosis.assess.impact',
    context: { impact }
  };
}

export default assessImpact;
