import { describe, it, expect } from 'vitest';
import { detectAnomaliesRequested } from '../src/handlers/anomaly/detect.requested';
import { loadTelemetryData } from '../src/handlers/anomaly/load.telemetry';
import { detectPerformanceAnomalies } from '../src/handlers/anomaly/detect.performance';
import { detectBehavioralAnomalies } from '../src/handlers/anomaly/detect.behavioral';
import { detectCoverageAnomalies } from '../src/handlers/anomaly/detect.coverage';
import { detectErrorAnomalies } from '../src/handlers/anomaly/detect.errors';
import { aggregateAnomalies } from '../src/handlers/anomaly/aggregate.anomalies';
import { storeAnomalies } from '../src/handlers/anomaly/store.anomalies';
import { detectAnomaliesCompleted } from '../src/handlers/anomaly/detect.completed';
import { TelemetryMetrics } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test suite for Detect Anomalies
 * Handlers covered (implemented subset): 9
 */

function makeBaselineAndCurrent(): { baseline: TelemetryMetrics; current: TelemetryMetrics } {
  const baseline: TelemetryMetrics = {
    handlers: {
      loadLogFiles: { count: 20, avgTime: 5, p95Time: 8, p99Time: 9, errorRate: 0.02, lastSeen: new Date(Date.now() - 60000).toISOString() },
      aggregateTelemetryMetrics: { count: 10, avgTime: 3, p95Time: 5, p99Time: 6, errorRate: 0.00, lastSeen: new Date(Date.now() - 60000).toISOString() },
      extractTelemetryEvents: { count: 25, avgTime: 4, p95Time: 6, p99Time: 7, errorRate: 0.10, lastSeen: new Date(Date.now() - 60000).toISOString() }
    },
    sequences: {},
    timestamp: new Date(Date.now() - 60000).toISOString(),
    totalEvents: 55
  };
  const current: TelemetryMetrics = {
    handlers: {
      loadLogFiles: { count: 60, avgTime: 12, p95Time: 21, p99Time: 25, errorRate: 0.05, lastSeen: new Date().toISOString() },
      aggregateTelemetryMetrics: { count: 22, avgTime: 4, p95Time: 7, p99Time: 8, errorRate: 0.01, lastSeen: new Date().toISOString() },
      extractTelemetryEvents: { count: 40, avgTime: 9, p95Time: 14, p99Time: 18, errorRate: 0.22, lastSeen: new Date().toISOString() },
      normalizeTelemetryData: { count: 15, avgTime: 2, p95Time: 3, p99Time: 4, errorRate: 0.00, lastSeen: new Date().toISOString() } // new handler (behavioral)
    },
    sequences: {},
    timestamp: new Date().toISOString(),
    totalEvents: 137
  };
  return { baseline, current };
}

describe('Detect Anomalies (self-healing-anomaly-detect-symphony)', () => {
  const { baseline, current } = makeBaselineAndCurrent();

  it('detectAnomaliesRequested - happy path', () => {
    const evt = detectAnomaliesRequested('seq-anom-1');
    expect(evt.event).toBe('anomaly.detect.requested');
    expect(evt.context?.sequenceId).toBe('seq-anom-1');
  });
  it('detectAnomaliesRequested - error handling', () => {
    // @ts-expect-error intentional
    expect(() => detectAnomaliesRequested('')).toThrow(/sequenceId/);
  });
  it('loadTelemetryData - happy path', () => {
    const evt = loadTelemetryData(current, baseline);
    expect(evt.event).toBe('anomaly.load.telemetry');
    expect(evt.context.metrics.totalEvents).toBe(current.totalEvents);
  });
  it('loadTelemetryData - error handling', () => {
    // @ts-expect-error invalid
    expect(() => loadTelemetryData(null, baseline)).toThrow(/current/);
  });
  it('detectPerformanceAnomalies - happy path detects at least one anomaly', () => {
    const evt = detectPerformanceAnomalies(current, baseline);
    expect(evt.event).toBe('anomaly.detect.performance');
    expect(evt.context.assessed).toBeGreaterThan(0);
  });
  it('detectPerformanceAnomalies - error handling', () => {
    // @ts-expect-error invalid
    expect(() => detectPerformanceAnomalies(null, baseline)).toThrow(/metrics/);
  });
  it('detectBehavioralAnomalies - happy path', () => {
    const evt = detectBehavioralAnomalies(current, baseline);
    expect(evt.context.anomalies.some(a => a.type === 'behavioral')).toBe(true);
  });
  it('detectBehavioralAnomalies - error handling', () => {
    // @ts-expect-error invalid
    expect(() => detectBehavioralAnomalies(null, baseline)).toThrow(/metrics/);
  });
  it('detectCoverageAnomalies - happy path', () => {
    const evt = detectCoverageAnomalies(current, baseline);
    expect(evt.event).toBe('anomaly.detect.coverage');
  });
  it('detectCoverageAnomalies - error handling', () => {
    // @ts-expect-error invalid
    expect(() => detectCoverageAnomalies(null, baseline)).toThrow(/metrics/);
  });
  it('detectErrorAnomalies - happy path', () => {
    const evt = detectErrorAnomalies(current, baseline);
    expect(evt.context.assessed).toBeGreaterThanOrEqual(1);
  });
  it('detectErrorAnomalies - error handling', () => {
    // @ts-expect-error invalid
    expect(() => detectErrorAnomalies(null, baseline)).toThrow(/metrics/);
  });
  it('aggregateAnomalies - happy path', () => {
    const perf = detectPerformanceAnomalies(current, baseline);
    const beh = detectBehavioralAnomalies(current, baseline);
    const agg = aggregateAnomalies(perf.context, beh.context);
    expect(agg.context.anomalies.length).toBe(perf.context.anomalies.length + beh.context.anomalies.length);
  });
  it('aggregateAnomalies - handles empty groups', () => {
    const agg = aggregateAnomalies({ anomalies: [] }, { anomalies: [] });
    expect(agg.context.anomalies.length).toBe(0);
  });
  it('storeAnomalies - happy path', () => {
    const perf = detectPerformanceAnomalies(current, baseline);
    const res = storeAnomalies(perf.context.anomalies);
    expect(res.event).toBe('anomaly.store.anomalies');
    const filePath = path.resolve(process.cwd(), '.generated', 'anomalies.json');
    expect(fs.existsSync(filePath)).toBe(true);
  });
  it('storeAnomalies - error handling (invalid anomalies)', () => {
    // @ts-expect-error invalid
    expect(() => storeAnomalies(null)).toThrow(/array/);
  });
  it('detectAnomaliesCompleted - happy path', () => {
    const perf = detectPerformanceAnomalies(current, baseline);
    const completed = detectAnomaliesCompleted('seq-anom-1', perf.context.anomalies);
    expect(completed.context.sequenceId).toBe('seq-anom-1');
    expect(completed.context.total).toBe(perf.context.anomalies.length);
  });
  it('detectAnomaliesCompleted - error handling', () => {
    // @ts-expect-error invalid sequence
    expect(() => detectAnomaliesCompleted('', [])).toThrow(/sequenceId/);
  });
});
