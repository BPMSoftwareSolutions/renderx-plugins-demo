import React, { useMemo } from 'react';
import { BudgetBurndownProps, ComponentErrorBudget } from '../types/slo.types';
import BudgetEngine from '../services/budgetEngine';
import '../styles/metrics-panel.css';

/**
 * BudgetBurndown Component
 * Shows error budget consumption and remaining with burndown chart
 */
export const BudgetBurndown: React.FC<BudgetBurndownProps> = ({ budgets, isLoading }) => {
  const engine = new BudgetEngine();

  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => b.consumption_percentage - a.consumption_percentage);
  }, [budgets]);

  const getProgressColor = (percentage: number): string => {
    if (percentage < 70) return '#10B981'; // green
    if (percentage < 90) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const calculateProjection = (budget: ComponentErrorBudget) => {
    return engine.getMonthEndProjection(budget);
  };

  if (isLoading) {
    return <div className="budget-burndown loading">Loading budgets...</div>;
  }

  return (
    <div className="budget-burndown">
      <h2>Error Budget Status</h2>
      <div className="budget-summary">
        <div className="summary-stat">
          <span className="label">Total Budget</span>
          <span className="value">
            {budgets.reduce((sum, b) => sum + b.monthly_budget, 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-stat">
          <span className="label">Consumed</span>
          <span className="value" style={{ color: '#EF4444' }}>
            {budgets.reduce((sum, b) => sum + b.consumed, 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-stat">
          <span className="label">Remaining</span>
          <span className="value" style={{ color: '#10B981' }}>
            {budgets.reduce((sum, b) => sum + b.remaining, 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="budgets-grid">
        {sortedBudgets.map((budget: ComponentErrorBudget) => {
          const projection = calculateProjection(budget);
          const burnRate = engine.calculateBurnRate(budget);

          return (
            <div key={budget.component} className="budget-card">
              <div className="budget-header">
                <h3>{budget.component}</h3>
                <div
                  className="status-badge"
                  style={{ backgroundColor: engine.getStatusColor(budget.status) }}
                >
                  {budget.status}
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(budget.consumption_percentage, 100)}%`,
                    backgroundColor: getProgressColor(budget.consumption_percentage),
                  }}
                />
              </div>

              <div className="budget-stats">
                <div className="stat">
                  <span className="label">Consumed</span>
                  <span className="value">{budget.consumed.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="label">Remaining</span>
                  <span className="value">{budget.remaining.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="label">Monthly Budget</span>
                  <span className="value">{budget.monthly_budget.toLocaleString()}</span>
                </div>
              </div>

              <div className="burn-rate">
                <span className="label">Burn Rate: {burnRate.toFixed(2)} failures/hour</span>
              </div>

              {budget.time_to_breach_hours !== null && (
                <div className="breach-warning">
                  ⚠️ Breach in {engine.getDaysRemaining(budget)} days ({budget.time_to_breach_hours.toFixed(1)}h)
                </div>
              )}

              <div className="projection">
                <div className="projection-title">Month-end Projection:</div>
                <div className="projection-stat">
                  <span>Projected: {projection.projected_consumption.toLocaleString()}</span>
                  <span
                    style={{
                      color: projection.will_breach ? '#EF4444' : '#10B981',
                    }}
                  >
                    {projection.will_breach ? '❌ WILL BREACH' : '✅ Within budget'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetBurndown;
