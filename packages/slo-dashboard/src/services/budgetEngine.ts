import { ComponentErrorBudget } from '../types/slo.types';

/**
 * Budget Engine Service
 * Calculates budget burn rate, remaining time to breach, and status
 */

export class BudgetEngine {
  /**
   * Calculate burn rate (failures per hour)
   */
  calculateBurnRate(budget: ComponentErrorBudget): number {
    const hourlyRate = budget.consumed / 730; // 730 hours in a month
    return Math.round(hourlyRate * 100) / 100;
  }

  /**
   * Get time to breach in hours (if status is WARNING or CRITICAL)
   */
  getTimeToBreachHours(budget: ComponentErrorBudget): number | null {
    if (budget.time_to_breach_hours === null || budget.status === 'HEALTHY') {
      return null;
    }
    return budget.time_to_breach_hours;
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'HEALTHY': '#10B981',    // green
      'WARNING': '#F59E0B',    // amber
      'CRITICAL': '#EF4444',   // red
      'BREACHED': '#7C3AED',   // purple
    };
    return colorMap[status] || '#6B7280'; // gray default
  }

  /**
   * Get alert level color
   */
  getAlertColor(level: string): string {
    const colorMap: Record<string, string> = {
      'LOW': '#10B981',      // green
      'MEDIUM': '#F59E0B',   // amber
      'HIGH': '#EF4444',     // red
    };
    return colorMap[level] || '#6B7280';
  }

  /**
   * Format remaining budget for display
   */
  formatRemainingBudget(budget: ComponentErrorBudget): string {
    if (budget.remaining < 1000) {
      return `${Math.round(budget.remaining)} failures`;
    }
    return `${(budget.remaining / 1000).toFixed(1)}K failures`;
  }

  /**
   * Determine if component is at critical risk
   */
  isCriticalRisk(budget: ComponentErrorBudget): boolean {
    return budget.status === 'CRITICAL' || budget.status === 'BREACHED';
  }

  /**
   * Get days remaining until breach
   */
  getDaysRemaining(budget: ComponentErrorBudget): number | null {
    if (budget.time_to_breach_hours === null) {
      return null;
    }
    return Math.round(budget.time_to_breach_hours / 24);
  }

  /**
   * Calculate burndown trajectory (consumed vs remaining over month)
   */
  calculateBurndownTrajectory(budget: ComponentErrorBudget): {
    consumed: number;
    remaining: number;
    percentage: number;
    daysIntoMonth: number;
  } {
    const now = new Date();
    const daysIntoPeriod = now.getDate() - 1;
    
    return {
      consumed: budget.consumed,
      remaining: budget.remaining,
      percentage: budget.consumption_percentage,
      daysIntoMonth: daysIntoPeriod,
    };
  }

  /**
   * Get daily burn rate projection
   */
  getDailyBurnRateProjection(budget: ComponentErrorBudget): number {
    const now = new Date();
    const daysIntoPeriod = now.getDate();
    
    if (daysIntoPeriod === 0) return 0;
    
    const dailyRate = budget.consumed / daysIntoPeriod;
    return Math.round(dailyRate);
  }

  /**
   * Get month-end projection
   */
  getMonthEndProjection(budget: ComponentErrorBudget): {
    projected_consumption: number;
    projected_remaining: number;
    will_breach: boolean;
  } {
    const now = new Date();
    const daysIntoPeriod = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    const dailyRate = budget.consumed / daysIntoPeriod;
    const projected_consumption = dailyRate * daysInMonth;
    const projected_remaining = budget.monthly_budget - projected_consumption;
    
    return {
      projected_consumption: Math.round(projected_consumption),
      projected_remaining: Math.max(0, Math.round(projected_remaining)),
      will_breach: projected_consumption > budget.monthly_budget,
    };
  }
}

export default BudgetEngine;
