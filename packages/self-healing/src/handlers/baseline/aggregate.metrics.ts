import { BaselineCollectEvent } from './collect.metrics';

export interface BaselineAggregateEvent {
  timestamp: string;
  handler: 'baselineAggregateMetrics';
  event: 'baseline.aggregate.metrics';
  context: {
    sourceFound: boolean;
    handlers: Record<string, { count: number; avgTime: number; errorRate: number }>;
    totalEvents: number;
  };
}

export function aggregateBaselineMetrics(collect: BaselineCollectEvent): BaselineAggregateEvent {
  const metrics = collect.context.metrics;
  return {
    timestamp: new Date().toISOString(),
    handler: 'baselineAggregateMetrics',
    event: 'baseline.aggregate.metrics',
    context: {
      sourceFound: !!metrics,
      handlers: metrics?.handlers || {},
      totalEvents: metrics?.totalEvents || 0
    }
  };
}

export default aggregateBaselineMetrics;
