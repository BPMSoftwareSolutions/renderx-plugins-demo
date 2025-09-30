import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { resolveInteraction } from "@renderx-plugins/host-sdk/core/manifests/interactionManifest";
import { getTopicsMap } from "@renderx-plugins/host-sdk/core/manifests/topicsManifest";
import { PluginTreeExplorer } from "../PluginTreeExplorer";
import {
  InspectionPanel,
  StatsOverview,
  DiagnosticsToolbar,
  PluginsPanel,
  TopicsPanel,
  RoutesPanel,
  ComponentsPanel,
  ConductorPanel,
  PerformancePanel,
  LogsPanel,
  FooterPanel
} from "./components";
import "./components/shared/inspection.css";
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

      // Publish directly through conductor
      await conductor.publish(topicName, {
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
        <DiagnosticsToolbar
          loading={loading}
          onRefresh={updateStats}
          onExport={exportLogs}
          onClearLogs={clearLogs}
        />

        {/* Plugin Statistics */}
        <StatsOverview
          loadedPluginsCount={loadedPluginsCount}
          totalPluginsCount={totalPluginsCount}
          failedPluginsCount={failedPluginsCount}
          routeCount={routeCount}
          topicCount={topicCount}
        />

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
            <PluginsPanel
              plugins={filteredPlugins}
              loadedPluginIds={loadedPluginIds}
              searchTerm={searchTerm}
            />
          )}

          {selectedNodeType === 'topics' && (
            <TopicsPanel
              topicsMap={new Map(Object.entries(topicsMap))}
              searchTerm={searchTerm}
              expandedItems={expandedItems}
              loading={loading}
              conductor={conductor}
              onToggleExpanded={toggleExpanded}
              onTestTopic={testTopic}
            />
          )}

          {selectedNodeType === 'routes' && (
            <RoutesPanel
              routes={interactionStats?.routes || []}
              routeCount={interactionStats?.routeCount || 0}
              searchTerm={searchTerm}
              loading={loading}
              conductor={conductor}
              onTestInteraction={testInteraction}
            />
          )}

          {selectedNodeType === 'components' && (
            <ComponentsPanel
              components={components}
              searchTerm={searchTerm}
            />
          )}

          {selectedNodeType === 'conductor' && (
            <ConductorPanel introspection={conductorIntrospection} />
          )}

          {selectedNodeType === 'performance' && (
            <PerformancePanel
              conductor={conductor}
              performanceMetrics={performanceMetrics}
              interactionStatsLoaded={!!interactionStats?.loaded}
              topicsStatsLoaded={!!topicsStats?.loaded}
              logs={logs}
            />
          )}
        </div>

            {/* Logs Panel */}
            <LogsPanel logs={logs} />
          </section>

          {/* Footer Panel */}
          <FooterPanel
            selectedNodePath={selectedNodePath}
            loadedPluginsCount={loadedPluginsCount}
            totalPluginsCount={totalPluginsCount}
            routeCount={routeCount}
            topicCount={topicCount}
            logs={logs}
            onExport={exportLogs}
            onRefresh={updateStats}
          />
        </div>
      </div>
    </div>
  );
};

