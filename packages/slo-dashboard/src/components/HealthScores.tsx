import React, { useMemo } from 'react';
import { HealthScoresProps } from '../types/slo.types';
import '../styles/metrics-panel.css';

/**
 * HealthScores Component
 * Individual component health cards with status indicators
 */
export const HealthScores: React.FC<HealthScoresProps> = ({ metrics, isLoading }) => {
  const sortedMetrics = useMemo(() => {
    return [...metrics].sort((a, b) => b.health_score - a.health_score);
  }, [metrics]);

  const getHealthStatus = (
    score: number
  ): { status: string; color: string; emoji: string } => {
    if (score >= 80) {
      return { status: 'Excellent', color: '#10B981', emoji: '🟢' };
    }
    if (score >= 60) {
      return { status: 'Good', color: '#3B82F6', emoji: '🔵' };
    }
    if (score >= 40) {
      return { status: 'Fair', color: '#F59E0B', emoji: '🟡' };
    }
    return { status: 'Poor', color: '#EF4444', emoji: '🔴' };
  };

  if (isLoading) {
    return <div className="health-scores loading">Loading health scores...</div>;
  }

  const avgScore = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.health_score, 0) / metrics.length
    : 0;

  const avgStatus = getHealthStatus(avgScore);

  return (
    <div className="health-scores">
      <h2>Component Health Scores</h2>

      <div className="overall-health">
        <div className="health-gauge">
          <div
            className="gauge-value"
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: avgStatus.color,
            }}
          >
            {avgScore.toFixed(1)}
          </div>
          <div style={{ color: avgStatus.color, marginTop: '8px' }}>
            {avgStatus.emoji} {avgStatus.status}
          </div>
        </div>
      </div>

      <div className="health-grid">
        {sortedMetrics.map((metric) => {
          const status = getHealthStatus(metric.health_score);

          return (
            <div
              key={metric.component_id}
              className="health-card"
              style={{
                borderTopColor: status.color,
              }}
            >
              <div className="card-header">
                <h3>{metric.component_name}</h3>
                <span className="status-emoji" style={{ fontSize: '24px' }}>
                  {status.emoji}
                </span>
              </div>

              <div className="score-display">
                <div className="score" style={{ color: status.color }}>
                  {metric.health_score.toFixed(1)}
                </div>
                <div className="status-label" style={{ color: status.color }}>
                  {status.status}
                </div>
              </div>

              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${metric.health_score}%`,
                    backgroundColor: status.color,
                  }}
                />
              </div>

              <div className="metrics-summary">
                <div className="mini-metric">
                  <span className="label">Availability</span>
                  <span className="value">{metric.availability.toFixed(2)}%</span>
                </div>
                <div className="mini-metric">
                  <span className="label">Error Rate</span>
                  <span className="value">{metric.error_rate.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthScores;
