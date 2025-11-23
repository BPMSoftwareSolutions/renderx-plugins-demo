import { useState, useEffect, useCallback } from 'react';
import { ComplianceEntry, UseComplianceStatusReturn } from '../types/slo.types';
import { ComplianceLoader } from '../services/metricsLoader';
import ComplianceTracker from '../services/complianceTracker';

/**
 * useComplianceStatus Hook
 * Manages SLA compliance tracking and breach detection
 */
export function useComplianceStatus(
  sourceUrl?: string,
  autoRefresh: boolean = true,
  refreshIntervalMs: number = 60000
): UseComplianceStatusReturn {
  const [compliance, setCompliance] = useState<ComplianceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loader = new ComplianceLoader();
  const tracker = new ComplianceTracker();

  const refresh = useCallback(async () => {
    if (!sourceUrl) {
      setError(new Error('Source URL not provided'));
      return;
    }

    setIsLoading(true);
    try {
      const data = await loader.loadFromFile(sourceUrl);
      setCompliance(data.compliance_entries);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setCompliance([]);
    } finally {
      setIsLoading(false);
    }
  }, [sourceUrl, loader]);

  const isCompliant = useCallback((): boolean => {
    return tracker.getOverallCompliance(compliance);
  }, [compliance, tracker]);

  const breachedComponents = useCallback((): string[] => {
    return tracker.getBreachedComponents(compliance);
  }, [compliance, tracker]);

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
    compliance,
    isLoading,
    error,
    isCompliant: isCompliant(),
    breachedComponents: breachedComponents(),
  };
}

export default useComplianceStatus;
