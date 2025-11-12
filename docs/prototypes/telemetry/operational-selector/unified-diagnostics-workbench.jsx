import React, { useState, useMemo } from 'react';
import OperationSelector from './operation-selector';
import TimeSeriesAnalysis from './time-series-analysis';
import { Grid3x3 } from 'lucide-react';

/**
 * UnifiedDiagnosticsWorkbench
 * 
 * Complete integrated system combining:
 * - Multi-strategy operation selector
 * - Real-time time series analysis
 * - Synchronized state management
 * - Dual-pane layout with responsive design
 */
export default function UnifiedDiagnosticsWorkbench() {
  // Selection state (shared between components)
  const [selectedOps, setSelectedOps] = useState(new Set());
  const [layoutMode, setLayoutMode] = useState('split'); // 'split' | 'stacked' | 'fullscreen'
  const [selectorExpanded, setSelectorExpanded] = useState(true);
  const [analysisExpanded, setAnalysisExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Top Bar */}
      <div className="bg-slate-900/80 border-b border-slate-700 backdrop-blur sticky top-0 z-50">
        <div className="max-w-full mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3x3 className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold">RenderX Unified Diagnostics</h1>
              <span className="text-xs bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded border border-cyan-600/50">
                Integrated Analysis Workbench
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Layout Mode Selector */}
              <div className="flex gap-1 bg-slate-800 rounded p-1 border border-slate-700">
                <button
                  onClick={() => setLayoutMode('split')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    layoutMode === 'split'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Split
                </button>
                <button
                  onClick={() => setLayoutMode('stacked')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    layoutMode === 'stacked'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Stacked
                </button>
                <button
                  onClick={() => setLayoutMode('fullscreen')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    layoutMode === 'fullscreen'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fullscreen
                </button>
              </div>

              {/* Selection Counter */}
              <div className="text-sm font-mono text-slate-400">
                Selected: <span className="text-cyan-400 font-bold">{selectedOps.size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 py-6">
        {layoutMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
            {/* Selector Pane */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
                <div
                  className="bg-slate-900/50 border-b border-slate-700 px-6 py-4 cursor-pointer hover:bg-slate-900/70 transition-colors"
                  onClick={() => setSelectorExpanded(!selectorExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-cyan-300">Operation Selector</h2>
                    <span className={`transform transition-transform ${selectorExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {selectorExpanded && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                    <OperationSelector onSelectionChange={setSelectedOps} />
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Pane */}
            <div>
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
                <div
                  className="bg-slate-900/50 border-b border-slate-700 px-6 py-4 cursor-pointer hover:bg-slate-900/70 transition-colors"
                  onClick={() => setAnalysisExpanded(!analysisExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-cyan-300">Time Series Analysis</h2>
                    <span className={`transform transition-transform ${analysisExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {analysisExpanded && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                    <TimeSeriesAnalysis selectedOperations={selectedOps} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {layoutMode === 'stacked' && (
          <div className="space-y-6 max-w-full">
            {/* Selector Pane */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
              <div
                className="bg-slate-900/50 border-b border-slate-700 px-6 py-4 cursor-pointer hover:bg-slate-900/70 transition-colors"
                onClick={() => setSelectorExpanded(!selectorExpanded)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-cyan-300">Operation Selector</h2>
                  <span className={`transform transition-transform ${selectorExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {selectorExpanded && (
                <div className="max-h-[50vh] overflow-y-auto">
                  <OperationSelector onSelectionChange={setSelectedOps} />
                </div>
              )}
            </div>

            {/* Analysis Pane */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
              <div
                className="bg-slate-900/50 border-b border-slate-700 px-6 py-4 cursor-pointer hover:bg-slate-900/70 transition-colors"
                onClick={() => setAnalysisExpanded(!analysisExpanded)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-cyan-300">Time Series Analysis</h2>
                  <span className={`transform transition-transform ${analysisExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {analysisExpanded && (
                <div className="max-h-[50vh] overflow-y-auto">
                  <TimeSeriesAnalysis selectedOperations={selectedOps} />
                </div>
              )}
            </div>
          </div>
        )}

        {layoutMode === 'fullscreen' && (
          <div className="space-y-6 max-w-full">
            {/* Currently Show Analysis, Selector Available via Modal */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-900/50 border-b border-slate-700 px-6 py-4">
                <h2 className="font-semibold text-cyan-300">
                  Time Series Analysis
                  <span className="text-xs text-slate-400 ml-2">
                    ({selectedOps.size} operations selected)
                  </span>
                </h2>
              </div>

              <div>
                <TimeSeriesAnalysis selectedOperations={selectedOps} />
              </div>
            </div>

            {/* Collapsed Selector */}
            <div className="fixed bottom-8 right-8">
              <button
                onClick={() => {
                  // In a real implementation, this would open a modal
                  setSelectorExpanded(!selectorExpanded);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-sm shadow-lg transition-colors flex items-center gap-2"
              >
                <span>⚙️</span>
                Configure Operations
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-700 bg-slate-900/30 mt-12 px-8 py-4">
        <div className="max-w-full">
          <p className="text-xs text-slate-500">
            💡 <strong>Tip:</strong> Use the Operation Selector to choose which operations to analyze,
            then view them in multiple visualization modes in the Time Series Analysis pane.
            Toggle layout modes at the top to find your preferred workspace.
          </p>
        </div>
      </div>
    </div>
  );
}

// Export individual components for standalone use
export { default as OperationSelector } from './operation-selector';
export { default as TimeSeriesAnalysis } from './time-series-analysis';
