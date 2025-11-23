/**
 * Universal TypeScript interfaces for SLI/SLO/SLA dashboard
 * Consumed by all components, hooks, and services
 */

// SLI Metrics (Phase 2 output)
export interface ComponentMetric {
  component_id: string;
  component_name: string;
  availability: number; // percentage
  latency_p50_ms: number;
  latency_p95_ms: number;
  latency_p99_ms: number;
  error_rate: number; // percentage
  health_score: number; // 0-100
  last_updated: string;
}

export interface SLIMetricsData {
  metadata: {
    version: string;
    generated_date: string;
    period: string;
    total_components: number;
  };
  componentMetrics: ComponentMetric[];
  summary: {
    avg_availability: number;
    avg_error_rate: number;
    total_requests: number;
  };
}

// SLO Targets (Phase 3d output)
export interface SLOTarget {
  component: string;
  availability: {
    target: number;
    error_budget: number;
  };
  latency: {
    p95_ms: number;
    p99_ms: number;
  };
  error_rate: {
    target: number;
  };
  validation: string;
}

export interface SLOTargetsData {
  metadata: {
    version: string;
    generated_date: string;
    period: string;
    total_components: number;
  };
  slo_targets: SLOTarget[];
  summary: {
    total_monthly_budget: number;
    avg_availability_target: number;
  };
}

// Error Budgets (Phase 4 output)
export interface ComponentErrorBudget {
  component: string;
  monthly_budget: number;
  consumed: number;
  remaining: number;
  consumption_percentage: number;
  time_to_breach_hours: number | null;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'BREACHED';
  alert_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ErrorBudgetsData {
  metadata: {
    version: string;
    generated_date: string;
    period: string;
    total_components: number;
  };
  budgets: ComponentErrorBudget[];
  summary: {
    total_monthly_budget: number;
    total_consumed: number;
    overall_consumption_percentage: number;
    components_at_risk: number;
  };
}

// SLA Compliance (Phase 5 output)
export interface ComplianceEntry {
  component: string;
  compliant: boolean;
  compliance_percentage: number;
  breaches: number;
  last_breach: string | null;
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  sla_target: number;
}

export interface SLAComplianceData {
  metadata: {
    version: string;
    generated_date: string;
    period: string;
  };
  compliance_entries: ComplianceEntry[];
  summary: {
    total_compliant: number;
    total_breached: number;
    overall_compliance_percentage: number;
  };
}

// Self-Healing Activity
export interface SelfHealingFix {
  id: string;
  timestamp: string;
  component: string;
  issue_type: string;
  fix_applied: string;
  status: 'DEPLOYED' | 'FAILED' | 'REVERTED';
  improvement_metric: number;
}

export interface SelfHealingActivityData {
  recent_fixes: SelfHealingFix[];
  total_fixed_this_month: number;
  avg_improvement_percentage: number;
}

// Dashboard Props
export interface DashboardProps {
  metricsData?: SLIMetricsData | null;
  sloTargetsData?: SLOTargetsData | null;
  errorBudgetsData?: ErrorBudgetsData | null;
  complianceData?: SLAComplianceData | null;
  selfHealingData?: SelfHealingActivityData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  theme?: 'light' | 'dark';
}

// Component-specific props
export interface MetricsPanelProps {
  data: ComponentMetric[];
  isLoading?: boolean;
}

export interface BudgetBurndownProps {
  budgets: ComponentErrorBudget[];
  isLoading?: boolean;
}

export interface ComplianceTrackerProps {
  data: ComplianceEntry[];
  isLoading?: boolean;
}

export interface HealthScoresProps {
  metrics: ComponentMetric[];
  isLoading?: boolean;
}

export interface SelfHealingActivityProps {
  data: SelfHealingActivityData | null;
  isLoading?: boolean;
}

// Hook return types
export interface UseSLOMetricsReturn {
  data: SLIMetricsData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseErrorBudgetReturn {
  budgets: ComponentErrorBudget[];
  isLoading: boolean;
  error: Error | null;
  getBurnRate: (componentId: string) => number;
  getTimeToBreachHours: (componentId: string) => number | null;
}

export interface UseComplianceStatusReturn {
  compliance: ComplianceEntry[];
  isLoading: boolean;
  error: Error | null;
  isCompliant: boolean;
  breachedComponents: string[];
}
