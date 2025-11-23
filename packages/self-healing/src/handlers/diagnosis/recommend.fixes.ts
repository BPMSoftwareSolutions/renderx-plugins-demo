import { TelemetryEvent, DiagnosisSlice, FixRecommendation } from '../../types/index';

export interface RecommendFixesResult extends TelemetryEvent { context: { recommendations: FixRecommendation[]; count: number; strategy: string; }; }

let recommendationCounter = 0;
function nextId() { return `fix-${++recommendationCounter}`; }

export function recommendFixes(slice: DiagnosisSlice): RecommendFixesResult {
  const recs: FixRecommendation[] = [];
  // Performance fixes
  slice.performanceIssues.forEach(i => {
    recs.push({
      id: nextId(),
      type: 'code',
      description: `Optimize handler ${i.handler} to reduce latency ratio ${i.latencyRatio ?? 'unknown'}`,
      priority: i.severity === 'critical' ? 1 : i.severity === 'high' ? 2 : 3,
      estimatedEffort: i.severity === 'critical' ? 8 : 4,
      expectedBenefit: 'Latency reduction and improved throughput',
      implementation: 'Profile hotspots; apply caching or batching'
    });
  });
  // Behavioral fixes
  slice.behavioralIssues.forEach(i => {
    if (i.missingHandlers && i.missingHandlers.length) {
      recs.push({
        id: nextId(),
        type: 'sequence',
        description: `Add missing handlers: ${i.missingHandlers.join(', ')}`,
        priority: 2,
        estimatedEffort: i.missingHandlers.length * 2,
        expectedBenefit: 'Restores sequence integrity',
        implementation: 'Update orchestrator to include required handlers in order'
      });
    }
    if (i.outOfOrder) {
      recs.push({
        id: nextId(),
        type: 'sequence',
        description: `Correct execution order for handler ${i.handler}`,
        priority: 3,
        estimatedEffort: 2,
        expectedBenefit: 'Prevents dependency race conditions',
        implementation: 'Adjust run sequence definition; add ordering assertion test'
      });
    }
  });
  // Coverage fixes
  slice.coverageIssues.forEach(i => {
    recs.push({
      id: nextId(),
      type: 'test',
      description: `Increase coverage for handler ${i.handler} to >=80% (current ${i.coveragePercent ?? 'unknown'}%)`,
      priority: i.severity === 'critical' ? 1 : 2,
      estimatedEffort: 5,
      expectedBenefit: 'Reduced regression risk',
      implementation: 'Add unit + integration tests for untested paths'
    });
  });
  // Error fixes
  slice.errorIssues.forEach(i => {
    recs.push({
      id: nextId(),
      type: 'code',
      description: `Address error pattern ${i.pattern ?? 'unknown'} in handler ${i.handler}`,
      priority: i.severity === 'critical' ? 1 : 2,
      estimatedEffort: 6,
      expectedBenefit: 'Improved reliability and lower error rate',
      implementation: 'Trace stack, add guards, improve retry logic'
    });
  });
  return {
    timestamp: new Date().toISOString(),
    handler: 'recommendFixes',
    event: 'diagnosis.recommend.fixes',
    context: { recommendations: recs, count: recs.length, strategy: 'heuristic-v1' }
  };
}

export default recommendFixes;
