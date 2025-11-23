import { useState, useEffect, useCallback } from 'react';
import { ComponentErrorBudget, UseErrorBudgetReturn } from '../types/slo.types';
import { ErrorBudgetsLoader } from '../services/metricsLoader';
import BudgetEngine from '../services/budgetEngine';

/**
 * useErrorBudget Hook
 * Manages error budget state and provides calculations
 */
export function useErrorBudget(
  sourceUrl?: string,
  autoRefresh: boolean = true,
  refreshIntervalMs: number = 60000
): UseErrorBudgetReturn {
  const [budgets, setBudgets] = useState<ComponentErrorBudget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loader = new ErrorBudgetsLoader();
  const engine = new BudgetEngine();

  const refresh = useCallback(async () => {
    if (!sourceUrl) {
      setError(new Error('Source URL not provided'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await loader.loadFromFile(sourceUrl);
      setBudgets(data.budgets);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  }, [sourceUrl, loader]);

  const getBurnRate = useCallback((componentId: string): number => {
    const budget = budgets.find(b => b.component === componentId);
    return budget ? engine.calculateBurnRate(budget) : 0;
  }, [budgets, engine]);

  const getTimeToBreachHours = useCallback((componentId: string): number | null => {
    const budget = budgets.find(b => b.component === componentId);
    return budget ? engine.getTimeToBreachHours(budget) : null;
  }, [budgets, engine]);

  useEffect(() => {
    // Initial load
    refresh();

    // Set up auto-refresh interval
    if (autoRefresh && sourceUrl) {
      const interval = setInterval(refresh, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [refresh, autoRefresh, refreshIntervalMs, sourceUrl]);

  return {
    budgets,
    isLoading,
    error,
    getBurnRate,
    getTimeToBreachHours,
  };
}

export default useErrorBudget;
