import { describe, it, expect } from 'vitest';
import { storeDiagnosis } from '../../src/handlers/diagnosis/store.diagnosis';
import * as fs from 'fs';

/**
 * Business BDD Test: storeDiagnosis
 * 
 * User Story:
 * As a Platform Team
 * I want to Persist diagnosis results
 * 
 * Handler Type: storeDiagnosis
 * Sequence: diagnosis
 * 
 * This test validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Business BDD: storeDiagnosis', () => {

  describe('Scenario: Store diagnosis results for fix generation', () => {
    it('persists diagnosis slice (all issue arrays present) and exposes file path (Given aggregated slice, When store runs, Then fix generation can proceed)', () => {
      const slice = {
        performanceIssues: [{ anomalyId: 'a1', severity: 'high', description: 'Latency spike' }],
        behavioralIssues: [],
        coverageIssues: [],
        errorIssues: [],
        generatedAt: new Date().toISOString(),
        sequenceId: 'diag-seq-2'
      };
      const evt = storeDiagnosis(slice as any);
      expect(evt.context.stored).toBe(true);
      expect(fs.existsSync(evt.context.filePath)).toBe(true);
      const raw = JSON.parse(fs.readFileSync(evt.context.filePath, 'utf8'));
      expect(raw.slice.performanceIssues.length).toBe(1);
      expect(Array.isArray(raw.slice.behavioralIssues)).toBe(true);
      expect(Array.isArray(raw.slice.coverageIssues)).toBe(true);
      expect(Array.isArray(raw.slice.errorIssues)).toBe(true);
    });
  });
});
