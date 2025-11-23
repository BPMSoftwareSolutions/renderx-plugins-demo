import { writeFileSync } from 'fs';
import { join } from 'path';
import { BaselineEstablishEvent } from './establish.baseline';

export interface BaselineStoreEvent {
  timestamp: string;
  handler: 'storeBaselineMetrics';
  event: 'baseline.store.metrics';
  context: {
    filePath: string;
    stored: boolean;
    handlerCount: number;
  };
}

export function storeBaseline(established: BaselineEstablishEvent, rootDir: string = process.cwd()): BaselineStoreEvent {
  const filePath = join(rootDir, '.generated', 'baseline-metrics.json');
  const payload = established.context.baselines;
  try {
    writeFileSync(filePath, JSON.stringify(payload, null, 2));
  } catch {
    return {
      timestamp: new Date().toISOString(),
      handler: 'storeBaselineMetrics',
      event: 'baseline.store.metrics',
      context: { filePath, stored: false, handlerCount: Object.keys(payload.handlers).length }
    };
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'storeBaselineMetrics',
    event: 'baseline.store.metrics',
    context: { filePath, stored: true, handlerCount: Object.keys(payload.handlers).length }
  };
}

export default storeBaseline;
