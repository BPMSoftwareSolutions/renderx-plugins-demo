import React, { useState } from 'react';
import { DashboardProps } from '../types/slo.types';
import MetricsPanel from './MetricsPanel';
import BudgetBurndown from './BudgetBurndown';
import ComplianceTrackerComponent from './ComplianceTracker';
import HealthScores from './HealthScores';
import SelfHealingActivity from './SelfHealingActivity';
import '../styles/dashboard.css';
import '../styles/variables.css';

/**
 * Dashboard Component
 * Master orchestrator for all SLI/SLO/SLA visualization panels
 * Provides real-time updates, filtering, and export functionality
 */
export const Dashboard: React.FC<DashboardProps> = ({
  metricsData,
  sloTargetsData,
  errorBudgetsData,
  complianceData,
  selfHealingData,
  isLoading = false,
  onRefresh,
  onExport,
  theme = 'light',
}) => {
  const [visiblePanels, setVisiblePanels] = useState({
    metrics: true,
    healthScores: true,
    budgets: true,
    compliance: true,
    healing: true,
  });

  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const togglePanel = (panel: keyof typeof visiblePanels) => {
    setVisiblePanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  const handleExport = () => {
    if (!onExport) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: metricsData,
      sloTargets: sloTargetsData,
      errorBudgets: errorBudgetsData,
      compliance: complianceData,
      selfHealing: selfHealingData,
      visiblePanels,
    };

    if (exportFormat === 'json') {
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      downloadBlob(blob, `dashboard-export-${Date.now()}.json`);
    }

    onExport();
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className={`dashboard theme-${theme}`}>
      <div className="dashboard-header">
        <h1>SLI/SLO/SLA Dashboard</h1>
        <div className="dashboard-controls">
          <button
            className="btn btn-refresh"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh all data"
          >
            {isLoading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>

          <div className="panel-toggle">
            <label>
              <input
                type="checkbox"
                checked={visiblePanels.metrics}
                onChange={() => togglePanel('metrics')}
              />
              Metrics
            </label>
            <label>
              <input
                type="checkbox"
                checked={visiblePanels.healthScores}
                onChange={() => togglePanel('healthScores')}
              />
              Health
            </label>
            <label>
              <input
                type="checkbox"
                checked={visiblePanels.budgets}
                onChange={() => togglePanel('budgets')}
              />
              Budgets
            </label>
            <label>
              <input
                type="checkbox"
                checked={visiblePanels.compliance}
                onChange={() => togglePanel('compliance')}
              />
              Compliance
            </label>
            <label>
              <input
                type="checkbox"
                checked={visiblePanels.healing}
                onChange={() => togglePanel('healing')}
              />
              Healing
            </label>
          </div>

          {onExport && (
            <div className="export-controls">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <button className="btn btn-export" onClick={handleExport}>
                📥 Export
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {visiblePanels.metrics && metricsData && metricsData.componentMetrics && (
          <section className="panel">
            <MetricsPanel data={metricsData.componentMetrics} isLoading={isLoading} />
          </section>
        )}

        {visiblePanels.healthScores && metricsData && metricsData.componentMetrics && (
          <section className="panel">
            <HealthScores metrics={metricsData.componentMetrics} isLoading={isLoading} />
          </section>
        )}

        {visiblePanels.budgets && errorBudgetsData && errorBudgetsData.budgets && (
          <section className="panel">
            <BudgetBurndown budgets={errorBudgetsData.budgets} isLoading={isLoading} />
          </section>
        )}

        {visiblePanels.compliance && complianceData && complianceData.compliance_entries && (
          <section className="panel">
            <ComplianceTrackerComponent
              data={complianceData.compliance_entries}
              isLoading={isLoading}
            />
          </section>
        )}

        {visiblePanels.healing && selfHealingData && (
          <section className="panel">
            <SelfHealingActivity data={selfHealingData} isLoading={isLoading} />
          </section>
        )}
      </div>

      <div className="dashboard-footer">
        <small>
          Last updated: {new Date().toLocaleString()}
          {metricsData?.metadata?.generated_date && (
            <span> | Data generated: {new Date(metricsData.metadata.generated_date).toLocaleString()}</span>
          )}
        </small>
      </div>
    </div>
  );
};

export default Dashboard;
