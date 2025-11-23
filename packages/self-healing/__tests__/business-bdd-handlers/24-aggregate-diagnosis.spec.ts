import { describe, it, expect } from 'vitest';
import { aggregateDiagnosis } from '../../src/handlers/diagnosis/aggregate.diagnosis';
import { DiagnosisSlice } from '../../src/types';

/**
 * Business BDD Test: aggregateDiagnosis
 * 
 * User Story:
 * As a Platform Team
 * I want to Consolidate diagnosis results
 * 
 * Handler Type: aggregateDiagnosis
 * Sequence: diagnosis
 * 
 * This test validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Business BDD: aggregateDiagnosis', () => {
  describe('Scenario: Combine multiple diagnoses into coherent report', () => {
    it('groups issues and derives highest severity & prioritized categories', () => {
      // GIVEN multiple issue types detected
      const slice: DiagnosisSlice = {
        performanceIssues: [
          { anomalyId: 'a1', handler: 'h1', latencyRatio: 3.2, severity: 'high', description: 'perf spike' }
        ],
        behavioralIssues: [
          { anomalyId: 'a2', handler: 'h2', sequence: 'seq1', missingHandlers: ['x','y','z'], outOfOrder: true, severity: 'medium', description: 'seq order' }
        ],
        coverageIssues: [
          { anomalyId: 'a3', handler: 'h3', untestedPaths: 5, coveragePercent: 42, severity: 'high', description: 'low coverage' }
        ],
        errorIssues: [
          { anomalyId: 'a4', handler: 'h4', errorRate: 0.28, pattern: 'timeout', severity: 'critical', description: 'error burst' }
        ],
        generatedAt: new Date().toISOString(),
        sequenceId: 'diagnosis-analyze'
      };

      // WHEN aggregation handler processes diagnoses
      const result = aggregateDiagnosis(slice);

      // THEN diagnoses should be grouped, priorities assigned, report generated
      expect(result).toBeDefined();
      expect(result.context.groups).toEqual({ performance: 1, behavioral: 1, coverage: 1, error: 1 });
      expect(result.context.totalIssues).toBe(4);
      expect(result.context.highestSeverity).toBe('critical');
      // priority list should start with error (critical severity)
      expect(result.context.priorities[0].type).toBe('error');
      expect(result.context.priorities[0].severity).toBe('critical');
      // all categories represented
      const types = result.context.priorities.map(p => p.type).sort();
      expect(types).toEqual(['behavioral','coverage','error','performance'].sort());
    });
  });
});
