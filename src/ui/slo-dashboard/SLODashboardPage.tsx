/**
 * SLODashboardPage
 * RenderX integration wrapper for the generic SLO Dashboard
 * Handles data loading, refresh, and integration with RenderX UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from '@slo-shape/dashboard';
import { useSLOMetrics, useErrorBudget, useComplianceStatus } from '@slo-shape/dashboard';
import type {
  SLIMetricsData,
  SLOTargetsData,
  ErrorBudgetsData,
  SLAComplianceData,
  SelfHealingActivityData,
} from '@slo-shape/dashboard';
import RenderXMetricsAdapter from './renderx-metrics-adapter';

interface SLODashboardPageProps {
  /** Theme for the dashboard */
  theme?: 'light' | 'dark';

  /** Whether to auto-refresh data */
  autoRefresh?: boolean;

  /** Refresh interval in ms */
  refreshIntervalMs?: number;

  /** Callback when data is refreshed */
  onDataRefresh?: (data: {
    metrics: SLIMetricsData | null;
    budgets: ErrorBudgetsData | null;
    compliance: SLAComplianceData | null;
  }) => void;

  /** Custom class name */
  className?: string;
}

export const SLODashboardPage: React.FC<SLODashboardPageProps> = ({
  theme = 'light',
  autoRefresh = true,
  refreshIntervalMs = 30000,
  onDataRefresh,
  className = '',
}) => {
  // Load metrics data
  const metricsResult = useSLOMetrics(
    '.generated/sli-metrics.json',
    autoRefresh,
    refreshIntervalMs
  );

  // Load error budgets
  const budgetsResult = useErrorBudget(
    '.generated/error-budgets.json',
    autoRefresh,
    60000 // budgets refresh less frequently
  );

  // Load compliance data
  const complianceResult = useComplianceStatus(
    '.generated/sla-compliance-report.json',
    autoRefresh,
    60000
  );

  // Local state for all data
  const [metricsData, setMetricsData] = useState<SLIMetricsData | null>(null);
  const [sloTargetsData, setSloTargetsData] = useState<SLOTargetsData | null>(null);
  const [errorBudgetsData, setErrorBudgetsData] = useState<ErrorBudgetsData | null>(null);
  const [complianceData, setComplianceData] = useState<SLAComplianceData | null>(null);
  const [selfHealingData, setSelfHealingData] = useState<SelfHealingActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update metrics when loaded
  useEffect(() => {
    if (metricsResult.data) {
      setMetricsData(metricsResult.data);
    }
  }, [metricsResult.data]);

  // Update error budgets when loaded
  useEffect(() => {
    if (budgetsResult.budgets.length > 0) {
      const budgetsData: ErrorBudgetsData = {
        metadata: {
          version: '1.0.0',
          generated_date: new Date().toISOString(),
          period: 'monthly',
          total_components: budgetsResult.budgets.length,
        },
        budgets: budgetsResult.budgets,
        summary: {
          total_monthly_budget: budgetsResult.budgets.reduce((sum, b) => sum + b.monthly_budget, 0),
          total_consumed: budgetsResult.budgets.reduce((sum, b) => sum + b.consumed, 0),
          overall_consumption_percentage: 0, // will be calculated
          components_at_risk: budgetsResult.budgets.filter(
            (b) => b.status === 'CRITICAL' || b.status === 'BREACHED'
          ).length,
        },
      };

      if (budgetsData.summary.total_monthly_budget > 0) {
        budgetsData.summary.overall_consumption_percentage =
          (budgetsData.summary.total_consumed / budgetsData.summary.total_monthly_budget) * 100;
      }

      setErrorBudgetsData(budgetsData);
    }
  }, [budgetsResult.budgets]);

  // Update compliance when loaded
  useEffect(() => {
    if (complianceResult.compliance.length > 0) {
      const complianceDataFormatted: SLAComplianceData = {
        metadata: {
          version: '1.0.0',
          generated_date: new Date().toISOString(),
          period: 'monthly',
        },
        compliance_entries: complianceResult.compliance,
        summary: {
          total_compliant: complianceResult.compliance.filter((e) => e.compliant).length,
          total_breached: complianceResult.compliance.filter((e) => !e.compliant).length,
          overall_compliance_percentage:
            complianceResult.compliance.length > 0
              ? (complianceResult.compliance.filter((e) => e.compliant).length /
                  complianceResult.compliance.length) *
                100
              : 100,
        },
      };

      setComplianceData(complianceDataFormatted);
    }
  }, [complianceResult.compliance]);

  // Load SLO targets data
  useEffect(() => {
    const loadSLOTargets = async () => {
      try {
        const response = await fetch('.generated/slo-targets.json');
        if (response.ok) {
          const data = await response.json();
          setSloTargetsData(data);
        }
      } catch (error) {
        console.error('Error loading SLO targets:', error);
      }
    };

    loadSLOTargets();
  }, []);

  // Load self-healing activity
  useEffect(() => {
    const loadSelfHealingActivity = async () => {
      try {
        const response = await fetch('.generated/self-healing-activity.json');
        if (response.ok) {
          const data = await response.json();
          setSelfHealingData(data);
        }
      } catch (error) {
        console.error('Error loading self-healing activity:', error);
      }
    };

    loadSelfHealingActivity();
  }, []);

  // Combined loading state
  useEffect(() => {
    setIsLoading(
      metricsResult.isLoading || budgetsResult.isLoading || complianceResult.isLoading
    );
  }, [
    metricsResult.isLoading,
    budgetsResult.isLoading,
    complianceResult.isLoading,
  ]);

  // Notify parent of data refresh
  useEffect(() => {
    if (onDataRefresh) {
      onDataRefresh({
        metrics: metricsData,
        budgets: errorBudgetsData,
        compliance: complianceData,
      });
    }
  }, [metricsData, errorBudgetsData, complianceData, onDataRefresh]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        metricsResult.refresh(),
        budgetsResult.getBurnRate(''), // Trigger refresh by calling method
        complianceResult.compliance, // These auto-refresh via hooks
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [metricsResult, budgetsResult, complianceResult]);

  // Handle export
  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics: metricsData,
      sloTargets: sloTargetsData,
      budgets: errorBudgetsData,
      compliance: complianceData,
      selfHealing: selfHealingData,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renderx-slo-dashboard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [metricsData, sloTargetsData, errorBudgetsData, complianceData, selfHealingData]);

  return (
    <div className={`slo-dashboard-page ${className}`}>
      <Dashboard
        metricsData={metricsData}
        sloTargetsData={sloTargetsData}
        errorBudgetsData={errorBudgetsData}
        complianceData={complianceData}
        selfHealingData={selfHealingData}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        theme={theme}
      />
    </div>
  );
};

export default SLODashboardPage;
