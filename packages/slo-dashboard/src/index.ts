// Export types
export * from './types/slo.types';

// Export components
export { default as Dashboard } from './components/Dashboard';
export { 
  MetricsPanel, 
  BudgetBurndown, 
  ComplianceTrackerComponent, 
  HealthScores, 
  SelfHealingActivity 
} from './components';

// Export hooks
export { useSLOMetrics, useErrorBudget, useComplianceStatus } from './hooks';

// Export services
export { MetricsLoader, SLOTargetsLoader, ErrorBudgetsLoader, ComplianceLoader } from './services/metricsLoader';
export { BudgetEngine } from './services/budgetEngine';
export { ComplianceTracker } from './services/complianceTracker';
export { DataUpdater } from './services/dataUpdater';

// Export styles
import './styles/variables.css';
import './styles/dashboard.css';
import './styles/metrics-panel.css';

// Plugin runtime registration placeholder (for renderx aggregation)
export function register() {
  return { plugin: 'slo-dashboard', registered: true };
}
