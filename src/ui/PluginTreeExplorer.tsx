import * as React from "react";
import { useMemo, useState, useCallback } from "react";

export type PluginInfo = {
  id: string;
  ui?: { slot: string; module: string; export: string };
  runtime?: { module: string; export: string };
};

export type RouteInfo = { route: string; pluginId: string; sequenceId: string };

export interface PluginTreeExplorerProps {
  plugins: PluginInfo[];
  routes?: RouteInfo[];
  topicsMap?: Record<string, any>;
  onSelectNode?: (nodePath: string) => void;
}

const indent = (level: number) => ({ paddingLeft: `${level * 12}px` });

export const PluginTreeExplorer: React.FC<PluginTreeExplorerProps> = ({
  plugins,
  routes = [],
  topicsMap = {},
  onSelectNode,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["plugins"]))
  const [search, setSearch] = useState("");

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const notifySelect = useCallback((path: string) => {
    onSelectNode && onSelectNode(path);
  }, [onSelectNode]);

  const filteredPlugins = useMemo(() => {
    if (!search) return plugins;
    const q = search.toLowerCase();
    return plugins.filter(p => p.id.toLowerCase().includes(q) || p.ui?.slot?.toLowerCase().includes(q));
  }, [plugins, search]);

  const topicEntries = useMemo(() => Object.entries(topicsMap || {}), [topicsMap]);

  return (
    <div className="plugin-explorer" data-testid="plugin-explorer">
      <div className="panel" style={{ marginBottom: '1rem' }}>
        <div className="panel-header">
          <h3 className="panel-title">Plugin Tree Explorer</h3>
          <span className="panel-badge" data-testid="plugin-count">{filteredPlugins.length}</span>
        </div>
        <div className="panel-content">
          <input
            className="search-box"
            placeholder="Search plugins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="tree">
            {/* Plugins root */}
            <div className="tree-node" style={indent(0)}>
              <div className="expandable" onClick={() => toggle('plugins')}>
                {expanded.has('plugins') ? '▼' : '▶'} <strong>Plugins</strong>
              </div>
            </div>
            {expanded.has('plugins') && (
              <div>
                {filteredPlugins.map((p) => {
                  const pid = `plugin:${p.id}`;
                  const uiId = `${pid}:ui`;
                  const rtId = `${pid}:runtime`;
                  const tpId = `${pid}:topics`;
                  const rtRootId = `${pid}:routes`;
                  return (
                    <div key={p.id}>
                      <div className="tree-node" style={indent(1)}>
                        <div className="expandable" onClick={() => toggle(pid)}>
                          {expanded.has(pid) ? '▼' : '▶'} {p.id}
                        </div>
                      </div>
                      {expanded.has(pid) && (
                        <div>
                          {/* Info */}
                          <div className="tree-node" style={indent(2)}>
                            <div className="expandable" onClick={() => notifySelect(`${pid}:info`)}>ℹ Info</div>
                          </div>
                          {/* UI */}
                          {p.ui && (
                            <>
                              <div className="tree-node" style={indent(2)}>
                                <div className="expandable" onClick={() => toggle(uiId)}>
                                  {expanded.has(uiId) ? '▼' : '▶'} UI
                                </div>
                              </div>
                              {expanded.has(uiId) && (
                                <>
                                  <div className="tree-node" style={indent(3)} onClick={() => notifySelect(`${uiId}:slot`)}>• slot: <span className="code">{p.ui.slot}</span></div>
                                  <div className="tree-node" style={indent(3)} onClick={() => notifySelect(`${uiId}:module`)}>• module: <span className="code">{p.ui.module}#{p.ui.export}</span></div>
                                </>
                              )}
                            </>
                          )}
                          {/* Runtime */}
                          {p.runtime && (
                            <>
                              <div className="tree-node" style={indent(2)}>
                                <div className="expandable" onClick={() => toggle(rtId)}>
                                  {expanded.has(rtId) ? '▼' : '▶'} Runtime
                                </div>
                              </div>
                              {expanded.has(rtId) && (
                                <>
                                  <div className="tree-node" style={indent(3)} onClick={() => notifySelect(`${rtId}:module`)}>• module: <span className="code">{p.runtime.module}#{p.runtime.export}</span></div>
                                </>
                              )}
                            </>
                          )}
                          {/* Routes filtered for this plugin */}
                          {routes?.length > 0 && (
                            <>
                              <div className="tree-node" style={indent(2)}>
                                <div className="expandable" onClick={() => toggle(rtRootId)}>
                                  {expanded.has(rtRootId) ? '▼' : '▶'} Routes
                                </div>
                              </div>
                              {expanded.has(rtRootId) && (
                                <>
                                  {routes.filter(r => r.pluginId === p.id).map((r, idx) => (
                                    <div key={idx} className="tree-node" style={indent(3)} onClick={() => notifySelect(`${rtRootId}:${r.route}`)}>• {r.route} → <span className="code">{r.sequenceId}</span></div>
                                  ))}
                                </>
                              )}
                            </>
                          )}
                          {/* Topics filtered for this plugin */}
                          {topicEntries.length > 0 && (
                            <>
                              <div className="tree-node" style={indent(2)}>
                                <div className="expandable" onClick={() => toggle(tpId)}>
                                  {expanded.has(tpId) ? '▼' : '▶'} Topics
                                </div>
                              </div>
                              {expanded.has(tpId) && (
                                <>
                                  {topicEntries.filter(([name, def]) => {
                                    // crude filter: include topics mentioning the plugin id anywhere
                                    try { return JSON.stringify(def).toLowerCase().includes(p.id.toLowerCase()) || name.toLowerCase().includes(p.id.toLowerCase()); } catch { return false; }
                                  }).map(([name], i) => (
                                    <div key={i} className="tree-node" style={indent(3)} onClick={() => notifySelect(`${tpId}:${name}`)}>• {name}</div>
                                  ))}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginTreeExplorer;

