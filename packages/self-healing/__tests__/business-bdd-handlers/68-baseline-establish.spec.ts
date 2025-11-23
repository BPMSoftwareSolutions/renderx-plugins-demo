import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { collectBaselineMetrics } from '../../src/handlers/baseline/collect.metrics';
import aggregateBaselineMetrics from '../../src/handlers/baseline/aggregate.metrics';
import establishBaseline from '../../src/handlers/baseline/establish.baseline';
import storeBaseline from '../../src/handlers/baseline/store.baseline';
import baselineCompleted from '../../src/handlers/baseline/baseline.completed';

/**
 * Business BDD Test: Baseline Establishment Minimal Slice
 *
 * User Story:
 * As a DevOps Engineer
 * I want to establish baseline performance & reliability metrics
 * So that I can detect regressions and evaluate SLOs objectively.
 *
 * Sequence: baseline
 * Handlers: collectBaselineMetrics -> baselineAggregateMetrics -> establishBaseline -> storeBaselineMetrics -> baselineCompleted
 */

describe('Business BDD: baseline establishment sequence', () => {
  function createSyntheticTelemetry(root: string) {
    const gen = join(root, '.generated');
    if (!existsSync(gen)) mkdirSync(gen);
    const artifact = {
      totalEvents: 120,
      handlers: {
        parseTelemetry: { count: 60, avgTime: 42, errorRate: 0.01 },
        detectAnomalies: { count: 30, avgTime: 75, errorRate: 0.02 },
        diagnoseIssues: { count: 10, avgTime: 110, errorRate: 0.0 },
        lowSampleHandler: { count: 5, avgTime: 95, errorRate: 0.05 }
      }
    };
    writeFileSync(join(gen, 'telemetry-metrics.json'), JSON.stringify(artifact, null, 2));
    return artifact;
  }

  it('establishes and stores baseline metrics with confidence flags', () => {
    // GIVEN
    const root = process.cwd();
    const artifact = createSyntheticTelemetry(root);
    expect(artifact.totalEvents).toBe(120);

    // WHEN
    const collected = collectBaselineMetrics(root);
    expect(collected.event).toBe('baseline.collect.metrics');
    const aggregated = aggregateBaselineMetrics(collected);
    const established = establishBaseline(aggregated);
    const stored = storeBaseline(established, root);
    const completed = baselineCompleted(stored, established);

    // THEN
    // baseline file should exist
    const baselinePath = stored.context.filePath;
    const baselineJson = JSON.parse(readFileSync(baselinePath, 'utf-8'));
    expect(stored.context.stored).toBe(true);
    expect(Object.keys(baselineJson.handlers).length).toBe(Object.keys(artifact.handlers).length);

    // confidence classification
    expect(baselineJson.handlers.lowSampleHandler.confidence).toBe('low');
    expect(completed.context.lowConfidenceHandlers).toContain('lowSampleHandler');

    // derived stats (heuristic p50/p95)
    const parse = baselineJson.handlers.parseTelemetry;
    expect(parse.p50).toBe(Math.round(parse.avgTime * 0.9));
    expect(parse.p95).toBe(Math.round(parse.avgTime * 1.6));

    // completion event integrity
    expect(completed.event).toBe('baseline.completed');
    expect(completed.context.handlerCount).toBe(Object.keys(artifact.handlers).length);
  });
});
