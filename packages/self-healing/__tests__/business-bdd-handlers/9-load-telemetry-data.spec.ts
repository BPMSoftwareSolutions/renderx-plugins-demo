import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadTelemetryData } from '../../src/handlers/anomaly/load.telemetry';
import { createEventBus } from '../support/eventBus';
import { TelemetryMetrics } from '../../src/types';

/**
 * Business BDD Test: loadTelemetryData
 * 
 * User Story:
 * As a Platform Team
 * I want to Retrieve metrics for analysis
 * 
 * Handler Type: loadTelemetryData
 * Sequence: anomaly
 * 
 * This test validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Business BDD: loadTelemetryData', () => {
  let ctx: any;

  beforeEach(() => {
    const baseline: TelemetryMetrics = {
      handlers: {
        A: { count: 100, avgTime: 100, p95Time: 150, p99Time: 180, errorRate: 0.01, lastSeen: new Date().toISOString() }
      },
      sequences: {},
      timestamp: new Date().toISOString(),
      totalEvents: 100
    };
    const current: TelemetryMetrics = {
      handlers: {
        A: { count: 120, avgTime: 140, p95Time: 200, p99Time: 240, errorRate: 0.02, lastSeen: new Date().toISOString() }
      },
      sequences: {},
      timestamp: new Date().toISOString(),
      totalEvents: 120
    };
  ctx = {
      handler: loadTelemetryData,
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

  describe('Scenario: Load telemetry metrics to compare against baselines', () => {
    it('should achieve the desired business outcome', () => {
      // GIVEN (Preconditions - Business Context)
      expect(ctx.input.baselines.totalEvents).toBe(100);
      expect(ctx.input.current.totalEvents).toBe(120);

      // WHEN (Action - User/System Action)
      // - data loading handler executes
      ctx.output = ctx.handler(ctx.input.current, ctx.input.baselines);

      // THEN (Expected Outcome - Business Value)
      // - current metrics should be loaded
      // - baseline metrics should be retrieved
      // - comparison should be possible
      expect(ctx.output.event).toBe('anomaly.load.telemetry');
      expect(ctx.output.context.metrics.totalEvents).toBe(120);
      expect(ctx.output.context.baselines.totalEvents).toBe(100);
      ctx.bus.publish('anomaly.telemetry.loaded', ctx.output.context);
      expect(ctx.bus.count('anomaly.telemetry.loaded')).toBe(1);
    });
  });
});
