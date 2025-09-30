import React, { useState, useMemo } from 'react';
import {
  Package,
  Palette,
  Zap,
  MessageSquare,
  Route as RouteIcon,
  GitBranch,
  Lock,
  Settings,
  BarChart3,
  Boxes,
  MapPin,
  FileCode,
  Sliders,
  Radio,
  Paintbrush,
  Activity
} from 'lucide-react';

// UI Configuration sub-structures
interface UIDependency {
  name: string;
  version?: string;
  size?: string;
  license?: string;
}

interface UIProp {
  type: string;
  default?: any;
  required?: boolean;
  validation?: any;
}

interface UIEvent {
  name: string;
  payloadSchema?: any;
  frequency?: string;
  subscribers?: string[];
}

interface UIStyling {
  cssClasses?: string[];
  themeVariables?: Record<string, string>;
}

interface UILifecycleHooks {
  onMount?: string;
  onUpdate?: string;
  onUnmount?: string;
}

interface UIConfiguration {
  slot: string;
  module: string;
  export: string;
  dependencies?: UIDependency[];
  props?: Record<string, UIProp>;
  events?: UIEvent[];
  styling?: UIStyling;
  lifecycleHooks?: UILifecycleHooks;
}

interface PluginInfo {
  id: string;
  ui?: UIConfiguration;
  runtime?: {
    module: string;
    export: string;
  };
  // Extended metadata fields
  version?: string;
  author?: string;
  description?: string;
  loadTime?: number;
  memoryUsage?: string;
  status?: 'loaded' | 'unloaded' | 'failed' | 'loading' | 'deprecated';
  topics?: { subscribes: string[], publishes: string[] };
  sequences?: string[];
  permissions?: any;
  configuration?: any;
  metrics?: any;
  dependencies?: any;
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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['plugins', 'routes', 'topics', 'components', 'conductor', 'performance']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Helper functions to check node availability
  const hasPluginInfo = (_plugin: PluginInfo) => true; // Always show plugin info
  const hasUiConfig = (plugin: PluginInfo) => !!plugin.ui;
  const hasRuntime = (plugin: PluginInfo) => !!plugin.runtime;
  const hasTopics = (plugin: PluginInfo) => !!plugin.topics && (plugin.topics.subscribes.length > 0 || plugin.topics.publishes.length > 0);
  const hasRoutes = (plugin: PluginInfo) => routes.some(r => r.pluginId === plugin.id);
  const hasSequences = (plugin: PluginInfo) => !!plugin.sequences && plugin.sequences.length > 0;
  const hasPermissions = (plugin: PluginInfo) => !!plugin.permissions;
  const hasConfiguration = (plugin: PluginInfo) => !!plugin.configuration;
  const hasMetrics = (plugin: PluginInfo) => !!plugin.metrics;
  const hasDependencies = (plugin: PluginInfo) => !!plugin.dependencies;

