import React from "react";
import type { FieldRendererProps } from "../../types/control-panel.types";
import { useConductor, EventRouter } from "@renderx/host-sdk";

type TreeNodeModel = { tag: string; id?: string; children: TreeNodeModel[] };

function parseSvgToTree(svgMarkup: string): TreeNodeModel | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<svg>${svgMarkup}</svg>`,
      "image/svg+xml"
    );
    const svg = doc.querySelector("svg");
    if (!svg) return null;
    const walk = (el: Element): TreeNodeModel => ({
      tag: el.tagName,
      id: (el as HTMLElement).id || undefined,
      children: Array.from(el.children).map(walk),
    });
    return walk(svg);
  } catch {
    return null;
  }
}

function TreeNode({
  node,
  path,
  onSelect,
}: {
  node: TreeNodeModel;
  path: string;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const label = node.id ? `${node.tag}#${node.id}` : node.tag;
  const hasChildren = (node.children || []).length > 0;
  return (
    <div style={{ marginLeft: 8, pointerEvents: "auto" }}>
      <div
        style={{
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
        title="Click to highlight on canvas; click triangle to toggle"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          role="button"
          tabIndex={0}
          onClick={() => setExpanded((e) => !e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setExpanded((x) => !x);
          }}
          style={{ width: 12, display: "inline-block" }}
        >
          {hasChildren ? (expanded ? "▾" : "▸") : "•"}
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={() => onSelect(path)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelect(path);
          }}
        >
          {label}
        </span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child: TreeNodeModel, idx: number) => (
            <TreeNode
              key={idx}
              node={child}
              path={path ? `${path}/${idx}` : `${idx}`}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const SvgTreeView: React.FC<FieldRendererProps> = ({
  selectedElement,
}) => {
  const conductor = useConductor();
  const svgMarkup = selectedElement?.content?.svgMarkup || "";
  const id = selectedElement?.header?.id;
  const root = React.useMemo(() => parseSvgToTree(svgMarkup), [svgMarkup]);

  const handleSelect = async (path: string) => {
    const cleanPath = String(path || "").replace(/^\//, "");
    if (!id || !conductor?.play) return;
    try {
      await EventRouter.publish(
        "canvas.component.select.svg-node.requested",
        { id, path: cleanPath },
        conductor
      );
    } catch (e) {
      console.warn("Failed to publish svg-node selection", e);
    }
  };

  if (!id) return null;

  return (
    <div
      className="svg-tree-view"
      style={{
        fontFamily: "ui-sans-serif, system-ui",
        fontSize: 12,
        pointerEvents: "auto",
      }}
    >
      {!root ? (
        <div style={{ opacity: 0.7 }}>No child nodes</div>
      ) : (
        <TreeNode node={root} path="" onSelect={handleSelect} />
      )}
    </div>
  );
};
