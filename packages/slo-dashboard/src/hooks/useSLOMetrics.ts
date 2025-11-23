import { useState, useEffect, useCallback } from 'react';
import { SLIMetricsData, UseSLOMetricsReturn } from '../types/slo.types';
import { MetricsLoader } from '../services/metricsLoader';

/**
 * useSLOMetrics Hook
 * Manages SLI metrics fetching and state
 */
export function useSLOMetrics(
  sourceUrl?: string,
  autoRefresh: boolean = true,
  refreshIntervalMs: number = 30000
): UseSLOMetricsReturn {
  const [data, setData] = useState<SLIMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loader = new MetricsLoader();

  const refresh = useCallback(async () => {
    if (!sourceUrl) {
      setError(new Error('Source URL not provided'));
      return;
    }

    setIsLoading(true);
    try {
      const newData = await loader.loadFromAPI(sourceUrl);
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [sourceUrl, loader]);

  useEffect(() => {
    // Initial load
    refresh();

    // Set up auto-refresh interval
    if (autoRefresh && sourceUrl) {
      const interval = setInterval(refresh, refreshIntervalMs);
      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [refresh, autoRefresh, refreshIntervalMs, sourceUrl]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}

export default useSLOMetrics;
