import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { emitFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry } from '../../src/telemetry/collector';
import { detectSloBreaches } from '../../src/handlers/anomaly/detect.slo.breaches';
import { createEventBus } from '../support/eventBus';
import { TelemetryMetrics } from '../../src/types';

/**
 * Business BDD Test: detectSloBreaches
 *
 * User Story:
 * As a Reliability Engineer
 * I want early visibility into SLO breaches
 * So that I can trigger proactive remediation before user impact escalates
 *
 * Handler Type: detectSloBreaches
 * Sequence: anomaly
 *
 * This test validates business outcome (breach detection & anomaly emission).
 */

installTelemetryMatcher();

describe('Business BDD: detectSloBreaches', () => {
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  let ctx: any;

  beforeEach(() => {
    // Craft metrics that breach latency p95 & throughput targets (from service_level.objectives.json)
    const current: TelemetryMetrics = {
      handlers: {
        A: { count: 10, avgTime: 400, p95Time: 450, p99Time: 600, errorRate: 0.02, lastSeen: new Date().toISOString() }
      },
      sequences: {},
      timestamp: new Date().toISOString(),
      totalEvents: 20 // throughput below target 50
    };
    ctx = {
      handler: detectSloBreaches,
      bus: createEventBus(),
      input: { metrics: current },
      output: null,
      error: null
    };
  });

  afterEach(() => { vi.clearAllMocks(); ctx = null; });

  describe('Scenario: Emit anomalies for breached latency & throughput SLOs', () => {
    it('should achieve the desired business outcome (with telemetry)', async () => {
      // GIVEN metrics below throughput target & above latency target
      expect(ctx.input.metrics.totalEvents).toBeLessThan(50);
      clearTelemetry();
      // WHEN SLO breach detection executes wrapped in telemetry emission
      const { record, result } = await emitFeature('detect-slo-breaches', 'slo:breach:detected', () => ctx.handler(ctx.input.metrics));
      ctx.output = result;
      // THEN anomalies emitted for each breach
      expect(ctx.output.event).toBe('anomaly.detect.slo');
      const breaches = ctx.output.context.breaches;
      expect(Array.isArray(breaches)).toBe(true);
      expect(breaches.length).toBeGreaterThanOrEqual(2); // latency + throughput
      const anomalies = ctx.output.context.anomalies;
      expect(anomalies.length).toBeGreaterThanOrEqual(2);
      const latencyAnomaly = anomalies.find((a: any) => a.metrics?.key === 'latency_p95_ms');
      const throughputAnomaly = anomalies.find((a: any) => a.metrics?.key === 'throughput_min');
      expect(latencyAnomaly).toBeDefined();
      expect(throughputAnomaly).toBeDefined();
      ctx.bus.publish('anomaly.slo.breaches.detected', anomalies);
      expect(ctx.bus.count('anomaly.slo.breaches.detected')).toBe(1);
      // Telemetry assertions
      expect(record.feature).toBe('detect-slo-breaches');
      expect(record.event).toBe('slo:breach:detected');
      expect(record.beats).toBeGreaterThanOrEqual(2);
      expect(record.status).toBe('ok');
      expect(record.correlationId).toMatch(/-/);
      expect(record).toHaveTelemetry({ feature: 'detect-slo-breaches', event: 'slo:breach:detected' });
    });
  });
});
