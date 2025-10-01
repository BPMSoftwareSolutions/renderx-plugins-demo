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
  const { execution, stats, error, isLoading, parse, clear, exportJson } = useLogParser();

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

