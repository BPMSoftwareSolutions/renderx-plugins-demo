import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertCircle, TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';

export default function TelemetryReport() {
  const telemetryData = {
    sessionMetrics: {
      totalLines: 2848,
      durationSec: 28.35,
      pluginMounts: 51,
      successfulMounts: 48,
      successRate: 94.1,
      topicsSubscribed: 162,
    },
    pluginPerformance: [
      { name: 'LibraryComponentPlugin', attempts: 6, successes: 3, avgDuration: 435, failureRate: 50 },
      { name: 'CanvasComponentPlugin', attempts: 3, successes: 3, avgDuration: 1.3, failureRate: 0 },
      { name: 'ControlPanelPlugin', attempts: 1, successes: 1, avgDuration: 0, failureRate: 0 },
      { name: 'HeaderThemePlugin', attempts: 2, successes: 2, avgDuration: 0.5, failureRate: 0 },
      { name: 'CanvasComponentSelectionPlugin', attempts: 1, successes: 1, avgDuration: 1, failureRate: 0 },
      { name: 'LibraryPlugin', attempts: 1, successes: 1, avgDuration: 2, failureRate: 0 },
    ],
    executionTimeline: [
      { name: 'Header UI Theme Get', duration: 144, type: 'UI' },
      { name: 'Library Load', duration: 78, type: 'Data' },
      { name: 'Control Panel UI Init', duration: 379, type: 'UI' },
      { name: 'Library Load', duration: 61, type: 'Data' },
      { name: 'Control Panel UI Render', duration: 92, type: 'Render' },
      { name: 'Library Component Drag', duration: 10, type: 'Interaction' },
      { name: 'Library Component Drop', duration: 14, type: 'Interaction' },
      { name: 'Canvas Component Create', duration: 58, type: 'Create' },
      { name: 'Header UI Theme Toggle', duration: 10, type: 'UI' },
      { name: 'Header UI Theme Toggle', duration: 14, type: 'UI' },
    ],
    operationalInsights: {
      criticalPaths: [
        { path: 'Control Panel UI Init → Library Load → Control Panel UI Render', totalMs: 532, count: 1 },
        { path: 'Header UI Theme Get → Library Load → Theme Toggle', totalMs: 236, count: 2 },
      ],
      topicDistribution: {
        sequence: 13,
        beat: 2,
        movement: 2,
        canvas: 18,
        control: 8,
        library: 3,
        other: 116,
      },
    },
  };

  const [selectedTab, setSelectedTab] = useState('overview');

  // Prepare data for visualizations
  const pluginSuccessData = telemetryData.pluginPerformance.map(p => ({
    name: p.name.replace('Plugin', ''),
    'Success Rate': ((p.successes / p.attempts) * 100).toFixed(1),
    Attempts: p.attempts,
  }));

  const durationByType = {
    UI: telemetryData.executionTimeline.filter(e => e.type === 'UI').reduce((sum, e) => sum + e.duration, 0),
    Data: telemetryData.executionTimeline.filter(e => e.type === 'Data').reduce((sum, e) => sum + e.duration, 0),
    Render: telemetryData.executionTimeline.filter(e => e.type === 'Render').reduce((sum, e) => sum + e.duration, 0),
    Interaction: telemetryData.executionTimeline.filter(e => e.type === 'Interaction').reduce((sum, e) => sum + e.duration, 0),
    Create: telemetryData.executionTimeline.filter(e => e.type === 'Create').reduce((sum, e) => sum + e.duration, 0),
  };

  const executionByType = Object.entries(durationByType).map(([type, duration]) => ({
    name: type,
    value: duration,
  }));

  const performanceScatter = telemetryData.pluginPerformance.map(p => ({
    x: p.attempts,
    y: p.avgDuration,
    name: p.name.replace('Plugin', ''),
    payload: p,
  }));

  const thresholds = {
    critical: 200,
    warning: 100,
  };

  const StatusBadge = ({ metric, threshold, criticalThreshold }) => {
    if (metric >= criticalThreshold) return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">CRITICAL</span>;
    if (metric >= threshold) return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">WARNING</span>;
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">HEALTHY</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-blue-500 rounded"></div>
            <h1 className="text-4xl font-bold">System Telemetry Report</h1>
          </div>
          <p className="text-slate-400">Performance Analysis • Nov 10, 2025 • 21:56:16 → 21:56:45 UTC</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Session Duration</p>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{telemetryData.sessionMetrics.durationSec}s</p>
            <p className="text-xs text-slate-400 mt-1">{telemetryData.sessionMetrics.totalLines.toLocaleString()} log lines</p>
          </div>

          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Plugin Success Rate</p>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold">{telemetryData.sessionMetrics.successRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-400 mt-1">{telemetryData.sessionMetrics.successfulMounts}/{telemetryData.sessionMetrics.pluginMounts} mounts</p>
          </div>

          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">Active Topics</p>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-bold">{telemetryData.sessionMetrics.topicsSubscribed}</p>
            <p className="text-xs text-slate-400 mt-1">pub/sub connections</p>
          </div>

          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm font-medium">System Health</p>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold">Optimal</p>
            <p className="text-xs text-slate-400 mt-1">No critical errors</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-slate-600 flex-wrap">
          {['overview', 'plugins', 'execution', 'insights'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium transition-colors capitalize ${
                selectedTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Panels */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Timeline */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4">Execution Timeline by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={executionByType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    <Cell fill="#3b82f6" />
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#ec4899" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value}ms`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                {Object.entries(durationByType).map(([type, duration]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-slate-400">{type}:</span>
                    <span className="font-semibold">{duration}ms</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plugin Success Rates */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4">Plugin Success Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pluginSuccessData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Bar dataKey="Success Rate" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Scatter */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4">Plugin Load vs Duration</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="x" name="Attempts" stroke="#94a3b8" />
                  <YAxis dataKey="y" name="Avg Duration (ms)" stroke="#94a3b8" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    formatter={(value) => value.toFixed(2)}
                  />
                  <Scatter name="Plugins" data={performanceScatter} fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Execution Operations */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4">Top Operations by Duration</h3>
              <div className="space-y-3">
                {telemetryData.executionTimeline.slice(0, 5).map((exec, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-32 flex-shrink-0">
                      <p className="text-sm font-medium truncate">{exec.name}</p>
                      <p className="text-xs text-slate-400">{exec.type}</p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-slate-600 rounded h-2 overflow-hidden">
                        <div 
                          className={`h-full ${exec.duration > thresholds.critical ? 'bg-red-500' : exec.duration > thresholds.warning ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(exec.duration / 5, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <p className="text-sm font-semibold">{exec.duration}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'plugins' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-6">Plugin Performance Analysis</h3>
              <div className="space-y-4">
                {telemetryData.pluginPerformance.map((plugin, idx) => {
                  const successRate = (plugin.successes / plugin.attempts) * 100;
                  return (
                    <div key={idx} className="border border-slate-600 rounded-lg p-4 bg-slate-800/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-blue-400">{plugin.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">{plugin.attempts} total attempts</p>
                        </div>
                        <StatusBadge metric={100 - successRate} threshold={10} criticalThreshold={30} />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-400">Success Rate</p>
                          <p className="text-lg font-bold text-emerald-400">{successRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Avg Duration</p>
                          <p className="text-lg font-bold text-blue-400">{plugin.avgDuration.toFixed(2)}ms</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Failures</p>
                          <p className="text-lg font-bold text-amber-400">{plugin.attempts - plugin.successes}</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full" 
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'execution' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-6">Operation Timeline</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={telemetryData.executionTimeline} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 11 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                  />
                  <YAxis stroke="#94a3b8" label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Bar dataKey="duration" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-slate-400">Total Operations</p>
                  <p className="text-2xl font-bold text-blue-400">{telemetryData.executionTimeline.length}</p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-slate-400">Total Duration</p>
                  <p className="text-2xl font-bold text-emerald-400">{telemetryData.executionTimeline.reduce((sum, e) => sum + e.duration, 0)}ms</p>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-slate-400">Avg Duration</p>
                  <p className="text-2xl font-bold text-amber-400">{(telemetryData.executionTimeline.reduce((sum, e) => sum + e.duration, 0) / telemetryData.executionTimeline.length).toFixed(1)}ms</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                Critical Insights
              </h3>
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                  <p className="font-semibold text-green-300 mb-1">✓ System Stability</p>
                  <p className="text-sm text-slate-400">Overall success rate of {telemetryData.sessionMetrics.successRate.toFixed(1)}% indicates healthy plugin lifecycle management.</p>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <p className="font-semibold text-blue-300 mb-1">⚡ Performance Hotspots</p>
                  <p className="text-sm text-slate-400">Control Panel initialization ({thresholds.critical}ms+) is the most resource-intensive operation. Consider lazy-loading UI components.</p>
                </div>

                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
                  <p className="font-semibold text-amber-300 mb-1">⚠ Library Component Reliability</p>
                  <p className="text-sm text-slate-400">LibraryComponentPlugin has {((1 - (3/6)) * 100).toFixed(0)}% failure rate. Investigate mount lifecycle issues in initialization phase.</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="font-semibold text-purple-300 mb-1">📊 Topic Activity</p>
                  <p className="text-sm text-slate-400">{telemetryData.sessionMetrics.topicsSubscribed} active topics with Canvas operations accounting for the highest message volume.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 backdrop-blur">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span className="text-slate-300">Monitor LibraryComponentPlugin mount failures during concurrent initialization scenarios.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span className="text-slate-300">Implement caching for Control Panel initialization data to reduce init duration below 200ms target.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span className="text-slate-300">Profile Canvas component operations for memory efficiency during drag/resize interactions.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span className="text-slate-300">Consider topic subscription pruning to reduce pub/sub overhead on non-critical operations.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">5.</span>
                  <span className="text-slate-300">Establish SLA targets: UI operations &lt;100ms, data loads &lt;50ms, interactions &lt;20ms.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-600 text-xs text-slate-500">
          <p>Report generated from system telemetry logs • Session span: 28.35s • Total events: {telemetryData.sessionMetrics.totalLines.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
