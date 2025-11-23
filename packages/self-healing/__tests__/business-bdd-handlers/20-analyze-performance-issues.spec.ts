import { describe, it, expect } from 'vitest';
import { analyzePerformanceIssues } from '../../src/handlers/diagnosis/analyze.performance.issues';
import { Anomaly } from '../../src/types';

/**
 * Business BDD Test: analyzePerformanceIssues
 * 
 * User Story:
 * As a Platform Team
 * I want to Diagnose performance problems
 * 
 * Handler Type: analyzePerformanceIssues
 * Sequence: diagnosis
 * 
 * This test validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Business BDD: analyzePerformanceIssues', () => {
  describe('Scenario: Analyze performance anomalies to find root cause', () => {
    it('classifies latency spike severity and emits issue list', () => {
      // GIVEN a performance anomaly with high latency ratio
      const anomalies: Anomaly[] = [
        {
          id: 'perf1', type: 'performance', severity: 'low', handler: 'handlerA', description: 'latency spike',
          metrics: { latencyRatio: 3.4 }, detectedAt: new Date().toISOString(), confidence: 0.91
        }
      ];
      // WHEN performance analysis executes
      const result = analyzePerformanceIssues(anomalies);
      // THEN issue list produced with escalated severity & scoring metadata
      expect(result.context.issues.length).toBe(1);
      expect(result.context.issues[0].severity).toBe('high'); // escalated from low due to ratio >=3
      expect(result.context.scoring).toMatch(/latency-ratio/);
      expect(result.handler).toBe('analyzePerformanceIssues');
    });
  });
});