  // Helper functions to check UI sub-node availability
  const hasUiSlot = (ui: UIConfiguration | undefined) => !!ui?.slot;
  const hasUiModule = (ui: UIConfiguration | undefined) => !!ui?.module;
  const hasUiDependencies = (ui: UIConfiguration | undefined) => !!ui?.dependencies && ui.dependencies.length > 0;
  const hasUiProps = (ui: UIConfiguration | undefined) => !!ui?.props && Object.keys(ui.props).length > 0;
  const hasUiEvents = (ui: UIConfiguration | undefined) => !!ui?.events && ui.events.length > 0;
  const hasUiStyling = (ui: UIConfiguration | undefined) => !!ui?.styling && (
    (ui.styling.cssClasses && ui.styling.cssClasses.length > 0) ||
    (ui.styling.themeVariables && Object.keys(ui.styling.themeVariables).length > 0)
  );
  const hasUiLifecycleHooks = (ui: UIConfiguration | undefined) => !!ui?.lifecycleHooks && (
    !!ui.lifecycleHooks.onMount || !!ui.lifecycleHooks.onUpdate || !!ui.lifecycleHooks.onUnmount
  );

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
    icon?: React.ReactNode;
    onClick?: () => void;
  }> = ({ nodeId, label, level = 0, hasChildren = false, badge, icon, onClick }) => {
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
        {!hasChildren && !icon && <span className="tree-node-icon">•</span>}
        {icon && <span className="tree-node-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
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
        {isExpanded('plugins') && filteredPlugins.map(plugin => {
          const pluginNodeId = `plugin:${plugin.id}`;
          const pluginExpanded = isExpanded(pluginNodeId);

          return (
            <React.Fragment key={plugin.id}>
              <TreeNode
                nodeId={pluginNodeId}
                label={plugin.id}
                level={1}
                hasChildren={true}
              />

              {/* Plugin child nodes - only show when plugin is expanded */}
              {pluginExpanded && (
                <>
                  {/* 1. Plugin Info - Always show */}
                  {hasPluginInfo(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:info`}
                      label="Plugin Info"
                      level={2}
                      icon={<Package size={14} />}
                    />
                  )}

                  {/* 2. UI Configuration - Only if plugin has UI */}
                  {hasUiConfig(plugin) && (
                    <>
                      <TreeNode
                        nodeId={`plugin:${plugin.id}:ui`}
                        label="UI Configuration"
                        level={2}
                        icon={<Palette size={14} />}
                        hasChildren={true}
                      />

                      {/* UI Configuration sub-nodes - only show when UI config is expanded */}
                      {isExpanded(`plugin:${plugin.id}:ui`) && (
                        <>
                          {/* 2.1 Slot */}
                          {hasUiSlot(plugin.ui) && (
                            <TreeNode
                              nodeId={`plugin:${plugin.id}:ui:slot`}
                              label="Slot"
                              level={3}
                              icon={<MapPin size={14} />}
                            />
                          )}

                          {/* 2.2 Module Path */}
                          {hasUiModule(plugin.ui) && (
                            <TreeNode
                              nodeId={`plugin:${plugin.id}:ui:module`}
                              label="Module Path"
                              level={3}
                              icon={<FileCode size={14} />}
                            />
                          )}

                          {/* 2.3 Dependencies */}
                          {hasUiDependencies(plugin.ui) && (
                            <>
                              <TreeNode
                                nodeId={`plugin:${plugin.id}:ui:dependencies`}
                                label="Dependencies"
                                level={3}
                                icon={<Boxes size={14} />}
                                hasChildren={true}
                                badge={`${plugin.ui?.dependencies?.length || 0}`}
                              />

                              {/* Dependencies sub-nodes - only show when dependencies is expanded */}
                              {isExpanded(`plugin:${plugin.id}:ui:dependencies`) && plugin.ui?.dependencies?.map((dep, idx) => {
                                const depNodeId = `plugin:${plugin.id}:ui:dependencies:${dep.name}`;
                                return (
                                  <React.Fragment key={`${plugin.id}-dep-${idx}`}>
                                    <TreeNode
                                      nodeId={depNodeId}
                                      label={dep.name}
                                      level={4}
                                      hasChildren={true}
                                    />

                                    {/* Dependency details - only show when dependency is expanded */}
                                    {isExpanded(depNodeId) && (
                                      <>
                                        {dep.version && (
                                          <TreeNode
                                            nodeId={`${depNodeId}:version`}
                                            label={`Version: ${dep.version}`}
                                            level={5}
                                          />
                                        )}
                                        {dep.size && (
                                          <TreeNode
                                            nodeId={`${depNodeId}:size`}
                                            label={`Size: ${dep.size}`}
                                            level={5}
                                          />
                                        )}
                                        {dep.license && (
                                          <TreeNode
                                            nodeId={`${depNodeId}:license`}
                                            label={`License: ${dep.license}`}
                                            level={5}
                                          />
                                        )}
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </>
                          )}

                          {/* 2.4 Props */}
                          {hasUiProps(plugin.ui) && (
                            <>
                              <TreeNode
                                nodeId={`plugin:${plugin.id}:ui:props`}
                                label="Props"
                                level={3}
                                icon={<Sliders size={14} />}
                                hasChildren={true}
                                badge={`${Object.keys(plugin.ui?.props || {}).length}`}
                              />

                              {/* Props sub-nodes - only show when props is expanded */}
                              {isExpanded(`plugin:${plugin.id}:ui:props`) && Object.entries(plugin.ui?.props || {}).map(([propName, propDef]) => {
                                const propNodeId = `plugin:${plugin.id}:ui:props:${propName}`;
                                return (
                                  <React.Fragment key={`${plugin.id}-prop-${propName}`}>
                                    <TreeNode
                                      nodeId={propNodeId}
                                      label={propName}
                                      level={4}
                                      hasChildren={true}
                                    />

                                    {/* Prop details - only show when prop is expanded */}
                                    {isExpanded(propNodeId) && (
                                      <>
                                        <TreeNode
                                          nodeId={`${propNodeId}:type`}
                                          label={`Type: ${propDef.type}`}
                                          level={5}
                                        />
                                        {propDef.default !== undefined && (
                                          <TreeNode
                                            nodeId={`${propNodeId}:default`}
                                            label={`Default: ${JSON.stringify(propDef.default)}`}
                                            level={5}
                                          />
                                        )}
                                        {propDef.required !== undefined && (
                                          <TreeNode
                                            nodeId={`${propNodeId}:required`}
                                            label={`Required: ${propDef.required}`}
                                            level={5}
                                          />
                                        )}
                                        {propDef.validation && (
                                          <TreeNode
                                            nodeId={`${propNodeId}:validation`}
                                            label={`Validation: ${JSON.stringify(propDef.validation)}`}
                                            level={5}
                                          />
                                        )}
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </>
                          )}

                          {/* 2.5 Events */}
                          {hasUiEvents(plugin.ui) && (
                            <>
                              <TreeNode
                                nodeId={`plugin:${plugin.id}:ui:events`}
                                label="Events"
                                level={3}
                                icon={<Radio size={14} />}
                                hasChildren={true}
                                badge={`${plugin.ui?.events?.length || 0}`}
                              />

                              {/* Events sub-nodes - only show when events is expanded */}
                              {isExpanded(`plugin:${plugin.id}:ui:events`) && plugin.ui?.events?.map((event, idx) => {
                                const eventNodeId = `plugin:${plugin.id}:ui:events:${event.name}`;
                                return (
                                  <React.Fragment key={`${plugin.id}-event-${idx}`}>
                                    <TreeNode
                                      nodeId={eventNodeId}
                                      label={event.name}
                                      level={4}
                                      hasChildren={true}
                                    />

                                    {/* Event details - only show when event is expanded */}
                                    {isExpanded(eventNodeId) && (
                                      <>
                                        {event.payloadSchema && (
                                          <TreeNode
                                            nodeId={`${eventNodeId}:payloadSchema`}
                                            label={`Payload Schema: ${JSON.stringify(event.payloadSchema)}`}
                                            level={5}
                                          />
                                        )}
                                        {event.frequency && (
                                          <TreeNode
                                            nodeId={`${eventNodeId}:frequency`}
                                            label={`Frequency: ${event.frequency}`}
                                            level={5}
                                          />
                                        )}
                                        {event.subscribers && event.subscribers.length > 0 && (
                                          <TreeNode
                                            nodeId={`${eventNodeId}:subscribers`}
                                            label={`Subscribers: ${event.subscribers.join(', ')}`}
                                            level={5}
                                          />
                                        )}
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </>
                          )}

                          {/* 2.6 Styling */}
                          {hasUiStyling(plugin.ui) && (
                            <>
                              <TreeNode
                                nodeId={`plugin:${plugin.id}:ui:styling`}
                                label="Styling"
                                level={3}
                                icon={<Paintbrush size={14} />}
                                hasChildren={true}
                              />

                              {/* Styling sub-nodes - only show when styling is expanded */}
                              {isExpanded(`plugin:${plugin.id}:ui:styling`) && (
                                <>
                                  {plugin.ui?.styling?.cssClasses && plugin.ui.styling.cssClasses.length > 0 && (
                                    <TreeNode
                                      nodeId={`plugin:${plugin.id}:ui:styling:cssClasses`}
                                      label={`CSS Classes: ${plugin.ui.styling.cssClasses.join(', ')}`}
                                      level={4}
                                    />
                                  )}
                                  {plugin.ui?.styling?.themeVariables && Object.keys(plugin.ui.styling.themeVariables).length > 0 && (
                                    <TreeNode
                                      nodeId={`plugin:${plugin.id}:ui:styling:themeVariables`}
                                      label={`Theme Variables: ${JSON.stringify(plugin.ui.styling.themeVariables)}`}
                                      level={4}
                                    />
                                  )}
                                </>
                              )}
                            </>
                          )}

                          {/* 2.7 Lifecycle Hooks */}
                          {hasUiLifecycleHooks(plugin.ui) && (
                            <>
                              <TreeNode
                                nodeId={`plugin:${plugin.id}:ui:lifecycleHooks`}
                                label="Lifecycle Hooks"
                                level={3}
                                icon={<Activity size={14} />}
                                hasChildren={true}
                              />

                              {/* Lifecycle hooks sub-nodes - only show when lifecycle hooks is expanded */}
                              {isExpanded(`plugin:${plugin.id}:ui:lifecycleHooks`) && (
                                <>
                                  {plugin.ui?.lifecycleHooks?.onMount && (
                                    <TreeNode
                                      nodeId={`plugin:${plugin.id}:ui:lifecycleHooks:onMount`}
                                      label={`onMount: ${plugin.ui.lifecycleHooks.onMount}`}
                                      level={4}
                                    />
                                  )}
                                  {plugin.ui?.lifecycleHooks?.onUpdate && (
                                    <TreeNode
                                      nodeId={`plugin:${plugin.id}:ui:lifecycleHooks:onUpdate`}
                                      label={`onUpdate: ${plugin.ui.lifecycleHooks.onUpdate}`}
                                      level={4}
                                    />
                                  )}
                                  {plugin.ui?.lifecycleHooks?.onUnmount && (
                                    <TreeNode
                                      nodeId={`plugin:${plugin.id}:ui:lifecycleHooks:onUnmount`}
                                      label={`onUnmount: ${plugin.ui.lifecycleHooks.onUnmount}`}
                                      level={4}
                                    />
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* 3. Runtime - Only if plugin has runtime */}
                  {hasRuntime(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:runtime`}
                      label="Runtime"
                      level={2}
                      icon={<Zap size={14} />}
                    />
                  )}

                  {/* 4. Topics - Only if plugin has topics */}
                  {hasTopics(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:topics`}
                      label="Topics"
                      level={2}
                      icon={<MessageSquare size={14} />}
                    />
                  )}

                  {/* 5. Routes - Only if plugin has routes */}
                  {hasRoutes(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:routes`}
                      label="Routes"
                      level={2}
                      icon={<RouteIcon size={14} />}
                    />
                  )}

                  {/* 6. Sequences - Only if plugin has sequences */}
                  {hasSequences(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:sequences`}
                      label="Sequences"
                      level={2}
                      icon={<GitBranch size={14} />}
                    />
                  )}

                  {/* 7. Permissions - Only if plugin has permissions */}
                  {hasPermissions(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:permissions`}
                      label="Permissions"
                      level={2}
                      icon={<Lock size={14} />}
                    />
                  )}

                  {/* 8. Configuration - Only if plugin has configuration */}
                  {hasConfiguration(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:configuration`}
                      label="Configuration"
                      level={2}
                      icon={<Settings size={14} />}
                    />
                  )}

                  {/* 9. Metrics - Only if plugin has metrics */}
                  {hasMetrics(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:metrics`}
                      label="Metrics"
                      level={2}
                      icon={<BarChart3 size={14} />}
                    />
                  )}

                  {/* 10. Dependencies - Only if plugin has dependencies */}
                  {hasDependencies(plugin) && (
                    <TreeNode
                      nodeId={`plugin:${plugin.id}:dependencies`}
                      label="Dependencies"
                      level={2}
                      icon={<Boxes size={14} />}
                    />
                  )}
                </>
              )}
            </React.Fragment>
          );
        })}

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

        {/* Components Section */}
        <TreeNode
          nodeId="components"
          label="Components"
          hasChildren={false}
        />

        {/* Conductor Section */}
        <TreeNode
          nodeId="conductor"
          label="Conductor"
          hasChildren={false}
        />

        {/* Performance Section */}
        <TreeNode
          nodeId="performance"
          label="Performance"
          hasChildren={false}
        />
      </div>
    </div>
  );
};

