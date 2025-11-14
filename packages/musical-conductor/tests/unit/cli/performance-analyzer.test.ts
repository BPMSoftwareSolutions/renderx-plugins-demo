/**
 * Performance Analyzer Tests
 */

import { describe, it, expect } from 'vitest';
import { PerformanceAnalyzer, type BeatPerformance } from '../../../tools/cli/reporting/PerformanceAnalyzer';

describe('PerformanceAnalyzer', () => {
  let analyzer: PerformanceAnalyzer;

  beforeEach(() => {
    analyzer = new PerformanceAnalyzer();
  });

  const createTestBeats = (): BeatPerformance[] => [
    { beatNumber: 1, event: 'resolve-template', duration: 5, isSlow: false, kind: 'pure' },
    { beatNumber: 2, event: 'register-instance', duration: 12, isSlow: false, kind: 'io' },
    { beatNumber: 3, event: 'create-node', duration: 18, isSlow: false, kind: 'pure' },
    { beatNumber: 4, event: 'render-react', duration: 512, isSlow: true, kind: 'stage-crew', timing: 'after-beat' },
    { beatNumber: 5, event: 'notify-ui', duration: 3, isSlow: false, kind: 'api' },
    { beatNumber: 6, event: 'enhance-line', duration: 38, isSlow: false, kind: 'pure' },
  ];

  describe('analyze', () => {
    it('should calculate total duration', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);

      expect(analysis.totalDuration).toBe(588);
    });

    it('should identify slow beats', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);

      expect(analysis.slowBeats).toHaveLength(1);
      expect(analysis.slowBeats[0].beatNumber).toBe(4);
    });

    it('should calculate average beat duration', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);

      expect(analysis.averageBeatDuration).toBeCloseTo(98, 0);
    });

    it('should identify fastest beat', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);

      expect(analysis.fastestBeat?.beatNumber).toBe(5);
      expect(analysis.fastestBeat?.duration).toBe(3);
    });

    it('should identify slowest beat', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);

      expect(analysis.slowestBeat?.beatNumber).toBe(4);
      expect(analysis.slowestBeat?.duration).toBe(512);
    });

    it('should generate recommendations', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);

      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.some(r => r.includes('Beat 4'))).toBe(true);
    });
  });

  describe('formatAnalysis', () => {
    it('should format analysis as string', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);
      const formatted = analyzer.formatAnalysis(analysis);

      expect(formatted).toContain('Performance Analysis');
      expect(formatted).toContain('Total Duration');
      expect(formatted).toContain('Slow Beats');
      expect(formatted).toContain('Recommendations');
    });

    it('should include slow beat details', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);
      const formatted = analyzer.formatAnalysis(analysis);

      expect(formatted).toContain('Beat 4');
      expect(formatted).toContain('render-react');
    });
  });

  describe('exportJSON', () => {
    it('should export analysis as JSON', () => {
      const beats = createTestBeats();
      const analysis = analyzer.analyze(beats);
      const json = analyzer.exportJSON(analysis);

      const parsed = JSON.parse(json);
      expect(parsed.totalDuration).toBe(588);
      expect(parsed.slowBeats).toHaveLength(1);
    });
  });
});

