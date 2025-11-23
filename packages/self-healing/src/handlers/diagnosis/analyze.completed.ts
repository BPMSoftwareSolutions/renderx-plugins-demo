import { TelemetryEvent, DiagnosisSlice } from '../../types/index';

export interface AnalyzeCompletedResult extends TelemetryEvent { context: { sequenceId: string; performanceIssueCount: number; behavioralIssueCount: number; coverageIssueCount: number; errorIssueCount: number; recommendationCount: number; overallSeverity?: string; }; }

export function analyzeCompleted(sequenceId: string, slice: DiagnosisSlice): AnalyzeCompletedResult {
  return {
    timestamp: new Date().toISOString(),
    handler: 'analyzeCompleted',
    event: 'diagnosis.analyze.completed',
    context: {
      sequenceId,
      performanceIssueCount: slice.performanceIssues.length,
      behavioralIssueCount: slice.behavioralIssues.length,
      coverageIssueCount: slice.coverageIssues.length,
      errorIssueCount: slice.errorIssues.length,
      recommendationCount: slice.recommendations ? slice.recommendations.length : 0,
      overallSeverity: slice.impact?.overallSeverity
    }
  };
}

export default analyzeCompleted;