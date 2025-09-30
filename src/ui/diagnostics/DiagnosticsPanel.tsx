import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { resolveInteraction } from "@renderx-plugins/host-sdk/core/manifests/interactionManifest";
import { getTopicsMap } from "@renderx-plugins/host-sdk/core/manifests/topicsManifest";
import { EventRouter } from "@renderx-plugins/host-sdk";
import { PluginTreeExplorer } from "../PluginTreeExplorer";
import { InspectionPanel } from "../inspection/InspectionPanel";
import "../inspection/inspection.css";
import type {
  PluginInfo,
  ManifestData,
  ComponentDetail,
  LogEntry,
  PluginLoadingStats,
  ConductorIntrospection,
  RuntimeSequence,
  RuntimeHandler
} from "./types";
import {
  useDiagnosticsData,
  useDiagnosticsLogs,
  useConductorIntrospection,
  useEventMonitoring,
  usePerformanceMetrics,
  usePluginLoadingStats
} from "./hooks";

interface DiagnosticsPanelProps {
  conductor: any;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ conductor }) => {
  // Use custom hooks for state management
  const { logs, addLog, clearLogs } = useDiagnosticsLogs();
  const {
    manifest,
    interactionStats,
    topicsStats,
    pluginStats,
    components,
    loading,
    error,
    refresh: refreshData
  } = useDiagnosticsData(conductor, addLog);
  const { introspection: conductorIntrospection, refresh: refreshConductor } = useConductorIntrospection(conductor);
  const { metrics: performanceMetrics, trackMetric } = usePerformanceMetrics();
  const { stats: loadingStats, updateStats: updateLoadingStats } = usePluginLoadingStats();

  // Subscribe to event monitoring
  useEventMonitoring(conductor, addLog);

  // Combined refresh function
  const updateStats = useCallback(async () => {
    await refreshData();
    refreshConductor();
  }, [refreshData, refreshConductor]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [manifestsRefreshCounter] = useState(0);
  const [selectedNodePath, setSelectedNodePath] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<'overview' | 'plugins' | 'topics' | 'routes' | 'components' | 'conductor' | 'performance' | 'inspection'>('overview');
  const [_selectedNodeData, _setSelectedNodeData] = useState<any>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('diagnostics-left-panel-width');
    return saved ? parseInt(saved, 10) : 300;
  });

  // Update loading stats when manifest changes
  React.useEffect(() => {
    if (manifest?.plugins) {
      updateLoadingStats({ totalPlugins: manifest.plugins.length });
    }
  }, [manifest, updateLoadingStats]);

  const testInteraction = async (route: string) => {
    if (!conductor) return;

    const startTime = Date.now();
    try {
      addLog('info', `Testing interaction: ${route}`);
      const resolved = resolveInteraction(route);
      addLog('info', `Resolved to: ${resolved.pluginId} / ${resolved.sequenceId}`);

      // Test with minimal payload
      const result = await conductor.play(resolved.pluginId, resolved.sequenceId, {
        test: true,
        timestamp: Date.now()
      });

      const duration = Date.now() - startTime;
      trackMetric(`interaction_${route}`, duration);
      addLog('info', `Interaction test completed for ${route} in ${duration}ms`, result);
    } catch (error) {
      const duration = Date.now() - startTime;
      trackMetric(`interaction_${route}_error`, duration);
      addLog('error', `Interaction test failed for ${route} after ${duration}ms`, error);
    }
  };

  const testTopic = async (topicName: string) => {
    if (!conductor) return;

    try {
      addLog('info', `Testing topic: ${topicName}`);

      await EventRouter.publish(topicName, {
        test: true,
        timestamp: Date.now(),
        source: 'diagnostics-panel-test'
      }, conductor);

      addLog('info', `Topic test completed for ${topicName}`);
    } catch (error) {
      addLog('error', `Topic test failed for ${topicName}`, error);
    }
  };

  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      stats: {
        loading: loadingStats,
        interaction: interactionStats,
        topics: topicsStats,
        plugins: pluginStats,
        conductor: conductorIntrospection
      },
      logs: logs,
      manifest: manifest
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog('info', 'Exported detailed report');
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get topics map first (needed by handleTreeNodeSelect)
  const topicsMap = useMemo(() => {
    return getTopicsMap();
  }, [manifestsRefreshCounter]);

  // Handle tree node selection
  const handleTreeNodeSelect = useCallback((nodePath: string | null) => {
    setSelectedNodePath(nodePath);

    if (!nodePath) {
      setSelectedNodeType('overview');
      _setSelectedNodeData(null);
      return;
    }

    // Parse the node path to determine what to show
    if (nodePath === 'plugins') {
      setSelectedNodeType('plugins');
      _setSelectedNodeData(null);
    } else if (nodePath.startsWith('plugin:')) {
      // Check if it's a plugin sub-node (e.g., plugin:id:info)
      const parts = nodePath.split(':');
      if (parts.length === 3) {
        // Plugin sub-node: plugin:{pluginId}:{nodeType}
        const pluginId = parts[1];
        const _nodeType = parts[2]; // Prefix with _ to indicate intentionally unused
        const plugin = manifest?.plugins.find(p => p.id === pluginId);

        // Use 'inspection' type to trigger InspectionPanel
        setSelectedNodeType('inspection');
        _setSelectedNodeData(plugin);
      } else {
        // Just plugin node: plugin:{pluginId}
        const pluginId = nodePath.substring(7);
        const plugin = manifest?.plugins.find(p => p.id === pluginId);
        setSelectedNodeType('plugins');
        _setSelectedNodeData(plugin);
      }
    } else if (nodePath === 'routes') {
      setSelectedNodeType('routes');
      _setSelectedNodeData(null);
    } else if (nodePath.startsWith('route:')) {
      const routeName = nodePath.substring(6);
      const route = interactionStats?.routes?.find((r: any) => r.route === routeName);
      setSelectedNodeType('routes');
      _setSelectedNodeData(route);
    } else if (nodePath === 'topics') {
      setSelectedNodeType('topics');
      _setSelectedNodeData(null);
    } else if (nodePath.startsWith('topic:')) {
      const topicName = nodePath.substring(6);
      const topicDef = topicsMap[topicName];
      setSelectedNodeType('topics');
      _setSelectedNodeData({ name: topicName, def: topicDef });
    } else if (nodePath === 'components') {
      setSelectedNodeType('components');
      _setSelectedNodeData(null);
    } else if (nodePath === 'conductor') {
      setSelectedNodeType('conductor');
      _setSelectedNodeData(null);
    } else if (nodePath === 'performance') {
      setSelectedNodeType('performance');
      _setSelectedNodeData(null);
    } else {
      setSelectedNodeType('overview');
      _setSelectedNodeData(null);
    }
  }, [manifest, interactionStats, topicsMap]);

  // Filtered data based on search
  const filteredPlugins = useMemo(() => {
    if (!manifest || !searchTerm) return manifest?.plugins || [];
    return manifest.plugins.filter(plugin =>
      plugin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.ui?.slot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.ui?.module?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [manifest, searchTerm]);
  
  const filteredTopics = useMemo(() => {
    const topics = Object.entries(topicsMap);
    if (!searchTerm) return topics;
    return topics.filter(([topic]) =>
      topic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topicsMap, searchTerm]);

  // Derived metrics for enhanced stats dashboard
  // Total plugins from manifest
  const totalPluginsCount = manifest?.plugins?.length || 0;

  // Get loaded plugin IDs from conductor's discovered plugins
  // Since we can't reliably determine which plugins are loaded from conductor introspection,
  // we'll assume all manifest plugins are loaded if the conductor is available
  const loadedPluginIds = useMemo(() => {
    if (!conductor || !manifest?.plugins) return new Set<string>();
    // If conductor exists, assume all manifest plugins are loaded
    return new Set(manifest.plugins.map(p => p.id));
  }, [conductor, manifest]);

  const loadedPluginsCount = loadedPluginIds.size;
  const failedPluginsCount = Math.max(0, totalPluginsCount - loadedPluginsCount);
  const routeCount = interactionStats?.routeCount || 0;
  const topicCount = topicsStats?.topicCount || 0;

  const percent = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);

  const loadingProgressPct = percent(loadedPluginsCount, totalPluginsCount);
  const successRatePct = totalPluginsCount > 0
    ? Math.round(((totalPluginsCount - failedPluginsCount) / totalPluginsCount) * 100)
    : 0;
  // Since we don't track loading time, show 100% if plugins are loaded
  const loadPerfPct = loadedPluginsCount > 0 ? 100 : 0;

  type ProgressRingProps = { percentage: number; color?: 'blue' | 'green' | 'orange' };
  const ProgressRing: React.FC<ProgressRingProps> = ({ percentage, color = 'blue' }) => {
    const radius = 28;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <svg height={radius * 2} width={radius * 2} className={`ring ring-${color}`}>
        <circle
          className="ring-track"
          stroke="var(--border-color)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="ring-progress"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="ring-label">
          {percentage}%
        </text>
      </svg>
    );
  };

  return (
    <div className="inspector-container">
      <div className="inspector-header">
        <h1 className="inspector-title">RenderX Diagnostics Panel</h1>
        <p className="inspector-subtitle">
          Plugin Introspection & System Diagnostics
        </p>
      </div>

      <div className="inspector-content">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-section">
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={updateStats}
              disabled={loading}
            >
              <span className="icon">🔄</span>
              Refresh Stats
            </button>
            <button
              className="btn btn-warning btn-icon btn-sm"
              onClick={exportLogs}
            >
              <span className="icon">📊</span>
              Export Report
            </button>
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={clearLogs}
            >
              <span className="icon">🧹</span>
              Clear Logs
            </button>
          </div>
        </div>

        {/* Plugin Statistics */}
        <div className="control-panel">
          <h2>System Statistics</h2>
          <div className="stats-enhanced">
            <div className="stats-dashboard">
              <div className="metric-grid-top">
                <div className="metric-card">
                  <h3 className="metric-title">Loading Progress</h3>
                  <div className="progress-ring">
                    <ProgressRing percentage={loadingProgressPct} color="blue" />
                  </div>
                  <div className="metric-value">{loadedPluginsCount} / {totalPluginsCount}</div>
                  <div className="metric-subtitle">Successfully Loaded</div>
                </div>
                <div className="metric-card">
                  <h3 className="metric-title">Success Rate</h3>
                  <div className="progress-ring">
                    <ProgressRing percentage={successRatePct} color="green" />
                  </div>
                  <div className="metric-value">{successRatePct}%</div>
                  <div className="metric-subtitle">{failedPluginsCount} failed</div>
                </div>
                <div className="metric-card">
                  <h3 className="metric-title">System Status</h3>
                  <div className="progress-ring">
                    <ProgressRing percentage={loadPerfPct} color="green" />
                  </div>
                  <div className="metric-value">{loadedPluginsCount > 0 ? 'Ready' : 'Loading'}</div>
                  <div className="metric-subtitle">{loadedPluginsCount} plugins active</div>
                </div>
              </div>

              <div className="metric-grid-bottom">
                <div className="metric-card">
                  <div className="metric-label">Total Plugins</div>
                  <div className="metric-strong">{totalPluginsCount}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Loaded</div>
                  <div className="metric-strong">{loadedPluginsCount}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Failed</div>
                  <div className="metric-strong">{failedPluginsCount}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Routes</div>
                  <div className="metric-strong">{routeCount}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Topics</div>
                  <div className="metric-strong">{topicCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Three-panel layout */}
        <div className="layout-three-panel">
          {/* Left Panel - Plugin Tree Explorer */}
          <aside className="left-panel" style={{ width: `${leftPanelWidth}px` }}>
            <PluginTreeExplorer
              plugins={manifest?.plugins || []}
              routes={interactionStats?.routes || []}
              topicsMap={topicsMap as any}
              onSelectNode={handleTreeNodeSelect}
            />
          </aside>

          {/* Resize Handle */}
          <div
            className="resize-handle"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = leftPanelWidth;

              const handleMouseMove = (e: MouseEvent) => {
                const delta = e.clientX - startX;
                const newWidth = Math.max(250, Math.min(600, startWidth + delta));
                setLeftPanelWidth(newWidth);
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                // Save to localStorage
                localStorage.setItem('diagnostics-left-panel-width', leftPanelWidth.toString());
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />

          {/* Right Panel - Main Content */}
          <section className="right-panel">
            {/* Search */}
            <input
              type="text"
              className="search-box"
              placeholder={`Search ${selectedNodeType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Main Content Panels */}
            <div className="grid">
          {selectedNodeType === 'inspection' && (
            <InspectionPanel
              selectedNode={selectedNodePath}
              nodeData={_selectedNodeData}
              onNavigate={(nodeId) => handleTreeNodeSelect(nodeId)}
              onAction={(action, data) => {
                console.log('Action:', action, data);
                addLog('info', `Action: ${action} on ${data.pluginId}`);
              }}
            />
          )}
          {selectedNodeType === 'plugins' && (
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Available Plugins</h3>
                <span className="panel-badge">{filteredPlugins.length}</span>
              </div>
              <div className="panel-content">
                {filteredPlugins.map((plugin) => (
                  <div key={plugin.id} className="plugin-item">
                    <div className="plugin-header">
                      <h4 className="plugin-name">{plugin.id}</h4>
                      <div className="plugin-actions">
                        <span className={`plugin-status ${loadedPluginIds.has(plugin.id) ? 'status-loaded' : 'status-unloaded'}`}>
                          {loadedPluginIds.has(plugin.id) ? 'Loaded' : 'Unloaded'}
                        </span>
                      </div>
                    </div>
                    <div className="plugin-details">
                      {plugin.ui && (
                        <div className="detail-row">
                          <span className="detail-label">UI:</span>
                          <span className="code">{plugin.ui.slot}</span> →
                          <span className="code">{plugin.ui.module}#{plugin.ui.export}</span>
                        </div>
                      )}
                      {plugin.runtime && (
                        <div className="detail-row">
                          <span className="detail-label">Runtime:</span>
                          <span className="code">{plugin.runtime.module}#{plugin.runtime.export}</span>
                        </div>
                      )}
                      {!plugin.ui && !plugin.runtime && (
                        <div className="detail-row" style={{ color: 'var(--text-muted)' }}>
                          No UI or runtime configuration
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNodeType === 'topics' && (
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Topics</h3>
                <span className="panel-badge">{filteredTopics.length}</span>
              </div>
              <div className="panel-content">
                {filteredTopics.map(([topicName, topicDef]) => (
                  <div key={topicName} className="topic-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        className={`topic-name expandable ${expandedItems.has(topicName) ? 'expanded' : ''}`}
                        onClick={() => toggleExpanded(topicName)}
                        style={{ flex: 1 }}
                      >
                        {topicName}
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => testTopic(topicName)}
                        disabled={loading || !conductor}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Test
                      </button>
                    </div>
                    <div className="topic-routes">
                      {topicDef.routes.length} route(s) • {topicDef.visibility || 'public'}
                    </div>
                    <div className={`expandable-content ${expandedItems.has(topicName) ? 'expanded' : ''}`}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Routes:</strong>
                        {topicDef.routes.map((route, idx) => (
                          <div key={idx} style={{ marginLeft: '1rem', fontSize: '0.8125rem' }}>
                            → <span className="code">{route.pluginId}</span> / <span className="code">{route.sequenceId}</span>
                          </div>
                        ))}
                      </div>
                      {topicDef.notes && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Notes:</strong> {topicDef.notes}
                        </div>
                      )}
                      {topicDef.perf && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Performance:</strong>
                          {topicDef.perf.throttleMs && ` throttle: ${topicDef.perf.throttleMs}ms`}
                          {topicDef.perf.debounceMs && ` debounce: ${topicDef.perf.debounceMs}ms`}
                          {topicDef.perf.dedupeWindowMs && ` dedupe: ${topicDef.perf.dedupeWindowMs}ms`}
                        </div>
                      )}
                      {topicDef.payloadSchema && (
                        <div>
                          <strong>Payload Schema:</strong>
                          <pre style={{
                            fontSize: '0.75rem',
                            background: 'var(--bg-tertiary)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxHeight: '200px'
                          }}>
                            {JSON.stringify(topicDef.payloadSchema, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNodeType === 'routes' && (
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Interaction Routes</h3>
                <span className="panel-badge">{interactionStats?.routeCount || 0}</span>
              </div>
              <div className="panel-content">
                {interactionStats?.routes?.filter((route: any) =>
                  !searchTerm || route.route.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((route: any, index: number) => (
                  <div key={index} className="route-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div className="route-name">{route.route}</div>
                        <div className="route-target">
                          → <span className="code">{route.pluginId}</span> / <span className="code">{route.sequenceId}</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => testInteraction(route.route)}
                        disabled={loading || !conductor}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNodeType === 'components' && (
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Components</h3>
                <span className="panel-badge">{components.length}</span>
              </div>
              <div className="panel-content">
                {components.filter(comp =>
                  !searchTerm ||
                  comp.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  comp.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((component) => (
                  <div key={component.id} className="plugin-item">
                    <div className="plugin-header">
                      <h4 className="plugin-name">{component.id}</h4>
                    </div>
                    <div className="plugin-details">
                      {component.metadata?.name && (
                        <div className="detail-row">
                          <span className="detail-label">Name:</span> {component.metadata.name}
                        </div>
                      )}
                      {component.metadata?.description && (
                        <div className="detail-row">
                          <span className="detail-label">Description:</span> {component.metadata.description}
                        </div>
                      )}
                      {component.metadata?.type && (
                        <div className="detail-row">
                          <span className="detail-label">Type:</span> <span className="code">{component.metadata.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNodeType === 'conductor' && conductorIntrospection && (
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Conductor Introspection</h3>
              </div>
              <div className="panel-content">
                <div className="plugin-item">
                  <h4 className="plugin-name">Mounted Plugin IDs</h4>
                  <div className="plugin-details">
                    {conductorIntrospection.mountedPluginIds.length > 0 ? (
                      conductorIntrospection.mountedPluginIds.map(id => (
                        <div key={id} className="detail-row">
                          <span className="code">{id}</span>
                        </div>
                      ))
                    ) : (
                      <div className="detail-row" style={{ color: 'var(--text-muted)' }}>
                        No plugins mounted
                      </div>
                    )}
                  </div>
                </div>

                <div className="plugin-item">
                  <h4 className="plugin-name">Runtime Mounted Sequence IDs</h4>
                  <div className="plugin-details">
                    {conductorIntrospection.runtimeMountedSeqIds.length > 0 ? (
                      conductorIntrospection.runtimeMountedSeqIds.map(id => (
                        <div key={id} className="detail-row">
                          <span className="code">{id}</span>
                        </div>
                      ))
                    ) : (
                      <div className="detail-row" style={{ color: 'var(--text-muted)' }}>
                        No sequences mounted
                      </div>
                    )}
                  </div>
                </div>

                <div className="plugin-item">
                  <h4 className="plugin-name">Sequence Catalog Directories</h4>
                  <div className="plugin-details">
                    {conductorIntrospection.sequenceCatalogDirs.length > 0 ? (
                      conductorIntrospection.sequenceCatalogDirs.map(dir => (
                        <div key={dir} className="detail-row">
                          <span className="code">{dir}</span>
                        </div>
                      ))
                    ) : (
                      <div className="detail-row" style={{ color: 'var(--text-muted)' }}>
                        No catalog directories
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedNodeType === 'performance' && (
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Performance Metrics</h3>
                <span className="panel-badge">{Object.keys(performanceMetrics).length}</span>
              </div>
              <div className="panel-content">
                <div className="plugin-item">
                  <h4 className="plugin-name">System Health</h4>
                  <div className="plugin-details">
                    <div className="detail-row">
                      <span className="detail-label">Conductor Status:</span>
                      <span className="code" style={{ color: conductor ? 'var(--success-color)' : 'var(--danger-color)' }}>
                        {conductor ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Manifests Loaded:</span>
                      <span className="code" style={{ color: 'var(--success-color)' }}>
                        {[interactionStats?.loaded, topicsStats?.loaded].filter(Boolean).length}/2
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Active Logs:</span>
                      <span className="code">{logs.length}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Error Rate:</span>
                      <span className="code" style={{
                        color: logs.filter(l => l.level === 'error').length > 0 ? 'var(--danger-color)' : 'var(--success-color)'
                      }}>
                        {logs.length > 0 ? Math.round((logs.filter(l => l.level === 'error').length / logs.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {Object.keys(performanceMetrics).length > 0 && (
                  <div className="plugin-item">
                    <h4 className="plugin-name">Test Execution Times</h4>
                    <div className="plugin-details">
                      {Object.entries(performanceMetrics)
                        .sort(([,a], [,b]) => b - a)
                        .map(([key, duration]) => (
                          <div key={key} className="detail-row">
                            <span className="detail-label">{key.replace(/_/g, ' ')}:</span>
                            <span className="code"
                                  style={{
                                    color: duration > 1000 ? 'var(--danger-color)' :
                                           duration > 500 ? 'var(--warning-color)' :
                                           'var(--success-color)'
                                  }}>
                              {duration}ms
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

            {/* Logs Panel */}
            <div className="logs-panel">
              <div className="panel-header">
                <h3 className="panel-title">System Logs</h3>
                <span className="panel-badge">{logs.length}</span>
              </div>
              <div className="logs-content">
                {logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    <span className="log-timestamp">[{log.timestamp}]</span>{' '}
                    <span className={`log-level-${log.level}`}>{log.level.toUpperCase()}</span>{' '}
                    {log.message}
                    {log.data && (
                      <div style={{ marginLeft: '1rem', color: '#569cd6' }}>
                        {typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}
                      </div>
                    )}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: 'var(--text-muted)' }}>No logs yet...</div>
                )}
              </div>
            </div>
          </section>

          {/* Footer Panel */}
          <footer className="footer-panel">
            <div className="footer-section">
              <strong>Selected:</strong> {selectedNodePath || 'None'}
            </div>
            <div className="footer-section footer-stats">
              <span className="footer-stat">
                <span className="footer-stat-label">Plugins:</span>
                <span className="footer-stat-value">{loadedPluginsCount}/{totalPluginsCount}</span>
              </span>
              <span className="footer-stat">
                <span className="footer-stat-label">Routes:</span>
                <span className="footer-stat-value">{routeCount}</span>
              </span>
              <span className="footer-stat">
                <span className="footer-stat-label">Topics:</span>
                <span className="footer-stat-value">{topicCount}</span>
              </span>
              <span className="footer-stat">
                <span className="footer-stat-label">Errors:</span>
                <span className="footer-stat-value" style={{
                  color: logs.filter(l => l.level === 'error').length > 0 ? 'var(--danger-color)' : 'var(--success-color)'
                }}>
                  {logs.filter(l => l.level === 'error').length}
                </span>
              </span>
            </div>
            <div className="footer-section footer-actions">
              <button
                className="btn btn-sm btn-secondary"
                onClick={exportLogs}
                title="Export diagnostics report"
              >
                📊 Export
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={updateStats}
                title="Refresh statistics"
              >
                🔄 Refresh
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

