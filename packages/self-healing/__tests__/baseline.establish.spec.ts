import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { runBaselineEstablish } from '../src/handlers/baseline/run.baseline.establish';

// Synthetic telemetry metrics artifact for baseline establishment.
function createSyntheticTelemetryMetrics(root: string) {
  const genDir = join(root, '.generated');
  if (!existsSync(genDir)) mkdirSync(genDir);
  const artifact = {
    totalEvents: 120,
    handlers: {
      parseTelemetry: { count: 60, avgTime: 42, errorRate: 0.01 },
      detectAnomalies: { count: 30, avgTime: 75, errorRate: 0.02 },
      diagnoseIssues: { count: 10, avgTime: 110, errorRate: 0.00 },
      newHandlerLowSample: { count: 4, avgTime: 95, errorRate: 0.05 }
    }
  };
  writeFileSync(join(genDir, 'telemetry-metrics.json'), JSON.stringify(artifact, null, 2));
  return artifact;
}

describe('Baseline Establishment Minimal Slice', () => {
  it('establishes baseline metrics from synthetic telemetry artifact', () => {
    const root = process.cwd();
    const synthetic = createSyntheticTelemetryMetrics(root);
    const result = runBaselineEstablish({ rootDir: root });

    expect(result.collected.context.metricsFound).toBe(true);
    expect(Object.keys(result.baseline.handlers).length).toBe(Object.keys(synthetic.handlers).length);

    const parseBase = result.baseline.handlers.parseTelemetry;
    expect(parseBase.count).toBe(60);
    expect(parseBase.p50).toBe(Math.round(42 * 0.9));
    expect(parseBase.p95).toBe(Math.round(42 * 1.6));

    // Low confidence detection
    const lowConfidence = result.completed.context.lowConfidenceHandlers;
    expect(lowConfidence).toContain('newHandlerLowSample');

    // File persisted
    expect(result.stored.context.stored).toBe(true);
  });
});
