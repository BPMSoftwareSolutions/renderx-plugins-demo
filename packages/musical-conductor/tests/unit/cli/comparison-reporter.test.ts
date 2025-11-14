/**
 * Comparison Reporter Tests
 */

import { describe, it, expect } from 'vitest';
import { ComparisonReporter, type PerformanceSnapshot } from '../../../tools/cli/reporting/ComparisonReporter';

describe('ComparisonReporter', () => {
  let reporter: ComparisonReporter;

  beforeEach(() => {
    reporter = new ComparisonReporter();
  });

  const createSnapshot = (
    duration: number,
    slowBeats: number,
    timestamp: string = '2025-11-14T10:00:00Z'
  ): PerformanceSnapshot => ({
    timestamp,
    sequenceId: 'test-sequence',
    totalDuration: duration,
    slowBeats,
    averageBeatDuration: duration / 6,
  });

  describe('compare', () => {
    it('should calculate duration reduction', () => {
      const before = createSnapshot(600, 2);
      const after = createSnapshot(500, 1);

      const comparison = reporter.compare(before, after);

      expect(comparison.improvement.durationReduction).toBe(100);
      expect(comparison.improvement.durationReductionPercent).toBeCloseTo(16.67, 1);
    });

    it('should identify improvement', () => {
      const before = createSnapshot(600, 2);
      const after = createSnapshot(500, 1);

      const comparison = reporter.compare(before, after);

      expect(comparison.improvement.isImprovement).toBe(true);
    });

    it('should identify regression', () => {
      const before = createSnapshot(500, 1);
      const after = createSnapshot(600, 2);

      const comparison = reporter.compare(before, after);

      expect(comparison.improvement.isImprovement).toBe(false);
      expect(comparison.improvement.durationReduction).toBe(-100);
    });

    it('should calculate slow beats reduction', () => {
      const before = createSnapshot(600, 3);
      const after = createSnapshot(500, 1);

      const comparison = reporter.compare(before, after);

      expect(comparison.improvement.slowBeatsReduction).toBe(2);
    });
  });

  describe('formatComparison', () => {
    it('should format comparison as string', () => {
      const before = createSnapshot(600, 2, '2025-11-14T10:00:00Z');
      const after = createSnapshot(500, 1, '2025-11-14T10:01:00Z');

      const comparison = reporter.compare(before, after);
      const formatted = reporter.formatComparison(comparison);

      expect(formatted).toContain('Performance Comparison');
      expect(formatted).toContain('Before');
      expect(formatted).toContain('After');
      expect(formatted).toContain('Improvement');
      expect(formatted).toContain('IMPROVED');
    });

    it('should show regression status', () => {
      const before = createSnapshot(500, 1);
      const after = createSnapshot(600, 2);

      const comparison = reporter.compare(before, after);
      const formatted = reporter.formatComparison(comparison);

      expect(formatted).toContain('REGRESSED');
    });

    it('should include duration metrics', () => {
      const before = createSnapshot(600, 2);
      const after = createSnapshot(500, 1);

      const comparison = reporter.compare(before, after);
      const formatted = reporter.formatComparison(comparison);

      expect(formatted).toContain('600ms');
      expect(formatted).toContain('500ms');
      expect(formatted).toContain('100ms');
    });
  });

  describe('exportJSON', () => {
    it('should export comparison as JSON', () => {
      const before = createSnapshot(600, 2);
      const after = createSnapshot(500, 1);

      const comparison = reporter.compare(before, after);
      const json = reporter.exportJSON(comparison);

      const parsed = JSON.parse(json);
      expect(parsed.before.totalDuration).toBe(600);
      expect(parsed.after.totalDuration).toBe(500);
      expect(parsed.improvement.isImprovement).toBe(true);
    });
  });
});

