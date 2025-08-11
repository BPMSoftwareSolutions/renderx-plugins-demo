import React, { useState, useEffect, useRef } from "react";
import type { LoadedJsonComponent } from "../types/JsonComponent";
import type { ElementLibraryProps } from "../types/AppTypes";
import { jsonComponentLoader } from "../services/JsonComponentLoader";

const LegacyElementLibrary: React.FC<ElementLibraryProps> = ({
  onDragStart,
  onDragEnd,
}) => {
  const [components, setComponents] = useState<LoadedJsonComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const subscribedRef = useRef(false);
  const unsubscribeRefs = useRef<{ loaded?: () => void; error?: () => void }>(
    {}
  );

  // Helpers copied from original for fallback only
  const getComponentId = (component: LoadedJsonComponent): string =>
    component.id ||
    `${component.metadata?.type || "unknown"}:${
      component.metadata?.name || ""
    }`;

  const getComponentIcon = (component: LoadedJsonComponent): string => {
    if (component.metadata.icon) return component.metadata.icon;
    const iconMap: Record<string, string> = {
      button: "🔘",
      input: "📝",
      text: "📄",
      heading: "📰",
      image: "🖼️",
      container: "📦",
      table: "📊",
      chart: "📈",
      div: "🔲",
    };
    return iconMap[component.metadata.type.toLowerCase()] || "🧩";
  };

  const createComponentPreview = (component: LoadedJsonComponent): string => {
    if (component.ui?.template && component.ui?.styles?.css) {
      let template = component.ui.template;
      template = template.replace(/on\w+="[^"]*"/g, "");
      const compType = (component.metadata?.type || "").toLowerCase();
      const variantDefault = compType === "button" ? "primary" : "default";
      const contentDefault =
        component.metadata?.name || (compType === "button" ? "Button" : "");
      template = template
        .replace(/\{\{\s*variant\s*\}\}/g, variantDefault)
        .replace(/\{\{\s*size\s*\}\}/g, "medium")
        .replace(/\{\{\s*inputType\s*\}\}/g, "text")
        .replace(/\{\{\s*placeholder\s*\}\}/g, "Enter text")
        .replace(/\{\{\s*value\s*\}\}/g, "")
        .replace(/\{\{\s*content\s*\}\}/g, contentDefault)
        .replace(/\{\{#if\s+disabled\}\}disabled\{\{\/if\}\}/g, "")
        .replace(/\{\{#if\s+required\}\}\s*required\s*\{\{\/if\}\}/g, "");
      template = template.replace(
        /class="([^"]*)"/,
        'class="$1 component-preview"'
      );
      return template;
    }
    return `<span class="component-preview-fallback">${component.metadata.name}</span>`;
  };

  const getComponentStyles = (component: LoadedJsonComponent): string => {
    if (component.ui?.styles?.css) {
      const componentId = getComponentId(component);
      return component.ui.styles.css.replace(
        /(\.[a-zA-Z-_][a-zA-Z0-9-_]*)/g,
        `.element-item[data-component-id="${componentId}"] $1`
      );
    }
    return "";
  };

  const getComponentsByCategory = () => {
    const categories: Record<string, LoadedJsonComponent[]> = {};
    components.forEach((component) => {
      const category = component.metadata.category || "uncategorized";
      if (!categories[category]) categories[category] = [];
      categories[category].push(component);
    });
    return categories;
  };

  // Load components using existing conductor + legacy fallback
  const loadComponentsAfterPlugins = async () => {
    try {
      const system = (window as any).renderxCommunicationSystem;
      if (system && system.conductor) {
        const { conductor } = system;
        try {
          jsonComponentLoader.connectToConductor(conductor);
        } catch {}
        const handleComponentsLoaded = (data: any) => {
          if (data.components && Array.isArray(data.components)) {
            setComponents(data.components);
            setLoading(false);
            setError(null);
            if (fallbackTimerRef.current != null) {
              window.clearTimeout(fallbackTimerRef.current);
              fallbackTimerRef.current = null;
            }
          }
        };
        const handleComponentsError = (data: any) => {
          setError(data.error || "Failed to load components");
          setLoading(false);
        };
        if (!subscribedRef.current) {
          subscribedRef.current = true;
          unsubscribeRefs.current.loaded = conductor.subscribe(
            "components:loaded",
            handleComponentsLoaded
          );
          unsubscribeRefs.current.error = conductor.subscribe(
            "components:error",
            handleComponentsError
          );
        }
        try {
          if (!requestedRef.current) {
            requestedRef.current = true;
            conductor.play(
              "Component Library Plugin",
              "load-components-symphony",
              {
                source: "json-components",
                onComponentsLoaded: (items: any[]) => {
                  setComponents(items as any);
                  setLoading(false);
                  setError(null);
                },
              }
            );
          }
        } catch (e) {
          jsonComponentLoader
            .loadAllComponents()
            .then((res) => {
              setComponents(res.success as any);
              setLoading(false);
              setError(null);
            })
            .catch((err) => {
              setError(err?.message || "Failed to load components");
              setLoading(false);
            });
        }
        if (fallbackTimerRef.current == null) {
          fallbackTimerRef.current = window.setTimeout(() => {
            if (components.length === 0) {
              jsonComponentLoader
                .loadAllComponents()
                .then((res) => {
                  setComponents(res.success as any);
                  setLoading(false);
                  setError(null);
                })
                .catch((err) => {
                  setError(err?.message || "Failed to load components");
                  setLoading(false);
                })
                .finally(() => {
                  if (fallbackTimerRef.current != null) {
                    window.clearTimeout(fallbackTimerRef.current);
                    fallbackTimerRef.current = null;
                  }
                });
            }
          }, 2000);
        }
        return () => {
          unsubscribeRefs.current.loaded?.();
          unsubscribeRefs.current.error?.();
          subscribedRef.current = false;
        };
      } else {
        setError("Musical Conductor not available for component loading");
        setLoading(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load components"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const check = async () => {
      const system = (window as any).renderxCommunicationSystem;
      if (system) {
        setTimeout(async () => {
          cleanup = await loadComponentsAfterPlugins();
        }, 300);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="element-library">
      <div className="element-library-header">
        <h3>
          Element Library
          <span className="component-count" title="Loaded components">
            {components.length > 0 ? ` (${components.length})` : ""}
          </span>
        </h3>
        {loading && <div className="loading-indicator">Loading...</div>}
        {error && <div className="error-indicator">Error: {error}</div>}
      </div>
      <div className="element-library-content">
        {loading ? (
          <div className="element-library-loading">
            <div className="loading-state">
              <h4>Loading Components...</h4>
              <p>Scanning json-components folder</p>
            </div>
          </div>
        ) : error ? (
          <div className="element-library-error">
            <div className="error-state">
              <h4>Failed to Load Components</h4>
              <p>{error}</p>
            </div>
          </div>
        ) : components.length === 0 ? (
          <div className="element-library-empty">
            <div className="empty-state">
              <h4>No Components Found</h4>
              <p>No JSON components found in public/json-components/</p>
              <p>Add .json component files to see them here.</p>
            </div>
          </div>
        ) : (
          <>
            <style>
              {components.map((c) => getComponentStyles(c)).join("\n")}
              {`
                .element-item .component-preview-container { margin: 4px 0; padding: 4px; border: 1px solid #e0e0e0; border-radius: 3px; background: #f9f9f9; min-height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; overflow: hidden; }
                .element-item .component-preview { transform: scale(0.8); transform-origin: center; pointer-events: none; }
                .element-item .component-preview-fallback { color: #666; font-style: italic; }
              `}
            </style>
            {Object.entries(getComponentsByCategory()).map(
              ([category, items]) => (
                <div key={category} className="element-category">
                  <h4>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h4>
                  <div className="element-list">
                    {items.map((component, idx) => (
                      <div
                        key={`${getComponentId(component)}:${idx}`}
                        className="element-item"
                        data-component={component.metadata.type.toLowerCase()}
                        data-component-id={getComponentId(component)}
                        draggable
                        onDragStart={(e) => {
                          try {
                            const container = document.createElement("div");
                            container.style.position = "absolute";
                            container.style.top = "-1000px";
                            container.style.left = "-1000px";
                            container.style.pointerEvents = "none";
                            const preview = (
                              e.currentTarget as HTMLElement
                            ).querySelector(
                              ".component-preview-container"
                            ) as HTMLElement | null;
                            if (preview) {
                              const clone = preview.cloneNode(
                                true
                              ) as HTMLElement;
                              clone.style.transform = "scale(1)";
                              clone.style.padding = "0";
                              clone.style.border = "none";
                              const wrapper = document.createElement("div");
                              wrapper.className = "element-item";
                              wrapper.setAttribute(
                                "data-component-id",
                                getComponentId(component)
                              );
                              wrapper.appendChild(clone);
                              container.appendChild(wrapper);
                              document.body.appendChild(container);
                              const rect = preview.getBoundingClientRect();
                              e.dataTransfer?.setDragImage(
                                container,
                                rect.width / 2,
                                rect.height / 2
                              );
                              setTimeout(() => {
                                if (container.parentNode)
                                  container.parentNode.removeChild(container);
                              }, 0);
                            }
                          } catch {}
                          if (onDragStart) onDragStart(e, component);
                        }}
                        onDragEnd={
                          onDragEnd
                            ? (e) => onDragEnd(e as any, component)
                            : undefined
                        }
                        title={`${component.metadata.description}\nVersion: ${component.metadata.version}\nAuthor: ${component.metadata.author}\nDrag to canvas to add`}
                      >
                        <div className="element-header">
                          <span className="element-icon">
                            {getComponentIcon(component)}
                          </span>
                          <span className="element-name">
                            {component.metadata.name}
                          </span>
                          <span className="element-type">
                            ({component.metadata.type})
                          </span>
                        </div>
                        <div
                          className="component-preview-container"
                          dangerouslySetInnerHTML={{
                            __html: createComponentPreview(component),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LegacyElementLibrary;
