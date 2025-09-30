import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getInteractionManifestStats, resolveInteraction } from "@renderx-plugins/host-sdk/core/manifests/interactionManifest";
import { getTopicsManifestStats, getTopicsMap } from "@renderx-plugins/host-sdk/core/manifests/topicsManifest";
import { getPluginManifestStats } from "@renderx-plugins/host-sdk/core/startup/startupValidation";
import { listComponents } from "../../domain/components/inventory/inventory.service";
import { EventRouter } from "@renderx-plugins/host-sdk";

interface PluginInfo {
  id: string;
  ui?: {
    slot: string;
    module: string;
    export: string;
  };
  runtime?: {
    module: string;
    export: string;
  };
}

interface ManifestData {
  plugins: PluginInfo[];
}

interface ComponentDetail {
  id: string;
  metadata?: {
    type: string;
    name?: string;
    description?: string;
  };
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

interface PluginLoadingStats {
  totalPlugins: number;
  loadedPlugins: number;
  failedPlugins: number;
  loadingTime: number;
}

interface ConductorIntrospection {
  mountedPluginIds: string[];
  discoveredPlugins: any[];
  runtimeMountedSeqIds: string[];
  sequenceCatalogDirs: string[];
}

interface DiagnosticsPanelProps {
  conductor: any;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ conductor }) => {
  // Core state
  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [loading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Detailed state
  const [interactionStats, setInteractionStats] = useState<any>(null);
  const [topicsStats, setTopicsStats] = useState<any>(null);
  const [pluginStats, setPluginStats] = useState<any>(null);
  const [components, setComponents] = useState<ComponentDetail[]>([]);
  const [conductorIntrospection, setConductorIntrospection] = useState<ConductorIntrospection | null>(null);
  const [loadingStats, setLoadingStats] = useState<PluginLoadingStats>({
    totalPlugins: 0,
    loadedPlugins: 0,
    failedPlugins: 0,
    loadingTime: 0
  });

  // UI state
  const [selectedTab, setSelectedTab] = useState<'plugins' | 'topics' | 'routes' | 'components' | 'conductor' | 'performance'>('plugins');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [performanceMetrics, setPerformanceMetrics] = useState<{[key: string]: number}>({});
  const [manifestsRefreshCounter] = useState(0);

  const addLog = useCallback((level: LogEntry['level'], message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    };
    setLogs(prev => [...prev.slice(-99), entry]); // Keep last 100 logs
  }, []);

  const introspectConductor = useCallback((conductorInstance: any): ConductorIntrospection => {
    try {
      return {
        mountedPluginIds: conductorInstance?.getMountedPluginIds?.() || [],
        discoveredPlugins: conductorInstance?._discoveredPlugins || [],
        runtimeMountedSeqIds: Array.from(conductorInstance?._runtimeMountedSeqIds || []),
        sequenceCatalogDirs: conductorInstance?._sequenceCatalogDirsFromManifest || []
      };
    } catch (error) {
      addLog('warn', 'Failed to introspect conductor', error);
      return {
        mountedPluginIds: [],
        discoveredPlugins: [],
        runtimeMountedSeqIds: [],
        sequenceCatalogDirs: []
      };
    }
  }, [addLog]);

  // Function to load the actual interaction manifest with routes data
  const loadInteractionManifestData = useCallback(async () => {
    try {
      const response = await fetch('/interaction-manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        const routes = manifest?.routes || {};

        // Transform routes object into array format expected by the component
        const routesArray = Object.entries(routes).map(([route, def]: [string, any]) => ({
          route,
          pluginId: def.pluginId,
          sequenceId: def.sequenceId
        }));

        // Get stats and combine with routes data
        const stats = getInteractionManifestStats();
        return {
          ...stats,
          routes: routesArray
        };
      }
    } catch (error) {
      addLog('error', 'Failed to load interaction manifest', error);
    }

    // Fallback to stats only
    return getInteractionManifestStats();
  }, [addLog]);

  const updateStats = useCallback(async () => {
    try {
      const [interactionData, topicsData, pluginData, componentsData] = await Promise.all([
        loadInteractionManifestData(),
        Promise.resolve(getTopicsManifestStats()),
        getPluginManifestStats(),
        listComponents().catch(() => [])
      ]);

      setInteractionStats(interactionData);
      setTopicsStats(topicsData);
      setPluginStats(pluginData);
      setComponents(componentsData);

      if (conductor) {
        setConductorIntrospection(introspectConductor(conductor));
      }
    } catch (error) {
      addLog('error', 'Failed to update stats', error);
    }
  }, [conductor, introspectConductor, addLog, loadInteractionManifestData]);

  useEffect(() => {
    const initialize = async () => {
      try {
        addLog('info', 'Initializing diagnostics panel...');

        // Load plugin manifest
        addLog('info', 'Loading plugin manifest...');
        const response = await fetch('/plugins/plugin-manifest.json');
        if (response.ok) {
          const data = await response.json();
          setManifest(data);
          setLoadingStats(prev => ({ ...prev, totalPlugins: data.plugins?.length || 0 }));
          addLog('info', `Loaded ${data.plugins?.length || 0} plugins from manifest`);
        } else {
          addLog('warn', 'Failed to load plugin manifest');
        }

        // Update all stats
        await updateStats();

        addLog('info', 'Diagnostics panel initialized');

      } catch (error) {
        addLog('error', 'Initialization failed', error);
      }
    };

    initialize();
  }, [addLog, updateStats]);

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
      setPerformanceMetrics(prev => ({ ...prev, [`interaction_${route}`]: duration }));
      addLog('info', `Interaction test completed for ${route} in ${duration}ms`, result);
    } catch (error) {
      const duration = Date.now() - startTime;
      setPerformanceMetrics(prev => ({ ...prev, [`interaction_${route}_error`]: duration }));
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

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs cleared');
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

  // Filtered data based on search
  const filteredPlugins = useMemo(() => {
    if (!manifest || !searchTerm) return manifest?.plugins || [];
    return manifest.plugins.filter(plugin =>
      plugin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.ui?.slot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.ui?.module?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [manifest, searchTerm]);

  const topicsMap = useMemo(() => {
    return getTopicsMap();
  }, [manifestsRefreshCounter]);
  
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
  // Filter to only include plugins that are in the manifest (exclude internal plugins)
  const loadedPluginIds = useMemo(() => {
    const discovered = conductorIntrospection?.discoveredPlugins || [];
    const manifestPluginIds = new Set(manifest?.plugins?.map(p => p.id) || []);
    const discoveredIds = discovered.map((p: any) => p.pluginId).filter(Boolean);
    // Only include discovered plugins that are in the manifest
    return new Set(discoveredIds.filter((id: string) => manifestPluginIds.has(id)));
  }, [conductorIntrospection, manifest]);

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

        {/* Tab Navigation */}
        <div className="control-panel">
          <div className="button-group">
            {(['plugins', 'topics', 'routes', 'components', 'conductor', 'performance'] as const).map(tab => (
              <button
                key={tab}
                className={`btn ${selectedTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          className="search-box"
          placeholder={`Search ${selectedTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Main Content Panels */}
        <div className="grid">
          {selectedTab === 'plugins' && (
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

          {selectedTab === 'topics' && (
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

          {selectedTab === 'routes' && (
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

          {selectedTab === 'components' && (
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

          {selectedTab === 'conductor' && conductorIntrospection && (
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

          {selectedTab === 'performance' && (
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
      </div>
    </div>
  );
};

