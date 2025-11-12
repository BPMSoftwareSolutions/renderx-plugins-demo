import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Clock, AlertTriangle, Info } from 'lucide-react';

/**
 * TimeSeriesAnalysis - Multi-view time series visualization
 * 
 * Views:
 * - Timeline: Operations plotted on timeline
 * - Stacked Area: Operation duration over time
 * - Frequency: Operation count per time bucket
 * - Performance Profile: Duration variance analysis
 * - Sequence Flow: Event causality and dependencies
 */
export default function TimeSeriesAnalysis({ selectedOperations = new Set() }) {
  const [viewMode, setViewMode] = useState('timeline');
  const [timeBucket, setTimeBucket] = useState(500); // milliseconds per bucket
  const [showStats, setShowStats] = useState(true);

  // Mock selected operations data
  const operationTimeSeries = [
    { id: 'lib-drag', name: 'Library Drag', timestamp: 16224, duration: 10, series: [] },
    { id: 'lib-drop', name: 'Library Drop', timestamp: 19077, duration: 14, series: [] },
    { id: 'react-block', name: 'React Render Block', timestamp: 19091, duration: 2383, series: [], critical: true },
    { id: 'canvas-create', name: 'Canvas Create', timestamp: 21474, duration: 58, series: [] },
  ];

  // Populate time series data for each operation
  const timeSeriesData = useMemo(() => {
    const bucketSize = timeBucket; // ms
    const totalDuration = 28353; // ms
    const buckets = {};

    // Initialize buckets
    for (let i = 0; i < totalDuration; i += bucketSize) {
      buckets[i] = {
        time: (i / 1000).toFixed(2),
        timeMs: i,
      };
      operationTimeSeries.forEach(op => {
        buckets[i][op.id] = 0;
        buckets[i][`${op.id}_count`] = 0;
      });
    }

    // Populate operation data
    operationTimeSeries.forEach(op => {
      const startBucket = Math.floor(op.timestamp / bucketSize) * bucketSize;
      const endBucket = Math.floor((op.timestamp + op.duration) / bucketSize) * bucketSize;

      for (let i = startBucket; i <= endBucket; i += bucketSize) {
        if (buckets[i]) {
          const overlap = Math.min(op.timestamp + op.duration, i + bucketSize) -
                         Math.max(op.timestamp, i);
          buckets[i][op.id] = Math.max(buckets[i][op.id], overlap);
          buckets[i][`${op.id}_count`] = 1;
        }
      }
    });

    return Object.values(buckets).sort((a, b) => a.timeMs - b.timeMs);
  }, [timeBucket]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {};
    operationTimeSeries.forEach(op => {
      stats[op.id] = {
        name: op.name,
        duration: op.duration,
        timestamp: op.timestamp,
        percentage: ((op.duration / 28353) * 100).toFixed(1),
      };
    });
    return stats;
  }, []);

  // Calculate correlation (operations that happen in sequence)
  const sequenceFlow = useMemo(() => {
    const sorted = [...operationTimeSeries].sort((a, b) => a.timestamp - b.timestamp);
    const flow = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].timestamp - (sorted[i].timestamp + sorted[i].duration);
      flow.push({
        from: sorted[i].name,
        to: sorted[i + 1].name,
        gap,
        isCritical: gap > 100,
      });
    }
    return flow;
  }, []);

  const getOperationColor = (opId) => {
    const colors = {
      'lib-drag': '#3b82f6',
      'lib-drop': '#3b82f6',
      'react-block': '#ef4444',
      'canvas-create': '#06b6d4',
    };
    return colors[opId] || '#64748b';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold">Time Series Analysis</h1>
          </div>
          <p className="text-slate-400">
            {selectedOperations.size > 0 
              ? `Analyzing ${selectedOperations.size} selected operations`
              : 'Select operations from the Operation Selector to begin analysis'}
          </p>
        </div>

        {selectedOperations.size === 0 && (
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-8 text-center mb-8">
            <Info className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <p className="text-blue-200">Select operations to see time series analysis</p>
          </div>
        )}

        {selectedOperations.size > 0 && (
          <>
            {/* View Mode Selector */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { id: 'timeline', label: '📊 Timeline' },
                { id: 'stacked', label: '📈 Stacked Area' },
                { id: 'frequency', label: '📉 Frequency' },
                { id: 'performance', label: '⚡ Performance' },
                { id: 'flow', label: '🔗 Sequence Flow' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 flex items-center gap-4 flex-wrap">
              <label className="text-sm">
                <span className="text-slate-300 mr-2">Time Bucket:</span>
                <select
                  value={timeBucket}
                  onChange={(e) => setTimeBucket(Number(e.target.value))}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-50"
                >
                  <option value={100}>100ms</option>
                  <option value={250}>250ms</option>
                  <option value={500}>500ms</option>
                  <option value={1000}>1s</option>
                  <option value={2000}>2s</option>
                </select>
              </label>

              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={(e) => setShowStats(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-slate-300">Show Statistics</span>
              </label>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
                <h2 className="text-lg font-semibold mb-4">Operation Timeline</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number"
                      dataKey="timestamp"
                      name="Time (ms)"
                      domain={[0, 28353]}
                      label={{ value: 'Time (ms)', position: 'insideBottomRight', offset: -10 }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      type="number"
                      dataKey="duration"
                      name="Duration (ms)"
                      stroke="#94a3b8"
                      label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                      formatter={(value, name) => [`${value}ms`, name]}
                    />
                    {operationTimeSeries.map(op => (
                      <Scatter
                        key={op.id}
                        name={op.name}
                        data={[op]}
                        fill={getOperationColor(op.id)}
                        shape={op.critical ? '⚠️' : '●'}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Stacked Area View */}
            {viewMode === 'stacked' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
                <h2 className="text-lg font-semibold mb-4">Stacked Operation Duration</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    {operationTimeSeries.map(op => (
                      <Area
                        key={op.id}
                        type="monotone"
                        dataKey={op.id}
                        stackId="1"
                        stroke={getOperationColor(op.id)}
                        fill={getOperationColor(op.id)}
                        fillOpacity={0.6}
                        name={op.name}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Frequency View */}
            {viewMode === 'frequency' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
                <h2 className="text-lg font-semibold mb-4">Operation Frequency</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    {operationTimeSeries.map(op => (
                      <Bar
                        key={op.id}
                        dataKey={`${op.id}_count`}
                        stackId="frequency"
                        fill={getOperationColor(op.id)}
                        name={op.name}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Performance View */}
            {viewMode === 'performance' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
                <h2 className="text-lg font-semibold mb-4">Performance Profile</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    {operationTimeSeries.map(op => (
                      <Line
                        key={op.id}
                        type="stepAfter"
                        dataKey={op.id}
                        stroke={getOperationColor(op.id)}
                        dot={false}
                        name={op.name}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Sequence Flow View */}
            {viewMode === 'flow' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
                <h2 className="text-lg font-semibold mb-4">Event Sequence & Dependencies</h2>
                <div className="space-y-3">
                  {sequenceFlow.map((flow, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded border ${
                        flow.isCritical
                          ? 'bg-red-900/30 border-red-600/50'
                          : 'bg-slate-900/50 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm">{flow.from}</span>
                          <span className="text-cyan-400">→</span>
                          <span className="font-mono text-sm">{flow.to}</span>
                        </div>
                        {flow.isCritical && (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">Gap between operations:</p>
                        <p className={`text-sm font-mono ${
                          flow.isCritical ? 'text-red-300' : 'text-green-300'
                        }`}>
                          {flow.gap}ms
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics Panel */}
            {showStats && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Operation Statistics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {operationTimeSeries.map(op => (
                    <div
                      key={op.id}
                      className={`rounded p-4 border ${
                        op.critical
                          ? 'bg-red-900/20 border-red-600/50'
                          : 'bg-slate-900/50 border-slate-700'
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-200 mb-3">{op.name}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duration:</span>
                          <span className="text-slate-200 font-mono">{op.duration}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Start:</span>
                          <span className="text-slate-200 font-mono">{(op.timestamp / 1000).toFixed(2)}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">% of Total:</span>
                          <span className="text-slate-200 font-mono">{statistics[op.id]?.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded">
                  <p className="text-sm text-blue-200">
                    <strong>Total Duration:</strong> {operationTimeSeries.reduce((sum, op) => sum + op.duration, 0)}ms
                    {' '}
                    <strong>·</strong>
                    {' '}
                    <strong>Operations:</strong> {operationTimeSeries.length}
                    {' '}
                    <strong>·</strong>
                    {' '}
                    <strong>Critical Path:</strong> {sequenceFlow.filter(f => f.isCritical).length} gaps detected
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
