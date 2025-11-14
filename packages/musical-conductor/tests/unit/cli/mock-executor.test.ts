/**
 * Mock Executor Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockExecutor } from '../../../tools/cli/mocking/MockExecutor';
import type { MusicalSequence } from '../../../modules/communication/sequences/SequenceTypes';

describe('MockExecutor', () => {
  let executor: MockExecutor;

  beforeEach(() => {
    executor = new MockExecutor();
  });

  const createTestSequence = (): MusicalSequence => ({
    id: 'test-seq',
    name: 'Test Sequence',
    description: 'Test sequence',
    key: 'C Major',
    tempo: 120,
    category: 'system' as any,
    movements: [
      {
        id: 'test-movement',
        name: 'Test Movement',
        description: 'Test movement',
        beats: [
          {
            beat: 1,
            event: 'test-beat-1',
            dynamics: 'mf',
            timing: 'immediate',
            data: {},
          } as any,
          {
            beat: 2,
            event: 'test-beat-2',
            dynamics: 'mf',
            timing: 'immediate',
            data: {},
          } as any,
        ],
      },
    ],
  });

  describe('executeWithMocking', () => {
    it('should execute sequence without mocking', async () => {
      const sequence = createTestSequence();
      const results = await executor.executeWithMocking(sequence, {});

      expect(results).toHaveLength(2);
      expect(results[0].beatNumber).toBe(1);
      expect(results[1].beatNumber).toBe(2);
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('success');
    });

    it('should mock beats when mockBeats is specified', async () => {
      const sequence = createTestSequence();
      const results = await executor.executeWithMocking(sequence, {
        mockBeats: [1],
      });

      expect(results[0].isMocked).toBe(true);
      expect(results[1].isMocked).toBe(false);
    });

    it('should mock service kinds when mockServices is specified', async () => {
      const sequence = createTestSequence();
      (sequence.movements[0].beats[0] as any).kind = 'pure';
      (sequence.movements[0].beats[1] as any).kind = 'io';

      const results = await executor.executeWithMocking(sequence, {
        mockServices: ['pure'],
      });

      expect(results[0].isMocked).toBe(true);
      expect(results[1].isMocked).toBe(false);
    });

    it('should unmock beats when unmockBeats is specified', async () => {
      const sequence = createTestSequence();
      const results = await executor.executeWithMocking(sequence, {
        mockServices: ['pure'],
        unmockBeats: [1],
      });

      expect(results[0].isMocked).toBe(false);
      expect(results[1].isMocked).toBe(true);
    });

    it('should record execution timing', async () => {
      const sequence = createTestSequence();
      const results = await executor.executeWithMocking(sequence, {});

      results.forEach(result => {
        expect(result.duration).toBeGreaterThan(0);
        expect(result.startTime).toBeGreaterThan(0);
        expect(result.endTime).toBeGreaterThanOrEqual(result.startTime);
      });
    });
  });

  describe('getResults', () => {
    it('should return execution results', async () => {
      const sequence = createTestSequence();
      await executor.executeWithMocking(sequence, {});

      const results = executor.getResults();
      expect(results).toHaveLength(2);
    });
  });

  describe('getTotalDuration', () => {
    it('should return total duration', async () => {
      const sequence = createTestSequence();
      await executor.executeWithMocking(sequence, {});

      const duration = executor.getTotalDuration();
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('generateSummary', () => {
    it('should generate summary report', async () => {
      const sequence = createTestSequence();
      await executor.executeWithMocking(sequence, {
        mockBeats: [1],
      });

      const summary = executor.generateSummary();
      expect(summary).toContain('Execution Summary');
      expect(summary).toContain('Total Duration');
      expect(summary).toContain('Beats: 2');
      expect(summary).toContain('1 mocked');
      expect(summary).toContain('1 unmocked');
    });

    it('should identify slow beats in summary', async () => {
      const sequence = createTestSequence();
      (sequence.movements[0].beats[0] as any).duration = 150; // Slow beat
      await executor.executeWithMocking(sequence, {});

      const summary = executor.generateSummary();
      expect(summary).toContain('Slow Beats');
    });
  });
});

