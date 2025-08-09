/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React, { useState, useEffect, useRef } from "react";
import type { LoadedJsonComponent } from "../types/JsonComponent";
import type { ElementLibraryProps } from "../types/AppTypes";
import { jsonComponentLoader } from "../services/JsonComponentLoader";

const ElementLibrary: React.FC<ElementLibraryProps> = ({
  onDragStart,
  onDragEnd,
}) => {
  const [components, setComponents] = useState<LoadedJsonComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] =
    useState<LoadedJsonComponent | null>(null);
  const requestedRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const subscribedRef = useRef(false);
  const unsubscribeRefs = useRef<{ loaded?: () => void; error?: () => void }>(
    {}
  );

  // Component loading function - integrates with Musical Conductor symphony
  const loadComponentsAfterPlugins = async () => {
    try {
      console.log(
        "🎼 ElementLibrary: Triggering JSON component loading symphony..."
      );

      // Get the communication system from global scope
      const system = (window as any).renderxCommunicationSystem;

      if (system && system.conductor) {
        const { conductor } = system;

        // Connect legacy loader to conductor (for future sequence-based loading)
        try {
          jsonComponentLoader.connectToConductor(conductor);
        } catch {}

        // Debug available sequences/plugins
        console.log(
          "🔍 Available sequences:",
          conductor.getSequenceNames?.() || "getSequenceNames not available"
        );
        console.log(
          "🔍 Available plugins:",
          conductor.getMountedPlugins?.() || "getMountedPlugins not available"
        );

        // Listen for components:loaded event from plugins
        const handleComponentsLoaded = (data: any) => {
          console.log(
            "🎼 ElementLibrary: Received components from plugin",
            data
          );
          if (data.components && Array.isArray(data.components)) {
            setComponents(data.components);
            setLoading(false);
            setError(null);

            // Cancel the fallback timer if it's still pending
            if (fallbackTimerRef.current != null) {
              window.clearTimeout(fallbackTimerRef.current);
              fallbackTimerRef.current = null;
            }
          }
        };

        const handleComponentsError = (data: any) => {
          console.error("🎼 ElementLibrary: Error loading components", data);
          setError(data.error || "Failed to load components");
          setLoading(false);

          // No display plugin yet; keep UI error state only
        };

        // Subscribe to MusicalConductor events via conductor (SPA-compliant)
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

        // Kick off plugin-driven component load (with callback)
        try {
          if (!requestedRef.current) {
            requestedRef.current = true;
            console.log(
              "🎼 ElementLibrary: Invoking plugin-driven component load via conductor.play()"
            );
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
          console.warn(
            "⚠️ ElementLibrary: Plugin-driven load failed, falling back to direct loader",
            e
          );
          // Fallback if plugin call throws synchronously
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

        // Safety: if callback never fires, use legacy loader after 2s
        if (fallbackTimerRef.current == null) {
          fallbackTimerRef.current = window.setTimeout(() => {
            // Only run if nothing loaded yet
            if (components.length === 0) {
              console.warn(
                "⏱️ ElementLibrary: Plugin callback timeout, using legacy loader"
              );
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

        // Cleanup function
        return () => {
          unsubscribeRefs.current.loaded?.();
          unsubscribeRefs.current.error?.();
          subscribedRef.current = false;
        };
      } else {
        console.log("🔄 No conductor/eventBus available for component loading");
        setError("Musical Conductor not available for component loading");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Failed to load JSON components:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load components"
      );
      // Kick off plugin-driven component load (with callback)
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
        console.warn(
          "⚠️ ElementLibrary: Plugin-driven load failed, falling back to direct loader",
          e
        );
        // Fallback: direct JSON load
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

      setLoading(false);
    }
  };

  // Load components when ElementLibrary mounts and communication system is ready
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const checkAndLoadComponents = async () => {
      const system = (window as any).renderxCommunicationSystem;
      if (system) {
        // Wait for plugins to finish loading before triggering component loading
        console.log(
          "🔍 ElementLibrary: Waiting for plugins to load before triggering component loading..."
        );
        setTimeout(async () => {
          cleanup = await loadComponentsAfterPlugins();
        }, 300); // Small delay to allow plugins to mount
      } else {
        // Wait a bit and try again
        setTimeout(checkAndLoadComponents, 100);
      }
    };

    checkAndLoadComponents();

    // Return cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const getComponentsByCategory = () => {
    const categories: Record<string, LoadedJsonComponent[]> = {};

    components.forEach((component) => {
      const category = component.metadata.category || "uncategorized";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(component);
    });

    return categories;
  };

  const getComponentIcon = (component: LoadedJsonComponent): string => {
    // Use the icon from the component's metadata if available
    if (component.metadata.icon) {
      return component.metadata.icon;
    }

    // Fallback to type-based icon mapping
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
    // Create a mini preview using the component's template and styles
    if (component.ui?.template && component.ui?.styles?.css) {
      // Create a simplified version of the template for preview
      let template = component.ui.template;

      // Remove event handlers for preview
      template = template.replace(/on\w+="[^"]*"/g, "");

      // Add preview-specific classes
      template = template.replace(
        /class="([^"]*)"/,
        'class="$1 component-preview"'
      );

      return template;
    }

    // Fallback to simple text preview
    return `<span class="component-preview-fallback">${component.metadata.name}</span>`;
  };

  const getComponentStyles = (component: LoadedJsonComponent): string => {
    // Return the CSS styles for the component
    if (component.ui?.styles?.css) {
      // Scope the styles to the preview container to avoid conflicts
      const scopedCSS = component.ui.styles.css.replace(
        /(\.[a-zA-Z-_][a-zA-Z0-9-_]*)/g,
        `.element-item[data-component-id="${component.id}"] $1`
      );
      return scopedCSS;
    }
    return "";
  };

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
            {/* Inject component styles */}
            <style>
              {components
                .map((component) => getComponentStyles(component))
                .join("\n")}
              {/* Additional preview styles */}
              {`
                .element-item .component-preview-container {
                  margin: 4px 0;
                  padding: 4px;
                  border: 1px solid #e0e0e0;
                  border-radius: 3px;
                  background: #f9f9f9;
                  min-height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  overflow: hidden;
                }
                .element-item .component-preview {
                  transform: scale(0.8);
                  transform-origin: center;
                  pointer-events: none;
                }
                .element-item .component-preview-fallback {
                  color: #666;
                  font-style: italic;
                }
              `}
            </style>

            {Object.entries(getComponentsByCategory()).map(
              ([category, categoryComponents]) => (
                <div key={category} className="element-category">
                  <h4>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h4>
                  <div className="element-list">
                    {categoryComponents.map((component, idx) => (
                      <div
                        key={
                          component.id ||
                          `${component.metadata?.type || "unknown"}:${
                            component.metadata?.name || ""
                          }:${idx}`
                        }
                        className="element-item"
                        data-component={component.metadata.type.toLowerCase()}
                        data-component-id={
                          component.id ||
                          `${component.metadata?.type || "unknown"}:${
                            component.metadata?.name || ""
                          }`
                        }
                        draggable
                        onDragStart={
                          onDragStart
                            ? (e) => onDragStart(e, component)
                            : undefined
                        }
                        onDragEnd={onDragEnd}
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

export default ElementLibrary;
