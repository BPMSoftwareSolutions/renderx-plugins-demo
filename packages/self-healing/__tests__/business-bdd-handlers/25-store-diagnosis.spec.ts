import { describe, it, expect } from 'vitest';
import { storeDiagnosis } from '../../src/handlers/diagnosis/store.diagnosis';
import * as fs from 'fs';
import * as path from 'path';

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
    it('persists performance issues slice and exposes file path (Given aggregated slice, When store runs, Then fix generation can proceed)', () => {
      const slice = { performanceIssues: [{ anomalyId: 'a1', severity: 'high', description: 'Latency spike' }], generatedAt: new Date().toISOString(), sequenceId: 'diag-seq-2' };
      // @ts-ignore minimal shape
      const evt = storeDiagnosis(slice as any);
      expect(evt.context.stored).toBe(true);
      expect(fs.existsSync(evt.context.filePath)).toBe(true);
      const raw = JSON.parse(fs.readFileSync(evt.context.filePath, 'utf8'));
      expect(raw.slice.performanceIssues.length).toBe(1);
    });
  });
});
