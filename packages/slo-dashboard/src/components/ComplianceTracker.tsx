import React, { useMemo } from 'react';
import { ComplianceTrackerProps, ComplianceEntry } from '../types/slo.types';
import ComplianceTracker from '../services/complianceTracker';
import '../styles/metrics-panel.css';

/**
 * ComplianceTracker Component
 * Displays SLO compliance status per component with trend analysis
 */
export const ComplianceTrackerComponent: React.FC<ComplianceTrackerProps> = ({
  data,
  isLoading,
}) => {
  const tracker = new ComplianceTracker();

  const sortedEntries = useMemo(() => {
    return tracker.sortByPriority(data);
  }, [data, tracker]);

  const compliantCount = useMemo(() => {
    return tracker.getCompliantCount(data);
  }, [data, tracker]);

  const breachedCount = useMemo(() => {
    return tracker.getBreachedCount(data);
  }, [data, tracker]);

  if (isLoading) {
    return <div className="compliance-tracker loading">Loading compliance data...</div>;
  }

  const overallCompliance = tracker.getOverallCompliance(data);

  return (
    <div className="compliance-tracker">
      <h2>SLA Compliance Status</h2>

      <div className="compliance-summary">
        <div
          className="summary-card"
          style={{
            borderLeftColor: overallCompliance ? '#10B981' : '#EF4444',
          }}
        >
          <h3>{overallCompliance ? '✅ COMPLIANT' : '❌ BREACHED'}</h3>
          <div className="compliance-stats">
            <div className="stat">
              <span className="label">Compliant</span>
              <span className="value" style={{ color: '#10B981' }}>
                {compliantCount}/{data.length}
              </span>
            </div>
            <div className="stat">
              <span className="label">Breached</span>
              <span className="value" style={{ color: '#EF4444' }}>
                {breachedCount}/{data.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="compliance-entries">
        {sortedEntries.map((entry: ComplianceEntry) => (
          <div
            key={entry.component}
            className="compliance-entry"
            style={{
              borderLeftColor: tracker.getComplianceColor(entry.compliant),
              backgroundColor: entry.compliant ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            }}
          >
            <div className="entry-header">
              <h4>{entry.component}</h4>
              <div className="entry-meta">
                <span className="compliance-percentage">
                  {entry.compliance_percentage.toFixed(2)}% / {entry.sla_target}% SLA
                </span>
                <span className="trend">{tracker.getTrendIndicator(entry.trend)}</span>
              </div>
            </div>

            <div className="compliance-bar">
              <div
                className="compliance-fill"
                style={{
                  width: `${Math.min(entry.compliance_percentage, 100)}%`,
                  backgroundColor: tracker.getComplianceColor(entry.compliant),
                }}
              />
            </div>

            <div className="entry-details">
              <div className="detail">
                <span className="label">Status:</span>
                <span
                  className="value"
                  style={{ color: tracker.getComplianceColor(entry.compliant) }}
                >
                  {entry.compliant ? 'COMPLIANT' : 'BREACHED'}
                </span>
              </div>
              <div className="detail">
                <span className="label">Trend:</span>
                <span className="value">{entry.trend}</span>
              </div>
              <div className="detail">
                <span className="label">Breaches:</span>
                <span className="value">{entry.breaches}</span>
              </div>
              {entry.last_breach && (
                <div className="detail">
                  <span className="label">Last Breach:</span>
                  <span className="value">
                    {new Date(entry.last_breach).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {breachedCount > 0 && (
        <div className="alert-box" style={{ borderColor: '#EF4444' }}>
          <h4>⚠️ Action Required</h4>
          <ul>
            {tracker.getHighRiskComponents(data).map((entry) => (
              <li key={entry.component}>
                {entry.component}: {tracker.generateAlertMessage(entry)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComplianceTrackerComponent;
