import React, { useState, useMemo } from 'react';
import { ChevronDown, Filter, X, Plus, Zap, Eye, EyeOff, Layers } from 'lucide-react';

/**
 * OperationSelector - Sophisticated multi-strategy operation selection component
 * 
 * Strategies:
 * 1. Category-based: Select by operation type (sequences, plugins, topics, gaps)
 * 2. Pattern-matching: Search by name or regex
 * 3. Time window: Select operations within time range
 * 4. Frequency: Select by occurrence count (hot paths)
 * 5. Performance: Select by duration (slow operations)
 * 6. Smart presets: Domain-specific preset filters
 */
export default function OperationSelector() {
  // Selection state
  const [activeStrategy, setActiveStrategy] = useState('categories');
  const [selectedOps, setSelectedOps] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Filter states
  const [categoryFilters, setCategoryFilters] = useState(new Set(['sequences', 'topics']));
  const [searchPattern, setSearchPattern] = useState('');
  const [searchIsRegex, setSearchIsRegex] = useState(false);
  const [timeWindowStart, setTimeWindowStart] = useState(0);
  const [timeWindowEnd, setTimeWindowEnd] = useState(28.35);
  const [frequencyThreshold, setFrequencyThreshold] = useState(1);
  const [durationThreshold, setDurationThreshold] = useState(0);

  // Mock telemetry data structure
  const telemetryData = {
    sequences: [
      { id: 'lib-component-drag', name: 'Library Component Drag', duration: 10, timestamp: 16.224, count: 1 },
      { id: 'lib-component-drop', name: 'Library Component Drop', duration: 14, timestamp: 19.077, count: 1 },
      { id: 'canvas-create', name: 'Canvas Component Create', duration: 58, timestamp: 21.474, count: 1 },
      { id: 'system-init', name: 'System Init', duration: 3073, timestamp: 0, count: 1 },
      { id: 'control-panel-init', name: 'Control Panel UI Init', duration: 379, timestamp: 3.295, count: 1 },
    ],
    plugins: [
      { id: 'canvas-plugin', name: 'CanvasComponentPlugin', count: 48, failures: 24, type: 'create' },
      { id: 'selection-plugin', name: 'CanvasComponentSelectionPlugin', count: 32, failures: 0, type: 'select' },
      { id: 'svg-plugin', name: 'CanvasComponentSvgNodeSelectionPlugin', count: 15, failures: 0, type: 'select' },
      { id: 'control-panel', name: 'ControlPanelPlugin', count: 8, failures: 0, type: 'ui' },
      { id: 'library', name: 'LibraryComponentPlugin', count: 6, failures: 3, type: 'library' },
    ],
    topics: [
      { id: 'canvas:component:create', name: 'canvas:component:create', count: 1, lastSeen: 17.303, category: 'creation' },
      { id: 'canvas:component:render', name: 'canvas:component:render-react', count: 1, lastSeen: 17.303, category: 'render' },
      { id: 'canvas:component:select', name: 'canvas:component:select', count: 1, lastSeen: 17.308, category: 'selection' },
      { id: 'react-block', name: '⚠️ React Render Block', count: 1, lastSeen: 21.5, category: 'performance' },
      { id: 'library:load', name: 'Library Load', count: 2, lastSeen: 6.361, category: 'data' },
    ],
    gaps: [
      { id: 'gap-user-idle', name: 'Gap (user idle)', duration: 2626, timestamp: 3.674, type: 'idle' },
      { id: 'gap-no-activity', name: 'Gap (no activity)', duration: 9771, timestamp: 6.453, type: 'idle' },
      { id: 'gap-user-release', name: 'Gap (user release)', duration: 2843, timestamp: 16.234, type: 'deadtime' },
      { id: 'gap-react-block', name: '⚠️ React Blocking (DEAD TIME)', duration: 2383, timestamp: 19.091, type: 'critical' },
    ],
  };

  // Organize operations by category
  const organizationMap = {
    sequences: { label: 'Sequences', data: telemetryData.sequences, icon: '📝' },
    plugins: { label: 'Plugins', data: telemetryData.plugins, icon: '🔌' },
    topics: { label: 'Event Topics', data: telemetryData.topics, icon: '📢' },
    gaps: { label: 'Dead Time Zones', data: telemetryData.gaps, icon: '⏸️' },
  };

  // Strategy 1: Category-based filtering
  const categoryResults = useMemo(() => {
    const results = [];
    Array.from(categoryFilters).forEach(cat => {
      if (organizationMap[cat]) {
        results.push(...organizationMap[cat].data);
      }
    });
    return results;
  }, [categoryFilters]);

  // Strategy 2: Pattern matching (search + optional regex)
  const patternResults = useMemo(() => {
    if (!searchPattern) return [];
    
    try {
      const matcher = searchIsRegex 
        ? new RegExp(searchPattern, 'i')
        : searchPattern;

      return Object.values(telemetryData).flat().filter(op => {
        const name = op.name || '';
        if (searchIsRegex) {
          return matcher.test(name);
        } else {
          return name.toLowerCase().includes(matcher.toLowerCase());
        }
      });
    } catch (e) {
      return [];
    }
  }, [searchPattern, searchIsRegex]);

  // Strategy 3: Time window filtering
  const timeWindowResults = useMemo(() => {
    return Object.values(telemetryData).flat().filter(op => {
      const ts = op.timestamp || 0;
      return ts >= timeWindowStart && ts <= timeWindowEnd;
    });
  }, [timeWindowStart, timeWindowEnd]);

  // Strategy 4: Frequency analysis (hot paths)
  const frequencyResults = useMemo(() => {
    return Object.values(telemetryData).flat()
      .filter(op => (op.count || 0) >= frequencyThreshold)
      .sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [frequencyThreshold]);

  // Strategy 5: Performance/duration filtering
  const performanceResults = useMemo(() => {
    return Object.values(telemetryData).flat()
      .filter(op => (op.duration || 0) >= durationThreshold)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
  }, [durationThreshold]);

  // Smart presets
  const smartPresets = [
    {
      id: 'critical-path',
      label: '🔴 Critical Path',
      description: 'React block + drop/create sequence',
      apply: () => {
        setSelectedOps(new Set(['lib-component-drop', 'gap-react-block', 'canvas-create', 'gap-user-release']));
      },
    },
    {
      id: 'plugin-health',
      label: '🔧 Plugin Health Check',
      description: 'Plugins with failures',
      apply: () => {
        setSelectedOps(new Set(['canvas-plugin', 'library', 'canvas-plugin']));
      },
    },
    {
      id: 'user-interaction',
      label: '👆 User Interactions',
      description: 'Drag, drop, and theme toggles',
      apply: () => {
        setSelectedOps(new Set(['lib-component-drag', 'lib-component-drop', 'header-theme-toggle']));
      },
    },
    {
      id: 'render-ops',
      label: '🎨 Render Operations',
      description: 'All UI rendering events',
      apply: () => {
        setCategoryFilters(new Set(['topics']));
        setSearchPattern('render');
      },
    },
    {
      id: 'initialization',
      label: '🚀 Initialization Phase',
      description: 'System startup (0-5s)',
      apply: () => {
        setTimeWindowStart(0);
        setTimeWindowEnd(5);
        setActiveStrategy('timeWindow');
      },
    },
    {
      id: 'dead-zones',
      label: '💀 Dead Time Analysis',
      description: 'All gaps and blocking ops',
      apply: () => {
        setCategoryFilters(new Set(['gaps']));
        setActiveStrategy('categories');
      },
    },
  ];

  // Get active results based on strategy
  const getActiveResults = () => {
    switch (activeStrategy) {
      case 'categories': return categoryResults;
      case 'pattern': return patternResults;
      case 'timeWindow': return timeWindowResults;
      case 'frequency': return frequencyResults;
      case 'performance': return performanceResults;
      default: return [];
    }
  };

  const activeResults = getActiveResults();

  // Toggle group expansion
  const toggleGroup = (groupId) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(groupId)) {
      newSet.delete(groupId);
    } else {
      newSet.add(groupId);
    }
    setExpandedGroups(newSet);
  };

  // Toggle operation selection
  const toggleOp = (opId) => {
    const newSet = new Set(selectedOps);
    if (newSet.has(opId)) {
      newSet.delete(opId);
    } else {
      newSet.add(opId);
    }
    setSelectedOps(newSet);
  };

  // Select all active results
  const selectAll = () => {
    const newSet = new Set(selectedOps);
    activeResults.forEach(op => {
      newSet.add(op.id);
    });
    setSelectedOps(newSet);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedOps(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold">Operation Selector</h1>
          </div>
          <p className="text-slate-400">
            Sophisticated filtering to focus time series analysis on specific operations
          </p>
        </div>

        {/* Smart Presets */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">⚡ Smart Presets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {smartPresets.map(preset => (
              <button
                key={preset.id}
                onClick={preset.apply}
                className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-600 rounded-lg p-3 text-left transition-all group"
              >
                <p className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {preset.label}
                </p>
                <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Strategy Selection and Filters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Strategy Tabs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-cyan-400" />
                Filtering Strategies
              </h2>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'categories', label: 'By Category' },
                  { id: 'pattern', label: 'Pattern Search' },
                  { id: 'timeWindow', label: 'Time Window' },
                  { id: 'frequency', label: 'Hot Paths' },
                  { id: 'performance', label: 'Slow Ops' },
                ].map(strategy => (
                  <button
                    key={strategy.id}
                    onClick={() => setActiveStrategy(strategy.id)}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                      activeStrategy === strategy.id
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {strategy.label}
                  </button>
                ))}
              </div>

              {/* Strategy-specific controls */}
              {activeStrategy === 'categories' && (
                <div className="space-y-3">
                  <label className="text-sm text-slate-300">Select operation types:</label>
                  <div className="space-y-2">
                    {Object.entries(organizationMap).map(([key, meta]) => (
                      <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-700/30 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryFilters.has(key)}
                          onChange={(e) => {
                            const newSet = new Set(categoryFilters);
                            if (e.target.checked) {
                              newSet.add(key);
                            } else {
                              newSet.delete(key);
                            }
                            setCategoryFilters(newSet);
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">{meta.icon} {meta.label}</span>
                        <span className="text-xs text-slate-400 ml-auto">
                          {meta.data.length} ops
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeStrategy === 'pattern' && (
                <div className="space-y-3">
                  <label className="text-sm text-slate-300">Search pattern:</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={searchPattern}
                      onChange={(e) => setSearchPattern(e.target.value)}
                      placeholder="e.g., 'canvas' or '^canvas:component:.*create$'"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={searchIsRegex}
                        onChange={(e) => setSearchIsRegex(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span>Treat as regex</span>
                    </label>
                  </div>
                  {searchPattern && (
                    <p className="text-xs text-slate-400">
                      Found {patternResults.length} matching operation(s)
                    </p>
                  )}
                </div>
              )}

              {activeStrategy === 'timeWindow' && (
                <div className="space-y-3">
                  <label className="text-sm text-slate-300">Time window (seconds):</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400">Start: {timeWindowStart.toFixed(2)}s</label>
                      <input
                        type="range"
                        min="0"
                        max="28.35"
                        step="0.5"
                        value={timeWindowStart}
                        onChange={(e) => setTimeWindowStart(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">End: {timeWindowEnd.toFixed(2)}s</label>
                      <input
                        type="range"
                        min="0"
                        max="28.35"
                        step="0.5"
                        value={timeWindowEnd}
                        onChange={(e) => setTimeWindowEnd(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Found {timeWindowResults.length} operation(s) in window
                  </p>
                </div>
              )}

              {activeStrategy === 'frequency' && (
                <div className="space-y-3">
                  <label className="text-sm text-slate-300">Minimum occurrence count:</label>
                  <input
                    type="number"
                    min="1"
                    value={frequencyThreshold}
                    onChange={(e) => setFrequencyThreshold(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-50"
                  />
                  <p className="text-xs text-slate-400">
                    Found {frequencyResults.length} high-frequency operation(s)
                  </p>
                </div>
              )}

              {activeStrategy === 'performance' && (
                <div className="space-y-3">
                  <label className="text-sm text-slate-300">Minimum duration (ms):</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={durationThreshold}
                    onChange={(e) => setDurationThreshold(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-50"
                  />
                  <p className="text-xs text-slate-400">
                    Found {performanceResults.length} slow operation(s)
                  </p>
                </div>
              )}
            </div>

            {/* Results Preview */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  Available Operations ({activeResults.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeResults.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4 text-center">No operations match current filter</p>
                ) : (
                  activeResults.map(op => (
                    <label
                      key={op.id}
                      className="flex items-center gap-3 p-3 bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOps.has(op.id)}
                        onChange={() => toggleOp(op.id)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{op.name}</p>
                        <div className="flex gap-3 text-xs text-slate-400 mt-1">
                          {op.duration && <span>{op.duration}ms</span>}
                          {op.count && <span>×{op.count}</span>}
                          {op.timestamp !== undefined && <span>@{op.timestamp}s</span>}
                          {op.failures && <span className="text-red-400">🚨 {op.failures} failures</span>}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Selection Summary */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur sticky top-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Selection Summary
              </h2>

              <div className="bg-slate-900/50 rounded p-4 mb-4">
                <p className="text-3xl font-bold text-cyan-400">{selectedOps.size}</p>
                <p className="text-xs text-slate-400 mt-1">operations selected</p>
              </div>

              {selectedOps.size > 0 && (
                <>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Selected:</p>
                    {Array.from(selectedOps).map(opId => {
                      const op = Object.values(telemetryData).flat().find(o => o.id === opId);
                      return (
                        <div key={opId} className="flex items-center justify-between bg-slate-900/50 rounded p-2 text-xs">
                          <span className="text-slate-300 truncate">{op?.name || opId}</span>
                          <button
                            onClick={() => toggleOp(opId)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={clearSelection}
                    className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded text-sm text-red-300 transition-colors"
                  >
                    Clear All
                  </button>
                </>
              )}

              {selectedOps.size === 0 && (
                <div className="text-center py-8">
                  <EyeOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Select operations to analyze</p>
                </div>
              )}

              {selectedOps.size > 0 && (
                <button className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm font-semibold transition-colors">
                  Analyze Selected ({selectedOps.size})
                </button>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <p className="text-xs text-blue-200 leading-relaxed">
                <strong>💡 Pro Tip:</strong> Use presets to quickly focus on critical paths, then refine with detailed filters. Combine strategies to narrow down noise.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-slate-800/30 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-sm text-slate-400">
            Total Operations Available: {Object.values(telemetryData).flat().length}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Filter strategies reduce cognitive load and help identify patterns in time series data
          </p>
        </div>
      </div>
    </div>
  );
}
