/**
 * SequencePlayer Component
 * 
 * Main component for the Diagnostic Sequence Player MVP.
 * Combines LogParser, SequenceTimeline, and ExecutionStats.
 * Part of Issue #305.
 */

import React from 'react';
import { useLogParser } from '../../hooks';
import { LogParser } from './LogParser';
import { SequenceTimeline } from './SequenceTimeline';
import { ExecutionStats } from './ExecutionStats';

export const SequencePlayer: React.FC = () => {
  const {
    execution,
    stats,
    error,
    isLoading,
    autoConverted,
    allExecutions,
    currentIndex,
    totalSequences,
    hasMultipleSequences,
    parse,
    clear,
    exportJson,
    goToSequence,
    nextSequence,
    prevSequence
  } = useLogParser();

  // Calculate aggregate stats for all sequences
  const aggregateStats = React.useMemo(() => {
    if (allExecutions.length === 0) return null;

    const totalDuration = allExecutions.reduce((sum, exec) => sum + exec.totalDuration, 0);
    const successCount = allExecutions.filter(exec => exec.status === 'success').length;
    const errorCount = allExecutions.filter(exec => exec.status === 'error').length;

    return {
      totalSequences: allExecutions.length,
      totalDuration,
      successCount,
      errorCount,
      successRate: Math.round((successCount / allExecutions.length) * 100)
    };
  }, [allExecutions]);

  const handleExport = () => {
    const json = exportJson();
    if (!json) return;

    // Create a blob and download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${execution?.requestId || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sequence-player" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem',
      height: '100%',
      overflow: 'auto'
    }}>
      <LogParser
        onParse={parse}
        isLoading={isLoading}
        error={error}
      />

      {autoConverted && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '4px',
          color: '#2e7d32',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <span>
            <strong>Auto-converted from console log format!</strong>
            {' '}Your console logs were automatically detected and converted to JSON.
          </span>
        </div>
      )}

      {hasMultipleSequences && aggregateStats && (
        <>
          <div style={{
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1976d2' }}>
              📊 Aggregate Stats (All Sequences)
            </h3>
            <div className="aggregate-stats-grid">
              <div>
                <strong>Total Sequences:</strong> {aggregateStats.totalSequences}
              </div>
              <div>
                <strong>Total Duration:</strong> {aggregateStats.totalDuration.toFixed(1)}ms
              </div>
              <div>
                <strong>Success Rate:</strong> {aggregateStats.successRate}% ({aggregateStats.successCount}/{aggregateStats.totalSequences})
              </div>
              {aggregateStats.errorCount > 0 && (
                <div style={{ color: '#d32f2f' }}>
                  <strong>Failed:</strong> {aggregateStats.errorCount}
                </div>
              )}
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                Showing sequence {currentIndex + 1} of {totalSequences}
              </span>

              <select
                value={currentIndex}
                onChange={(e) => goToSequence(Number(e.target.value))}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '0.9rem',
                  minWidth: '300px'
                }}
              >
                {allExecutions.map((exec, index) => (
                  <option key={index} value={index}>
                    {index + 1}. {exec.sequenceName} ({exec.totalDuration}ms)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={prevSequence}
                disabled={currentIndex === 0}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: currentIndex === 0 ? '#f5f5f5' : '#fff',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Previous
              </button>
              <button
                onClick={nextSequence}
                disabled={currentIndex === totalSequences - 1}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: currentIndex === totalSequences - 1 ? '#f5f5f5' : '#fff',
                  cursor: currentIndex === totalSequences - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {execution && stats && (
        <>
          <ExecutionStats
            stats={stats}
            onExport={handleExport}
          />

          <SequenceTimeline execution={execution} />

          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <button
              onClick={clear}
              className="button-secondary"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Results
            </button>
          </div>
        </>
      )}

      {!execution && !error && !isLoading && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '4px',
          margin: '1rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Diagnostic Sequence Player
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            Paste or upload a sequence execution log to visualize what happened
          </div>
        </div>
      )}
    </div>
  );
};

