/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React, { useState, useEffect, useRef } from "react";
import type { LoadedJsonComponent } from "../types/JsonComponent";
import type { ElementLibraryProps } from "../types/AppTypes";
import LegacyElementLibrary from "./LegacyElementLibrary";

const ElementLibrary: React.FC<ElementLibraryProps> = ({
  onDragStart,
  onDragEnd,
}) => {
  // Try to render plugin-provided UI first; fallback to built-in UI if unavailable
  const [PluginUIPanel, setPluginUIPanel] = useState<any>(null);
  const [pluginTried, setPluginTried] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Only attempt plugin UI in dev; production uses fallback UI
        const dev =
          (typeof import.meta !== "undefined" &&
            (import.meta as any).env?.DEV) === true;
        if (!dev) {
          return;
        }
        const spec = "/plugins/component-library-plugin/index.js";
        // Dynamic spec avoids Vite static import analysis; runtime middleware serves it
        const m: any = await import(/* @vite-ignore */ spec as any);
        if (cancelled) return;
        const Comp =
          m?.LibraryPanel ||
          (m?.default && (m.default.LibraryPanel || m.default)) ||
          null;
        if (typeof Comp === "function") {
          setPluginUIPanel(() => Comp);
        }
      } catch (e) {
        // Silently ignore - we'll use fallback UI
      } finally {
        if (!cancelled) setPluginTried(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
          const system = (window as any).renderxCommunicationSystem;
          system?.conductor.play(
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

  // Compute the same componentId used in data attributes, with a stable fallback
  const getComponentId = (component: LoadedJsonComponent): string => {
    return (
      component.id ||
      `${component.metadata?.type || "unknown"}:${
        component.metadata?.name || ""
      }`
    );
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

      // Decide sensible defaults per type
      const compType = (component.metadata?.type || "").toLowerCase();
      const variantDefault = compType === "button" ? "primary" : "default";
      const contentDefault =
        component.metadata?.name || (compType === "button" ? "Button" : "");

      // Replace common template placeholders with safe defaults for preview
      template = template
        .replace(/\{\{\s*variant\s*\}\}/g, variantDefault)
        .replace(/\{\{\s*size\s*\}\}/g, "medium")
        .replace(/\{\{\s*inputType\s*\}\}/g, "text")
        .replace(/\{\{\s*placeholder\s*\}\}/g, "Enter text")
        .replace(/\{\{\s*value\s*\}\}/g, "")
        .replace(/\{\{\s*content\s*\}\}/g, contentDefault);

      // Strip simplistic Handlebars-like disabled/required conditionals for preview
      template = template
        .replace(/\{\{#if\s+disabled\}\}disabled\{\{\/if\}\}/g, "")
        .replace(/\{\{#if\s+required\}\}\s*required\s*\{\{\/if\}\}/g, "");

      // Add preview-specific classes
      template = template.replace(
        /class="([^"]*)"/,
        'class="$1 component-preview"'
      );

      // Debug: log the classes we ended up with
      try {
        const classMatch = template.match(/class=\"([^\"]*)\"/);
        console.log("[ElementLibrary] preview class list:", {
          id: getComponentId(component),
          classes: classMatch?.[1] || "(none)",
        });
      } catch {}

      return template;
    }

    // Fallback to simple text preview
    return `<span class="component-preview-fallback">${component.metadata.name}</span>`;
  };

  const getComponentStyles = (component: LoadedJsonComponent): string => {
    // Return the CSS styles for the component
    if (component.ui?.styles?.css) {
      const componentId = getComponentId(component);
      // Scope the styles to the preview container to avoid conflicts
      const scopedCSS = component.ui.styles.css.replace(
        /(\.[a-zA-Z-_][a-zA-Z0-9-_]*)/g,
        `.element-item[data-component-id="${componentId}"] $1`
      );
      return scopedCSS;
    }
    return "";
  };

  // Render plugin UI if present (keeps hook order stable)
  // Render plugin UI if present (keeps hook order stable)
  if (PluginUIPanel) {
    return <PluginUIPanel onDragStart={onDragStart} onDragEnd={onDragEnd} />;
  }

  // Fallback to legacy UI component
  return (
    <LegacyElementLibrary onDragStart={onDragStart} onDragEnd={onDragEnd} />
  );
};

export default ElementLibrary;
