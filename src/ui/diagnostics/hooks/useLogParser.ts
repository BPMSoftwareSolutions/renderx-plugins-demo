/**
 * useLogParser Hook
 * 
 * Manages state for parsing sequence execution logs.
 * Part of the Diagnostic Sequence Player MVP (Issue #305).
 * 
 * @see docs/refactoring/diagnostics-modularity-strategy.md
 */

import { useState, useCallback } from 'react';
import { parseLog, calculateExecutionStats, exportAsJson } from '../services';
import type { ParsedExecution, LogInput, ExecutionStats } from '../types';

/**
 * Hook for managing log parsing state and operations
 * 
 * @returns Object containing parsed execution, stats, and parsing functions
 */
export function useLogParser() {
  const [execution, setExecution] = useState<ParsedExecution | null>(null);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Parses log input and updates state
   * 
   * @param input - Log input containing content and format
   */
  const parse = useCallback((input: LogInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = parseLog(input);

      if (result.success && result.execution) {
        setExecution(result.execution);
        setStats(calculateExecutionStats(result.execution));
        setError(null);
      } else {
        setExecution(null);
        setStats(null);
        setError(result.error || 'Unknown parsing error');
      }
    } catch (err) {
      setExecution(null);
      setStats(null);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Parses JSON log content
   * 
   * @param content - JSON string containing execution data
   */
  const parseJson = useCallback((content: string) => {
    parse({ content, format: 'json' });
  }, [parse]);

  /**
   * Parses text log content
   * 
   * @param content - Text string containing execution data
   */
  const parseText = useCallback((content: string) => {
    parse({ content, format: 'text' });
  }, [parse]);

  /**
   * Clears the current parsed execution and stats
   */
  const clear = useCallback(() => {
    setExecution(null);
    setStats(null);
    setError(null);
  }, []);

  /**
   * Exports the current execution as JSON string
   * 
   * @returns JSON string or null if no execution
   */
  const exportJson = useCallback((): string | null => {
    if (!execution) return null;
    return exportAsJson(execution);
  }, [execution]);

  return {
    execution,
    stats,
    error,
    isLoading,
    parse,
    parseJson,
    parseText,
    clear,
    exportJson
  };
}

