import React from "react";
import { useConductor } from "../../../src/conductor";
import { resolveInteraction } from "../../../src/interactionManifest";

import { computePreviewModel } from "./preview.model";

function varsToStyle(vars?: Record<string, string>): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (!vars) return style;
  for (const [k, v] of Object.entries(vars)) {
    // @ts-expect-error allow custom CSS var keys on style object
    style[k] = v;
  }
  return style;
}

function pickDataAttrs(attrs?: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(attrs || {}))
    if (k.startsWith("data-")) out[k] = v as string;
  return out;
}

// Group components by category
function groupComponentsByCategory(components: any[]) {
  const groups: Record<string, any[]> = {};

  components.forEach(component => {
    const category = component?.template?.attributes?.["data-category"] ||
                    component?.metadata?.category ||
                    "basic";

    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(component);
  });

  return groups;
}

// Get category display name
function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    basic: "Basic Components",
    layout: "Layout Components",
    form: "Form Components",
    ui: "UI Components"
  };

  return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1) + " Components";
}

export function LibraryPreview({
  component,
  conductor,
}: {
  component: any;
  conductor: any;
}) {
  const model = computePreviewModel(component);
  const hostDataAttrs = pickDataAttrs(model.attributes);

  // Extract component metadata
  const name = component?.name || component?.template?.name || "Component";
  const description = component?.template?.attributes?.["data-description"] ||
                     component?.metadata?.description ||
                     `${name} component`;
  const icon = component?.template?.attributes?.["data-icon"] || "🧩";

  return (
    <div
      className="component-item"
      style={{
        cursor: "grab",
        background: "white",
        border: "2px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px",
        transition: "all 0.3s ease",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        ...varsToStyle(model.cssVars)
      }}
      {...hostDataAttrs}
      draggable
      onDragStart={(e) => {
        const r = resolveInteraction("library.component.drag.start");
        conductor?.play?.(r.pluginId, r.sequenceId, {
          event: "library:component:drag:start",
          domEvent: e,
          component,
        });
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.borderColor = "#3b82f6";
        target.style.transform = "translateY(-2px)";
        target.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.15)";
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.borderColor = "#e5e7eb";
        target.style.transform = "translateY(0)";
        target.style.boxShadow = "none";
      }}
      onMouseDown={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.cursor = "grabbing";
        target.style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.cursor = "grab";
        target.style.transform = "translateY(-2px)";
      }}
    >
      {model.cssText ? <style>{model.cssText}</style> : null}
      {model.cssTextLibrary ? <style>{model.cssTextLibrary}</style> : null}

      <span
        className="component-icon"
        style={{
          fontSize: "24px",
          marginBottom: "8px",
          display: "block"
        }}
      >
        {icon}
      </span>

      <div
        className="component-name"
        style={{
          fontSize: "12px",
          fontWeight: "500",
          color: "#111827",
          marginBottom: "4px"
        }}
      >
        {name}
      </div>

      <div
        className="component-description"
        style={{
          fontSize: "10px",
          color: "#6b7280",
          lineHeight: "1.3"
        }}
      >
        {description}
      </div>
    </div>
  );
}

export function LibraryPanel() {
  const conductor = useConductor();
  const [items, setItems] = React.useState<any[]>([]);
  const safeItems = Array.isArray(items) ? items : [];

  React.useEffect(() => {
    const r = resolveInteraction("library.load");
    conductor?.play?.(r.pluginId, r.sequenceId, {
      onComponentsLoaded: (list: any[]) => setItems(list),
    });
  }, [conductor]);

  const groupedComponents = groupComponentsByCategory(safeItems);

  return (
    <div
      className="sidebar"
      style={{
        width: "320px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRight: "1px solid rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 20px rgba(0, 0, 0, 0.1)",
        height: "100%"
      }}
    >
      {/* Header */}
      <div
        className="sidebar-header"
        style={{
          padding: "20px",
          background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
          color: "white",
          textAlign: "center"
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px",
            margin: 0
          }}
        >
          🧩 Component Library
        </h2>
        <p
          style={{
            fontSize: "12px",
            opacity: 0.9,
            margin: 0
          }}
        >
          Drag components to the canvas
        </p>
      </div>

      {/* Component Library */}
      <div
        className="component-library rx-lib"
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto"
        }}
      >
        {Object.entries(groupedComponents).map(([category, components]) => (
          <div
            key={category}
            className="component-category"
            style={{ marginBottom: "24px" }}
          >
            <div
              className="category-title"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {getCategoryDisplayName(category)}
            </div>

            <div
              className="component-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px"
              }}
            >
              {components.map((component) => (
                <LibraryPreview
                  key={component.id}
                  component={component}
                  conductor={conductor}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
