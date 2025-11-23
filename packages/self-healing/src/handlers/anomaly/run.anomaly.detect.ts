import { detectAnomaliesRequested } from './detect.requested';
import { loadTelemetryData } from './load.telemetry';
import { detectPerformanceAnomalies } from './detect.performance';
import { detectBehavioralAnomalies } from './detect.behavioral';
import { detectCoverageAnomalies } from './detect.coverage';
import { detectErrorAnomalies } from './detect.errors';
import { aggregateAnomalies } from './aggregate.anomalies';
import { detectSloBreaches } from './detect.slo.breaches';
import { storeAnomalies } from './store.anomalies';
import { detectAnomaliesCompleted } from './detect.completed';
import { TelemetryMetrics } from '../../types';

export interface RunAnomalyDetectionSummary {
  requested: ReturnType<typeof detectAnomaliesRequested>;
  load: ReturnType<typeof loadTelemetryData>;
  performance: ReturnType<typeof detectPerformanceAnomalies>;
  behavioral: ReturnType<typeof detectBehavioralAnomalies>;
  coverage: ReturnType<typeof detectCoverageAnomalies>;
  errors: ReturnType<typeof detectErrorAnomalies>;
  slo: ReturnType<typeof detectSloBreaches>;
  aggregate: ReturnType<typeof aggregateAnomalies>;
  store: ReturnType<typeof storeAnomalies>;
  completed: ReturnType<typeof detectAnomaliesCompleted>;
}

export interface RunAnomalyDetectionOptions {
  sequenceId?: string;
  currentMetrics: TelemetryMetrics;
  baselineMetrics: TelemetryMetrics;
}

/**
 * High-level orchestration for anomaly detection sequence.
 */
export function runAnomalyDetection(options: RunAnomalyDetectionOptions): RunAnomalyDetectionSummary {
  const { sequenceId = 'anomaly-detect', currentMetrics, baselineMetrics } = options;
  const requested = detectAnomaliesRequested(sequenceId);
  const load = loadTelemetryData(currentMetrics, baselineMetrics);
  const performance = detectPerformanceAnomalies(load.context.metrics, load.context.baselines);
  const behavioral = detectBehavioralAnomalies(load.context.metrics, load.context.baselines);
  const coverage = detectCoverageAnomalies(load.context.metrics, load.context.baselines);
  const errors = detectErrorAnomalies(load.context.metrics, load.context.baselines);
  const slo = detectSloBreaches(load.context.metrics);
  const aggregate = aggregateAnomalies(performance.context, behavioral.context, coverage.context, errors.context, slo.context);
  const store = storeAnomalies(aggregate.context.anomalies);
  const completed = detectAnomaliesCompleted(sequenceId, aggregate.context.anomalies);
  return { requested, load, performance, behavioral, coverage, errors, slo, aggregate, store, completed };
}
