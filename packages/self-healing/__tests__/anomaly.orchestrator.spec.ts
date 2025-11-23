import { describe, it, expect } from 'vitest';
import { runAnomalyDetection } from '../src/handlers/anomaly/run.anomaly.detect';
import { TelemetryMetrics } from '../src/types';

function metricsPair(): { current: TelemetryMetrics; baseline: TelemetryMetrics } {
  const baseline: TelemetryMetrics = {
    handlers: {
      loadLogFiles: { count: 10, avgTime: 4, p95Time: 6, p99Time: 7, errorRate: 0.02, lastSeen: new Date(Date.now()-600000).toISOString() },
      extractTelemetryEvents: { count: 18, avgTime: 5, p95Time: 8, p99Time: 9, errorRate: 0.05, lastSeen: new Date(Date.now()-600000).toISOString() },
      aggregateTelemetryMetrics: { count: 9, avgTime: 3, p95Time: 5, p99Time: 6, errorRate: 0.00, lastSeen: new Date(Date.now()-600000).toISOString() }
    },
    sequences: {},
    timestamp: new Date(Date.now()-600000).toISOString(),
    totalEvents: 37
  };
  const current: TelemetryMetrics = {
    handlers: {
      loadLogFiles: { count: 44, avgTime: 11, p95Time: 19, p99Time: 22, errorRate: 0.07, lastSeen: new Date().toISOString() },
      extractTelemetryEvents: { count: 32, avgTime: 12, p95Time: 20, p99Time: 23, errorRate: 0.21, lastSeen: new Date().toISOString() },
      aggregateTelemetryMetrics: { count: 18, avgTime: 5, p95Time: 9, p99Time: 11, errorRate: 0.02, lastSeen: new Date().toISOString() },
      normalizeTelemetryData: { count: 12, avgTime: 2, p95Time: 3, p99Time: 4, errorRate: 0.00, lastSeen: new Date().toISOString() }
    },
    sequences: {},
    timestamp: new Date().toISOString(),
    totalEvents: 106
  };
  return { current, baseline };
}

describe('runAnomalyDetection orchestration', () => {
  it('produces a completed summary with stored anomalies', () => {
    const { current, baseline } = metricsPair();
    const summary = runAnomalyDetection({ currentMetrics: current, baselineMetrics: baseline, sequenceId: 'seq-anom-orch' });
    expect(summary.requested.event).toBe('anomaly.detect.requested');
    expect(summary.completed.context.sequenceId).toBe('seq-anom-orch');
    expect(summary.aggregate.context.anomalies.length).toBeGreaterThan(0);
    expect(summary.store.context.count).toBe(summary.aggregate.context.anomalies.length);
  });
});
