import { TelemetryEvent, SeverityLevel, DiagnosisSlice } from '../../types/index';

export interface AggregateDiagnosisResult extends TelemetryEvent {
  context: {
    groups: { performance: number; behavioral: number; coverage: number; error: number };
    highestSeverity: SeverityLevel;
    totalIssues: number;
    priorities: { type: string; severity: SeverityLevel; count: number }[];
  };
}

function severityRank(sev: SeverityLevel): number {
  switch (sev) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

export function aggregateDiagnosis(slice: DiagnosisSlice): AggregateDiagnosisResult {
  if (!slice || !Array.isArray(slice.performanceIssues)) throw new Error('slice with issue arrays required');
  const groups = {
    performance: slice.performanceIssues.length,
    behavioral: slice.behavioralIssues.length,
    coverage: slice.coverageIssues.length,
    error: slice.errorIssues.length
  };
  const allIssues = [
    ...slice.performanceIssues.map(i => ({ type: 'performance', severity: i.severity })),
    ...slice.behavioralIssues.map(i => ({ type: 'behavioral', severity: i.severity })),
    ...slice.coverageIssues.map(i => ({ type: 'coverage', severity: i.severity })),
    ...slice.errorIssues.map(i => ({ type: 'error', severity: i.severity }))
  ];
  const highestSeverity: SeverityLevel = allIssues.reduce<SeverityLevel>((acc, cur) =>
    severityRank(cur.severity) > severityRank(acc) ? cur.severity : acc
  , 'low');
  const totalIssues = allIssues.length;
  // Build priorities summary (higher severity first, then count desc)
  const typeMap: Record<string, { type: string; severity: SeverityLevel; count: number }> = {};
  for (const issue of allIssues) {
    if (!typeMap[issue.type]) typeMap[issue.type] = { type: issue.type, severity: issue.severity, count: 0 };
    typeMap[issue.type].count++;
    // Elevate category severity if this issue is higher
    if (severityRank(issue.severity) > severityRank(typeMap[issue.type].severity)) {
      typeMap[issue.type].severity = issue.severity;
    }
  }
  const priorities = Object.values(typeMap).sort((a, b) => {
    const sevDiff = severityRank(b.severity) - severityRank(a.severity);
    return sevDiff !== 0 ? sevDiff : b.count - a.count;
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'aggregateDiagnosis',
    event: 'diagnosis.aggregate',
    context: { groups, highestSeverity, totalIssues, priorities }
  };
}

export default aggregateDiagnosis;