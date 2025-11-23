import { TelemetryEvent, DiagnosisSlice } from '../../types/index';

export interface AnalyzeCompletedResult extends TelemetryEvent { context: { sequenceId: string; performanceIssueCount: number; }; }

export function analyzeCompleted(sequenceId: string, slice: DiagnosisSlice): AnalyzeCompletedResult {
  return {
    timestamp: new Date().toISOString(),
    handler: 'analyzeCompleted',
    event: 'diagnosis.analyze.completed',
    context: { sequenceId, performanceIssueCount: slice.performanceIssues.length }
  };
}

export default analyzeCompleted;