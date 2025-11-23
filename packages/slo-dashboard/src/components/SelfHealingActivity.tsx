import React from 'react';
import { SelfHealingActivityProps } from '../types/slo.types';
import '../styles/metrics-panel.css';

/**
 * SelfHealingActivity Component
 * Real-time log of automated fixes deployed
 */
export const SelfHealingActivity: React.FC<SelfHealingActivityProps> = ({
  data,
  isLoading,
}) => {
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'DEPLOYED': '#10B981',
      'FAILED': '#EF4444',
      'REVERTED': '#F59E0B',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusEmoji = (status: string): string => {
    const emojis: Record<string, string> = {
      'DEPLOYED': '✅',
      'FAILED': '❌',
      'REVERTED': '↩️',
    };
    return emojis[status] || '❓';
  };

  if (isLoading) {
    return <div className="self-healing loading">Loading healing activity...</div>;
  }

  if (!data || data.recent_fixes.length === 0) {
    return (
      <div className="self-healing">
        <h2>Self-Healing Activity</h2>
        <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>
          No healing activity recorded
        </div>
      </div>
    );
  }

  return (
    <div className="self-healing">
      <h2>Self-Healing Activity</h2>

      <div className="healing-summary">
        <div className="summary-stat">
          <span className="label">Fixes This Month</span>
          <span className="value">{data.total_fixed_this_month}</span>
        </div>
        <div className="summary-stat">
          <span className="label">Avg Improvement</span>
          <span className="value" style={{ color: '#10B981' }}>
            +{data.avg_improvement_percentage.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="healing-timeline">
        {data.recent_fixes.map((fix) => (
          <div key={fix.id} className="timeline-item">
            <div
              className="timeline-marker"
              style={{ backgroundColor: getStatusColor(fix.status) }}
            >
              {getStatusEmoji(fix.status)}
            </div>

            <div className="timeline-content">
              <div className="fix-header">
                <h4>{fix.issue_type}</h4>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(fix.status),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {fix.status}
                </span>
              </div>

              <div className="fix-details">
                <span className="component">{fix.component}</span>
                <span className="fix-description">{fix.fix_applied}</span>
              </div>

              <div className="fix-footer">
                <span className="improvement">
                  +{fix.improvement_metric.toFixed(2)}% improvement
                </span>
                <span className="timestamp">
                  {new Date(fix.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelfHealingActivity;
