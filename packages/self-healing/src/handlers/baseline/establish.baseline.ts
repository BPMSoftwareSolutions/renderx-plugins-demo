import { BaselineAggregateEvent } from './aggregate.metrics';

export interface HandlerBaselineStats {
  count: number;
  avgTime: number;
  p50: number;
  p95: number;
  errorRate: number;
  confidence: 'low' | 'medium' | 'high';
  sampleSize: number;
}

export interface BaselineEstablishEvent {
  timestamp: string;
  handler: 'establishBaseline';
  event: 'baseline.establish.metrics';
  context: {
    baselines: {
      schemaVersion: '1.0';
      generatedAt: string;
      handlers: Record<string, HandlerBaselineStats>;
    };
    lowConfidenceHandlers: string[];
  };
}

// Simple heuristics: derive p50 & p95 from avgTime using factors in minimal slice.
function deriveP50(avg: number): number { return Math.round(avg * 0.9); }
function deriveP95(avg: number): number { return Math.round(avg * 1.6); }

export function establishBaseline(aggregate: BaselineAggregateEvent): BaselineEstablishEvent {
  const handlers = aggregate.context.handlers;
  const baselines: Record<string, HandlerBaselineStats> = {};
  const lowConfidence: string[] = [];
  for (const [name, data] of Object.entries(handlers)) {
    const sampleSize = data.count;
    const confidence = sampleSize < 10 ? 'low' : sampleSize < 50 ? 'medium' : 'high';
    if (confidence === 'low') lowConfidence.push(name);
    baselines[name] = {
      count: data.count,
      avgTime: data.avgTime,
      p50: deriveP50(data.avgTime),
      p95: deriveP95(data.avgTime),
      errorRate: data.errorRate,
      confidence,
      sampleSize
    };
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'establishBaseline',
    event: 'baseline.establish.metrics',
    context: {
      baselines: {
        schemaVersion: '1.0',
        generatedAt: new Date().toISOString(),
        handlers: baselines
      },
      lowConfidenceHandlers: lowConfidence
    }
  };
}

export default establishBaseline;
