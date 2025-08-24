import React from "react";
import { useConductor } from "../../../src/conductor";
import { resolveInteraction } from "../../../src/interactionManifest";
import { computePreviewModel } from "./preview.model";
import {
  varsToStyle,
  pickDataAttrs,
  groupComponentsByCategory,
  getCategoryDisplayName
} from "../utils/library.utils.js";
import "./LibraryPanel.css";

export function LibraryPreview({ component, conductor }: { component: any; conductor: any }) {
  const model = computePreviewModel(component);
  const hostDataAttrs = pickDataAttrs(model.attributes);
  const name = component?.name || component?.template?.name || "Component";
  const description = component?.template?.attributes?.["data-description"] ||
                     component?.metadata?.description || `${name} component`;
  const icon = component?.template?.attributes?.["data-icon"] || "🧩";

  const handleDragStart = (e: React.DragEvent) => {
    const r = resolveInteraction("library.component.drag.start");
    conductor?.play?.(r.pluginId, r.sequenceId, {
      event: "library:component:drag:start",
      domEvent: e,
      component,
    });
  };

  return (
    <div className="library-component-item" style={varsToStyle(model.cssVars)} {...hostDataAttrs} draggable onDragStart={handleDragStart}>
      {model.cssText && <style>{model.cssText}</style>}
      {model.cssTextLibrary && <style>{model.cssTextLibrary}</style>}
      <span className="library-component-icon">{icon}</span>
      <div className="library-component-name">{name}</div>
      <div className="library-component-description">{description}</div>
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
    <div className="library-sidebar">
      <div className="library-sidebar-header">
        <h2 className="library-sidebar-title">🧩 Component Library</h2>
        <p className="library-sidebar-subtitle">Drag components to the canvas</p>
      </div>

      <div className="library-component-library rx-lib">
        {Object.entries(groupedComponents).map(([category, components]) => (
          <div key={category} className="library-component-category">
            <div className="library-category-title">{getCategoryDisplayName(category)}</div>
            <div className="library-component-grid">
              {components.map((component) => (
                <LibraryPreview key={component.id} component={component} conductor={conductor} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
