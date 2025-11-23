import { analyzeRequested } from './analyze.requested';
import { loadAnomalies } from './load.anomalies';
import { loadCodebaseInfo } from './load.codebase.info';
import { analyzePerformanceIssues } from './analyze.performance.issues';
import { analyzeBehavioralIssues } from './analyze.behavioral.issues';
import { analyzeCoverageIssues } from './analyze.coverage.issues';
import { analyzeErrorIssues } from './analyze.error.issues';
import { aggregateDiagnosis } from './aggregate.diagnosis';
import { assessImpact } from './assess.impact';
import { recommendFixes } from './recommend.fixes';
import { storeDiagnosis } from './store.diagnosis';
import { analyzeCompleted } from './analyze.completed';
import { DiagnosisSlice } from '../../types/index';

export interface RunDiagnosisAnalyzeSummary {
  requested: ReturnType<typeof analyzeRequested>;
  anomalies: ReturnType<typeof loadAnomalies>;
  codebase: ReturnType<typeof loadCodebaseInfo>;
  performance: ReturnType<typeof analyzePerformanceIssues>;
  behavioral: ReturnType<typeof analyzeBehavioralIssues>;
  coverage: ReturnType<typeof analyzeCoverageIssues>;
  error: ReturnType<typeof analyzeErrorIssues>;
  aggregated: ReturnType<typeof aggregateDiagnosis>;
  impact: ReturnType<typeof assessImpact>;
  recommendations: ReturnType<typeof recommendFixes>;
  store: ReturnType<typeof storeDiagnosis>;
  completed: ReturnType<typeof analyzeCompleted>;
  slice: DiagnosisSlice;
}

export interface RunDiagnosisAnalyzeOptions { sequenceId?: string; }

export function runDiagnosisAnalyze(options: RunDiagnosisAnalyzeOptions = {}): RunDiagnosisAnalyzeSummary {
  const { sequenceId = 'diagnosis-analyze' } = options;
  const requested = analyzeRequested(sequenceId);
  const anomalies = loadAnomalies();
  const codebase = loadCodebaseInfo(); // not used yet, reserved for future heuristics
  const performance = analyzePerformanceIssues(anomalies.context.anomalies);
  const behavioral = analyzeBehavioralIssues(anomalies.context.anomalies);
  const coverage = analyzeCoverageIssues(anomalies.context.anomalies);
  const error = analyzeErrorIssues(anomalies.context.anomalies);
  const slice: DiagnosisSlice = {
    performanceIssues: performance.context.issues,
    behavioralIssues: behavioral.context.issues,
    coverageIssues: coverage.context.issues,
    errorIssues: error.context.issues,
    generatedAt: new Date().toISOString(),
    sequenceId
  };
  const aggregated = aggregateDiagnosis(slice);
  const impact = assessImpact(slice);
  slice.impact = impact.context.impact;
  const recommendations = recommendFixes(slice);
  slice.recommendations = recommendations.context.recommendations;
  const store = storeDiagnosis(slice);
  const completed = analyzeCompleted(sequenceId, slice);
  return { requested, anomalies, codebase, performance, behavioral, coverage, error, aggregated, impact, recommendations, store, completed, slice };
}

export default runDiagnosisAnalyze;