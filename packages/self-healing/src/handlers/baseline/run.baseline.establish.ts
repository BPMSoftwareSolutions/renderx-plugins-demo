import collectBaselineMetrics from './collect.metrics';
import aggregateBaselineMetrics from './aggregate.metrics';
import establishBaseline from './establish.baseline';
import storeBaseline from './store.baseline';
import baselineCompleted from './baseline.completed';

export interface RunBaselineEstablishOptions {
  rootDir?: string;
  sequenceId?: string;
}

export function runBaselineEstablish(options: RunBaselineEstablishOptions = {}) {
  const { rootDir = process.cwd(), sequenceId = 'baseline-establish' } = options;
  const collected = collectBaselineMetrics(rootDir);
  const aggregated = aggregateBaselineMetrics(collected);
  const established = establishBaseline(aggregated);
  const stored = storeBaseline(established, rootDir);
  const completed = baselineCompleted(stored, established);
  return {
    sequenceId,
    collected,
    aggregated,
    established,
    stored,
    completed,
    baseline: established.context.baselines,
  };
}

export default runBaselineEstablish;
