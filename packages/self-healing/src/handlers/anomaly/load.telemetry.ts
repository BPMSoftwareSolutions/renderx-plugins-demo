import { TelemetryEvent, TelemetryMetrics } from '../../types';

export interface LoadTelemetryDataResult extends TelemetryEvent { context: { metrics: TelemetryMetrics; baselines: TelemetryMetrics; }; }

export function loadTelemetryData(current: TelemetryMetrics, baselines: TelemetryMetrics): LoadTelemetryDataResult {
  if (!current || !baselines) throw new Error('current & baselines required');
  return {
    timestamp: new Date().toISOString(),
    handler: 'loadTelemetryData',
    event: 'anomaly.load.telemetry',
    context: { metrics: current, baselines }
  };
}
