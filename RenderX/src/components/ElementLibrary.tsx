/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React, { useState, useEffect } from "react";
import type { ElementLibraryProps } from "../types/AppTypes";
import LegacyElementLibrary from "./LegacyElementLibrary";
import { loadUiForSlot } from "../services/PluginUiLoader";

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
      // Only attempt plugin UI in dev; production uses fallback UI
      const dev =
        (typeof import.meta !== "undefined" &&
          (import.meta as any).env?.DEV) === true;
      if (!dev) {
        if (!cancelled) setPluginTried(true);
        return;
      }
      try {
        const Comp = await loadUiForSlot("left");
        if (!cancelled && typeof Comp === "function")
          setPluginUIPanel(() => Comp);
      } catch {}
      if (!cancelled) setPluginTried(true);
    })();
    return () => {
      cancelled = true;
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

  // While plugin UI import has not finished, avoid mounting legacy to prevent double loads
  if (!pluginTried) {
    return (
      <div className="element-library">
        <div className="element-library-content">
          <div className="element-library-loading">
            <div className="loading-state">
              <h4>Loading Library UI...</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
