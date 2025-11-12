import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { AlertTriangle, TrendingDown, Zap, Eye } from 'lucide-react';

export default function SessionTimelineReport() {
  const [viewMode, setViewMode] = useState('waterfall');
  const [highlightGaps, setHighlightGaps] = useState(true);

  // Session data
  const sessionStart = new Date('2025-11-10T21:56:16.932Z').getTime();
  const operations = [
    { name: 'System Init', start: 0, duration: 3073, type: 'Init', color: '#6366f1' },
    { name: 'Header UI Theme Get', start: 3073, duration: 144, type: 'Header', color: '#f59e0b' },
    { name: 'Library Load', start: 3217, duration: 78, type: 'Data', color: '#8b5cf6' },
    { name: 'Control Panel UI Init', start: 3295, duration: 379, type: 'UI', color: '#ec4899' },
    { name: 'Gap (user idle)', start: 3674, duration: 2626, type: 'Gap', color: '#dc2626' },
    { name: 'Library Load', start: 6300, duration: 61, type: 'Data', color: '#8b5cf6' },
    { name: 'Control Panel UI Render', start: 6361, duration: 92, type: 'Render', color: '#10b981' },
    { name: 'Gap (no activity)', start: 6453, duration: 9771, type: 'Gap', color: '#dc2626' },
    { name: 'Library Component Drag', start: 16224, duration: 10, type: 'Interaction', color: '#3b82f6' },
    { name: 'Gap (user release)', start: 16234, duration: 2843, type: 'Gap', color: '#dc2626' },
    { name: 'Library Component Drop', start: 19077, duration: 14, type: 'Interaction', color: '#3b82f6' },
    { name: '⚠️ DEAD TIME (React render)', start: 19091, duration: 2383, type: 'BlockedBoot', color: '#ef4444' },
    { name: 'Canvas Component Create', start: 21474, duration: 58, type: 'Create', color: '#06b6d4' },
    { name: 'Gap', start: 21532, duration: 2359, type: 'Gap', color: '#dc2626' },
    { name: 'Header UI Theme Toggle', start: 23891, duration: 10, type: 'UI', color: '#f59e0b' },
    { name: 'Gap', start: 23901, duration: 3985, type: 'Gap', color: '#dc2626' },
    { name: 'Header UI Theme Toggle 2', start: 27886, duration: 14, type: 'UI', color: '#f59e0b' },
  ];

  const totalDuration = 28353;
  const totalGapTime = operations.filter(o => o.type === 'Gap').reduce((sum, o) => sum + o.duration, 0);
  const totalExecutionTime = operations.filter(o => o.type !== 'Gap').reduce((sum, o) => sum + o.duration, 0);

  // Calculate waterfalls for different views
  const processedOps = useMemo(() => {
    return operations.map((op, idx) => {
      const endTime = op.start + op.duration;
      const percentOfTotal = (op.duration / totalDuration) * 100;
      const relativeStart = (op.start / totalDuration) * 100;
      
      return {
        ...op,
        endTime,
        percentOfTotal,
        relativeStart,
        isCritical: op.duration > 100 || op.type === 'BlockedBoot',
        isAnomaly: op.duration > 200 && op.type !== 'Gap',
      };
    });
  }, []);

  // Identify critical gaps (dead zones)
  const criticalGaps = useMemo(() => {
    return processedOps
      .filter(op => op.type === 'Gap' && op.duration > 500)
      .sort((a, b) => b.duration - a.duration);
  }, [processedOps]);

  // Calculate throughput over time (operations per second)
  const throughputData = useMemo(() => {
    const buckets = {};
    const bucketSize = 2000; // 2-second buckets
    
    processedOps.forEach(op => {
      if (op.type === 'Gap') return;
      const bucket = Math.floor(op.start / bucketSize);
      const bucketTime = bucket * bucketSize;
      if (!buckets[bucketTime]) buckets[bucketTime] = { time: bucketTime, count: 0, duration: 0 };
      buckets[bucketTime].count++;
      buckets[bucketTime].duration += op.duration;
    });

    return Object.values(buckets)
      .sort((a, b) => a.time - b.time)
      .map(b => ({
        time: `${(b.time / 1000).toFixed(1)}s`,
        timeMs: b.time,
        operations: b.count,
        totalMs: b.duration,
      }));
  }, [processedOps]);

  // Heatmap intensity calculation
  const heatmapData = useMemo(() => {
    const buckets = {};
    const bucketSize = 500; // 500ms buckets
    
    for (let i = 0; i < totalDuration; i += bucketSize) {
      const bucketStart = i;
      const bucketEnd = i + bucketSize;
      let intensity = 0;
      
      processedOps.forEach(op => {
        if (op.type === 'Gap') return;
        const opStart = op.start;
        const opEnd = op.endTime;
        
        // Calculate overlap
        const overlapStart = Math.max(bucketStart, opStart);
        const overlapEnd = Math.min(bucketEnd, opEnd);
        
        if (overlapStart < overlapEnd) {
          const overlap = overlapEnd - overlapStart;
          intensity += (overlap / bucketSize);
        }
      });
      
      // Mark blocked/dead time specially
      const hasBlockedOp = processedOps.some(op => 
        op.type === 'BlockedBoot' && 
        op.start < bucketEnd && op.endTime > bucketStart
      );
      
      buckets[i] = {
        time: `${(i / 1000).toFixed(1)}s`,
        intensity: Math.min(intensity, 1),
        isBlocked: hasBlockedOp,
        timeMs: i,
      };
    }
    
    return Object.values(buckets);
  }, [processedOps]);

  // Anomaly detection
  const anomalies = useMemo(() => {
    const avgExecTime = operations
      .filter(o => o.type !== 'Gap')
      .reduce((sum, o) => sum + o.duration, 0) / operations.filter(o => o.type !== 'Gap').length;
    
    return processedOps
      .filter(op => op.type !== 'Gap' && op.duration > avgExecTime * 2.5)
      .map(op => ({
        name: op.name,
        actual: op.duration,
        expected: avgExecTime,
        deviation: ((op.duration - avgExecTime) / avgExecTime * 100).toFixed(0),
        severity: op.duration > avgExecTime * 5 ? 'critical' : 'warning',
      }));
  }, [processedOps]);

  const getTypeColor = (type) => {
    const colors = {
      'Init': '#6366f1',
      'Header': '#f59e0b',
      'Data': '#8b5cf6',
      'UI': '#ec4899',
      'Render': '#10b981',
      'Interaction': '#3b82f6',
      'Create': '#06b6d4',
      'Gap': '#94a3b8',
      'BlockedBoot': '#ef4444',
    };
    return colors[type] || '#64748b';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold">Session Timeline Analysis</h1>
          </div>
          <p className="text-slate-400">Advanced bottleneck detection for performance debugging</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
            <p className="text-slate-400 text-xs font-semibold uppercase">Total Duration</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{(totalDuration / 1000).toFixed(2)}s</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
            <p className="text-slate-400 text-xs font-semibold uppercase">Execution Time</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{(totalExecutionTime / 1000).toFixed(2)}s</p>
          </div>

          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 backdrop-blur">
            <p className="text-red-300 text-xs font-semibold uppercase">Dead Time</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{(totalGapTime / 1000).toFixed(2)}s</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
            <p className="text-slate-400 text-xs font-semibold uppercase">Utilization</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{((totalExecutionTime / totalDuration) * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['waterfall', 'heatmap', 'throughput', 'anomalies', 'gaps'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded font-medium transition-colors capitalize ${
                viewMode === mode
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Waterfall View */}
        {viewMode === 'waterfall' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Operation Waterfall Timeline
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {processedOps.map((op, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-32 text-xs font-mono truncate">
                      <p className="text-slate-400">{op.name}</p>
                    </div>
                    <div className="flex-1 relative h-6 bg-slate-900/50 rounded overflow-hidden border border-slate-700">
                      <div
                        className={`h-full rounded transition-all ${
                          op.type === 'Gap' 
                            ? 'bg-red-900/60 border-r border-red-700' 
                            : op.type === 'BlockedBoot'
                            ? 'bg-red-600/80 border-r border-red-500 animate-pulse'
                            : 'bg-gradient-to-r border-r'
                        }`}
                        style={{
                          left: `${op.relativeStart}%`,
                          width: `${op.percentOfTotal}%`,
                          backgroundImage: op.type !== 'Gap' && op.type !== 'BlockedBoot'
                            ? `linear-gradient(90deg, ${op.color}80, ${op.color}ff)`
                            : undefined,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="text-xs font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {op.duration}ms
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <p className="text-xs font-mono text-slate-400">{op.duration}ms</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 italic">
              Red blocks = dead time zones. Pulse effect = React render blocking.
            </p>
          </div>
        )}

        {/* Heatmap View */}
        {viewMode === 'heatmap' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
            <h2 className="text-xl font-semibold mb-4">Execution Intensity Heatmap</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value) => value.toFixed(2)}
                />
                <Bar dataKey="intensity" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {heatmapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isBlocked ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-500 mt-4">
              Red sections = dead time zones with zero CPU-tracked work. Blue = active execution.
            </p>
          </div>
        )}

        {/* Throughput View */}
        {viewMode === 'throughput' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
            <h2 className="text-xl font-semibold mb-4">Operations per Timeframe</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" label={{ value: 'Operations', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="operations" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-500 mt-4">
              Gaps in throughput indicate periods where no tracked operations are executing.
            </p>
          </div>
        )}

        {/* Anomalies View */}
        {viewMode === 'anomalies' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Performance Anomalies
            </h2>
            {anomalies.length === 0 ? (
              <p className="text-slate-400">No anomalies detected (all operations within expected range)</p>
            ) : (
              <div className="space-y-3">
                {anomalies.map((anomaly, idx) => (
                  <div 
                    key={idx}
                    className={`rounded p-4 border ${
                      anomaly.severity === 'critical'
                        ? 'bg-red-900/20 border-red-600/30'
                        : 'bg-amber-900/20 border-amber-600/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${
                        anomaly.severity === 'critical' ? 'text-red-300' : 'text-amber-300'
                      }`}>
                        {anomaly.name}
                      </h4>
                      <span className={`font-mono text-sm ${
                        anomaly.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        +{anomaly.deviation}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Actual: {anomaly.actual}ms vs Expected: {anomaly.expected.toFixed(0)}ms
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Critical Gaps Analysis */}
        {viewMode === 'gaps' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Critical Dead Time Zones
            </h2>
            <div className="space-y-4">
              {criticalGaps.map((gap, idx) => {
                const prevOp = processedOps[processedOps.indexOf(gap) - 1];
                const nextOp = processedOps[processedOps.indexOf(gap) + 1];
                const isReactBlocking = gap.duration > 2000 && nextOp?.name.includes('Canvas');
                
                return (
                  <div key={idx} className="bg-red-900/30 border-2 border-red-600/50 rounded p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-red-300">Gap #{idx + 1}</h4>
                      <span className="text-2xl font-bold text-red-400">{gap.duration}ms</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <p className="text-slate-400">After:</p>
                        <p className="text-slate-300 font-mono text-xs">{prevOp?.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Before:</p>
                        <p className="text-slate-300 font-mono text-xs">{nextOp?.name}</p>
                      </div>
                    </div>
                    {isReactBlocking && (
                      <div className="bg-red-950/50 border border-red-600/30 rounded p-2 text-xs text-red-200">
                        ⚠️ Likely React rendering/reconciliation blocking main thread
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Scientists' Insights */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 backdrop-blur">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">💡 Data Scientist Insights</h3>
          <div className="space-y-3 text-sm text-blue-100">
            <p>
              <strong>Utilization Rate:</strong> Your system is only {((totalExecutionTime / totalDuration) * 100).toFixed(1)}% utilized. The remaining {((totalGapTime / totalDuration) * 100).toFixed(1)}% is dead time.
            </p>
            <p>
              <strong>Bottleneck Pattern:</strong> The {criticalGaps[0]?.duration}ms gap after "{processedOps[processedOps.findIndex(op => op.duration === criticalGaps[0]?.duration) - 1]?.name}" is your critical path. This is where React blocking occurs.
            </p>
            <p>
              <strong>Recommendation:</strong> Focus optimization efforts on React component rendering in the {criticalGaps[0]?.duration / 1000}s dead zones. Consider code-splitting, memoization, or moving heavy computations off the main thread.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
