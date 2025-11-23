import React, { useMemo } from 'react';
import { MetricsPanelProps, ComponentMetric } from '../types/slo.types';
import '../styles/metrics-panel.css';

/**
 * MetricsPanel Component
 * Displays real-time SLI metrics: health scores, latencies, availability, error rates
 */
export const MetricsPanel: React.FC<MetricsPanelProps> = ({ data, isLoading }) => {
  const sortedMetrics = useMemo(() => {
    return [...data].sort((a, b) => a.health_score - b.health_score);
  }, [data]);

  const getHealthColor = (score: number): string => {
    if (score >= 75) return '#10B981'; // green
    if (score >= 50) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const getHealthStatus = (score: number): string => {
    if (score >= 75) return 'Healthy';
    if (score >= 50) return 'Degraded';
    return 'Critical';
  };

  if (isLoading) {
    return <div className="metrics-panel loading">Loading metrics...</div>;
  }

  return (
    <div className="metrics-panel">
      <h2>Real-time SLI Metrics</h2>
      <div className="metrics-grid">
        {sortedMetrics.map((metric: ComponentMetric) => (
          <div
            key={metric.component_id}
            className="metric-card"
            style={{
              borderLeftColor: getHealthColor(metric.health_score),
            }}
          >
            <div className="metric-header">
              <h3>{metric.component_name}</h3>
              <div className="health-score" style={{ color: getHealthColor(metric.health_score) }}>
                {metric.health_score.toFixed(1)}
              </div>
            </div>

            <div className="metric-status" style={{ color: getHealthColor(metric.health_score) }}>
              {getHealthStatus(metric.health_score)}
            </div>

            <div className="metric-row">
              <span className="metric-label">Availability</span>
              <span className="metric-value">{metric.availability.toFixed(3)}%</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Error Rate</span>
              <span className="metric-value">{metric.error_rate.toFixed(2)}%</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">P95 Latency</span>
              <span className="metric-value">{metric.latency_p95_ms.toFixed(2)}ms</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">P99 Latency</span>
              <span className="metric-value">{metric.latency_p99_ms.toFixed(2)}ms</span>
            </div>

            <div className="metric-footer">
              <small>Updated: {new Date(metric.last_updated).toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsPanel;
