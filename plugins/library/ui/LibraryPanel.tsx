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

export function LibraryPreview({
  component,
  conductor,
}: {
  component: any;
  conductor: any;
}) {
  const model = computePreviewModel(component);
  const ChildTag: any = model.tag || "div";

  return (
    <li
      style={{ cursor: "grab", ...varsToStyle(model.cssVars) }}
      draggable
      onDragStart={(e) => {
        const r = resolveInteraction("library.component.drag.start");
        conductor?.play?.(r.pluginId, r.sequenceId, {
          event: "library:component:drag:start",
          domEvent: e,
          component,
        });
      }}
    >
      {model.cssText ? <style>{model.cssText}</style> : null}
      {model.cssTextLibrary ? <style>{model.cssTextLibrary}</style> : null}
      {React.createElement(
        ChildTag,
        {
          className: model.classes.join(" "),
          ...model.attributes,
        },
        model.text || null
      )}
    </li>
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

  return (
    <div
      className="p-3 h-full rx-lib"
      style={{ borderRight: "1px solid #eee", overflow: "auto" }}
    >
      <h3>Library</h3>
      <ul
        style={{
          display: "grid",
          gap: 8,
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {safeItems.map((c) => (
          <LibraryPreview key={c.id} component={c} conductor={conductor} />
        ))}
      </ul>
    </div>
  );
}
