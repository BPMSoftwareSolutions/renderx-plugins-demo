/**
 * RenderX Metrics Adapter
 * Converts RenderX-specific telemetry data to dashboard format
 */

import {
  SLIMetricsData,
  SLOTargetsData,
  ErrorBudgetsData,
  SLAComplianceData,
  ComponentMetric,
  SelfHealingActivityData,
} from '@slo-shape/dashboard';

export class RenderXMetricsAdapter {
  /**
   * Convert renderx-web telemetry to SLI metrics format
   */
  static convertToSLIMetrics(telemetryData: any): SLIMetricsData {
    const componentMetrics: ComponentMetric[] = (telemetryData?.components || []).map(
      (component: any) => ({
        component_id: component.id,
        component_name: component.name,
        availability: component.availability || 99.0,
        latency_p50_ms: component.latency?.p50 || 0,
        latency_p95_ms: component.latency?.p95 || 0,
        latency_p99_ms: component.latency?.p99 || 0,
        error_rate: component.error_rate || 0,
        health_score: component.health_score || 50,
        last_updated: component.last_updated || new Date().toISOString(),
      })
    );

    return {
      metadata: {
        version: '1.0.0',
        generated_date: new Date().toISOString(),
        period: 'monthly',
        total_components: componentMetrics.length,
      },
      componentMetrics,
      summary: {
        avg_availability: this.calculateAverage(componentMetrics.map(m => m.availability)),
        avg_error_rate: this.calculateAverage(componentMetrics.map(m => m.error_rate)),
        total_requests: telemetryData?.total_requests || 0,
      },
    };
  }

  /**
   * Convert renderx SLO definitions to dashboard format
   */
  static convertToSLOTargets(sloData: any): SLOTargetsData {
    return {
      metadata: {
        version: '1.0.0',
        generated_date: new Date().toISOString(),
        period: 'monthly',
        total_components: sloData?.targets?.length || 0,
      },
      slo_targets: sloData?.targets || [],
      summary: {
        total_monthly_budget: sloData?.total_budget || 0,
        avg_availability_target: sloData?.avg_target || 99.0,
      },
    };
  }

  /**
   * Convert renderx error budgets to dashboard format
   */
  static convertToErrorBudgets(budgetData: any): ErrorBudgetsData {
    return {
      metadata: {
        version: '1.0.0',
        generated_date: new Date().toISOString(),
        period: 'monthly',
        total_components: budgetData?.budgets?.length || 0,
      },
      budgets: budgetData?.budgets || [],
      summary: {
        total_monthly_budget: budgetData?.total_budget || 0,
        total_consumed: budgetData?.total_consumed || 0,
        overall_consumption_percentage: budgetData?.total_consumed
          ? (budgetData.total_consumed / budgetData.total_budget) * 100
          : 0,
        components_at_risk: (budgetData?.budgets || []).filter(
          (b: any) => b.status === 'CRITICAL' || b.status === 'BREACHED'
        ).length,
      },
    };
  }

  /**
   * Convert renderx compliance data to dashboard format
   */
  static convertToCompliance(complianceData: any): SLAComplianceData {
    return {
      metadata: {
        version: '1.0.0',
        generated_date: new Date().toISOString(),
        period: 'monthly',
      },
      compliance_entries: complianceData?.entries || [],
      summary: {
        total_compliant: (complianceData?.entries || []).filter((e: any) => e.compliant).length,
        total_breached: (complianceData?.entries || []).filter((e: any) => !e.compliant).length,
        overall_compliance_percentage: complianceData?.overall_compliance || 100,
      },
    };
  }

  /**
   * Convert self-healing logs to dashboard format
   */
  static convertToSelfHealingActivity(healingData: any): SelfHealingActivityData {
    return {
      recent_fixes: healingData?.fixes || [],
      total_fixed_this_month: healingData?.total_fixed || 0,
      avg_improvement_percentage: healingData?.avg_improvement || 0,
    };
  }

  /**
   * Utility: calculate average
   */
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

export default RenderXMetricsAdapter;
