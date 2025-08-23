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

  // Special handling for input elements with icons
  const isInputWithIcon =
    model.tag === "input" && model.attributes?.["data-icon"];

  const renderElement = () => {
    if (isInputWithIcon) {
      // Wrap input with icon in a container
      return (
        <div
          className="rx-input-wrapper"
          style={{ position: "relative", display: "inline-block" }}
        >
          {model.attributes?.["data-icon-pos"] !== "end" && (
            <span
              className="rx-input-icon rx-input-icon--start"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "14px",
                opacity: 0.6,
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {model.attributes["data-icon"]}
            </span>
          )}
          {React.createElement(ChildTag, {
            className: model.classes.join(" "),
            ...model.attributes,
            style: {
              paddingLeft:
                model.attributes?.["data-icon-pos"] !== "end"
                  ? "36px"
                  : undefined,
              paddingRight:
                model.attributes?.["data-icon-pos"] === "end"
                  ? "36px"
                  : undefined,
            },
          })}
          {model.attributes?.["data-icon-pos"] === "end" && (
            <span
              className="rx-input-icon rx-input-icon--end"
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "14px",
                opacity: 0.6,
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {model.attributes["data-icon"]}
            </span>
          )}
        </div>
      );
    }

    // Default rendering for non-input or input without icon
    return React.createElement(
      ChildTag,
      {
        className: model.classes.join(" "),
        ...model.attributes,
      },
      model.text || null
    );
  };

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
      {renderElement()}
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
