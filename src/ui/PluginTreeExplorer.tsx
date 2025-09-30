import React, { useState, useMemo } from 'react';

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

interface Route {
  route: string;
  pluginId: string;
  sequenceId: string;
}

interface TopicDef {
  routes: Array<{ pluginId: string; sequenceId: string }>;
  visibility?: string;
  notes?: string;
  perf?: {
    throttleMs?: number;
    debounceMs?: number;
    dedupeWindowMs?: number;
  };
  payloadSchema?: any;
}

interface PluginTreeExplorerProps {
  plugins: PluginInfo[];
  routes: Route[];
  topicsMap: Record<string, TopicDef>;
  onSelectNode: (nodePath: string | null) => void;
}

export const PluginTreeExplorer: React.FC<PluginTreeExplorerProps> = ({
  plugins,
  routes,
  topicsMap,
  onSelectNode
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['plugins', 'routes', 'topics']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const isExpanded = (nodeId: string) => expandedNodes.has(nodeId);

  const handleSelectNode = (nodeId: string) => {
    setSelectedNode(nodeId);
    onSelectNode(nodeId);
  };

  // Filter data based on search
  const filteredPlugins = useMemo(() => {
    if (!searchTerm) return plugins;
    return plugins.filter(plugin =>
      plugin.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [plugins, searchTerm]);

  const filteredRoutes = useMemo(() => {
    if (!searchTerm) return routes;
    return routes.filter(route =>
      route.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.pluginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.sequenceId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [routes, searchTerm]);

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return Object.entries(topicsMap);
    return Object.entries(topicsMap).filter(([topicName]) =>
      topicName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topicsMap, searchTerm]);

  const TreeNode: React.FC<{
    nodeId: string;
    label: string;
    level?: number;
    hasChildren?: boolean;
    badge?: string;
    onClick?: () => void;
  }> = ({ nodeId, label, level = 0, hasChildren = false, badge, onClick }) => {
    const expanded = isExpanded(nodeId);
    const isSelected = selectedNode === nodeId;

    return (
      <div
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 1}rem` }}
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) {
            toggleNode(nodeId);
          }
          handleSelectNode(nodeId);
          onClick?.();
        }}
      >
        {hasChildren && (
          <span className="tree-node-icon">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="tree-node-icon">•</span>}
        <span className="tree-node-label">{label}</span>
        {badge && <span className="tree-node-badge">{badge}</span>}
      </div>
    );
  };

  return (
    <div className="plugin-tree-explorer">
      <div className="tree-header">
        <h3 className="tree-title">Plugin Explorer</h3>
        <input
          type="text"
          className="tree-search"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="tree-content">
        {/* Plugins Section */}
        <TreeNode
          nodeId="plugins"
          label="Plugins"
          hasChildren={true}
          badge={`${filteredPlugins.length}`}
        />
        {isExpanded('plugins') && filteredPlugins.map(plugin => (
          <TreeNode
            key={plugin.id}
            nodeId={`plugin:${plugin.id}`}
            label={plugin.id}
            level={1}
          />
        ))}

        {/* Routes Section */}
        <TreeNode
          nodeId="routes"
          label="Routes"
          hasChildren={true}
          badge={`${filteredRoutes.length}`}
        />
        {isExpanded('routes') && filteredRoutes.map((route, idx) => (
          <TreeNode
            key={`route-${idx}`}
            nodeId={`route:${route.route}`}
            label={route.route}
            level={1}
          />
        ))}

        {/* Topics Section */}
        <TreeNode
          nodeId="topics"
          label="Topics"
          hasChildren={true}
          badge={`${filteredTopics.length}`}
        />
        {isExpanded('topics') && filteredTopics.map(([topicName]) => (
          <TreeNode
            key={topicName}
            nodeId={`topic:${topicName}`}
            label={topicName}
            level={1}
          />
        ))}
      </div>
    </div>
  );
};

