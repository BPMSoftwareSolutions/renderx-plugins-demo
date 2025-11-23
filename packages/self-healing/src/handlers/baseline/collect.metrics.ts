import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface TelemetryMetricsArtifact {
  totalEvents: number;
  handlers: Record<string, { count: number; avgTime: number; errorRate: number }>;
}

export interface BaselineCollectEvent {
  timestamp: string;
  handler: 'baselineCollectMetrics';
  event: 'baseline.collect.metrics';
  context: {
    filePath: string;
    metricsFound: boolean;
    metrics?: TelemetryMetricsArtifact;
  };
}

export function collectBaselineMetrics(rootDir: string = process.cwd()): BaselineCollectEvent {
  const filePath = join(rootDir, '.generated', 'telemetry-metrics.json');
  let metrics: TelemetryMetricsArtifact | undefined;
  if (existsSync(filePath)) {
    try {
      metrics = JSON.parse(readFileSync(filePath, 'utf-8')) as TelemetryMetricsArtifact;
    } catch {
      metrics = undefined;
    }
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'baselineCollectMetrics',
    event: 'baseline.collect.metrics',
    context: {
      filePath,
      metricsFound: !!metrics,
      metrics
    }
  };
}

export default collectBaselineMetrics;
