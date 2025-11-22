import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectPerformanceAnomalies } from '../../src/handlers/anomaly/detect.performance';
import { createEventBus } from '../support/eventBus';
import { TelemetryMetrics } from '../../src/types';

/**
 * Business BDD Test: detectPerformanceAnomalies
 * 
 * User Story:
 * As a DevOps Engineer
 * I want to Identify performance degradation
 * 
 * Handler Type: detectPerformanceAnomalies
 * Sequence: anomaly
 * 
 * This test validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Business BDD: detectPerformanceAnomalies', () => {
  let ctx: any;

  beforeEach(() => {
    const baseline: TelemetryMetrics = {
      handlers: {
        A: { count: 200, avgTime: 100, p95Time: 140, p99Time: 160, errorRate: 0.01, lastSeen: new Date().toISOString() },
        B: { count: 150, avgTime: 220, p95Time: 300, p99Time: 350, errorRate: 0.02, lastSeen: new Date().toISOString() }
      },
      sequences: {},
      timestamp: new Date().toISOString(),
      totalEvents: 350
    };
    const current: TelemetryMetrics = {
      handlers: {
        A: { count: 210, avgTime: 250, p95Time: 400, p99Time: 480, errorRate: 0.02, lastSeen: new Date().toISOString() }, // 2.5x
        B: { count: 160, avgTime: 200, p95Time: 280, p99Time: 330, errorRate: 0.02, lastSeen: new Date().toISOString() } // slightly improved
      },
      sequences: {},
      timestamp: new Date().toISOString(),
      totalEvents: 370
    };
    ctx = {
      handler: detectPerformanceAnomalies,
      bus: createEventBus(),
      input: { current, baselines: baseline },
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });

  describe('Scenario: Detect when handler latency exceeds baseline by 2x', () => {
    it('should achieve the desired business outcome', () => {
      // GIVEN (Preconditions - Business Context)
      expect(ctx.input.baselines.handlers.A.avgTime).toBe(100);
      expect(ctx.input.current.handlers.A.avgTime).toBe(250);

      // WHEN (Action - User/System Action)
      // - performance anomaly detection executes
      ctx.output = ctx.handler(ctx.input.current, ctx.input.baselines);

      // THEN (Expected Outcome - Business Value)
      // - anomaly should be detected
      // - severity should be assessed
      // - affected handlers should be identified
      expect(ctx.output.event).toBe('anomaly.detect.performance');
      const anomalies = ctx.output.context.anomalies;
      expect(Array.isArray(anomalies)).toBe(true);
  const aAnomaly = anomalies.find((a: any) => a.handler === 'A');
      expect(aAnomaly).toBeDefined();
      expect(aAnomaly?.severity).toMatch(/high|critical|medium/);
      ctx.bus.publish('anomaly.performance.detected', anomalies);
      expect(ctx.bus.count('anomaly.performance.detected')).toBe(1);
    });
  });
});
