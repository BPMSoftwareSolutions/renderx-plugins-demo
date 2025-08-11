/**
 * Canvas UI Plugin (Scaffold) for RenderX
 * - CIA-compliant sequence/handlers for validator
 * - Exports a minimal React UI component (CanvasPage) using window.React
 * - Safe placeholder that mirrors Canvas DOM structure and classnames
 *
 * Note: Not yet registered in manifest; enabling will replace legacy Canvas via PanelSlot(slot="center").
 */

import { handleCanvasDrop } from "./handleDrop.js";
import { makeRxCompClass } from "./idUtils.js";

// Minimal sequence to satisfy plugin validator
export const sequence = {
  id: "Canvas.ui-symphony",
  name: "Canvas UI (Scaffold)",
  description: "Scaffold for Canvas UI plugin (center slot)",
  version: "0.1.0",
  key: "G Major",
  tempo: 120,
  timeSignature: "4/4",
  category: "ui",
  movements: [
    {
      id: "ui",
      name: "UI Lifecycle",
      description: "Minimal UI lifecycle",
      beats: [
        {
          beat: 1,
          event: "canvas-ui:init",
          title: "Init UI",
          handler: "noop",
          dynamics: "p",
          timing: "immediate",
        },
      ],
    },
  ],

  events: { triggers: ["canvas-ui:init"], emits: ["canvas-ui:init"] },
  configuration: {},
};

export const handlers = {
  noop: () => ({}),
};

// Helper: inject raw CSS if present, de-duped by hash
function injectRawCSS(css) {
  try {
    if (!css) return;
    const id = "component-css-" + btoa(css).substring(0, 10);
    if (document.getElementById(id)) return;
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = css;
    document.head.appendChild(tag);
  } catch {}
}

// Helper: best-effort parse of template to get tag and class list
function parseTemplateShape(template) {
  try {
    const tagMatch = template && template.match(/<\s*([a-zA-Z0-9-]+)/);
    const tag = (tagMatch ? tagMatch[1] : "div").toLowerCase();
    // collect class names from first opening tag
    const classMatch = template && template.match(/class\s*=\s*"([^"]*)"/);
    const classes = classMatch
      ? classMatch[1].split(/\s+/).filter(Boolean)
      : [];
    return { tag, classes };
  } catch {
    return { tag: "div", classes: [] };
  }
}
// Helper: resolve {{tokens}} in strings using provided vars
function resolveTemplateTokens(str, vars) {
  try {
    if (!str) return str;
    return String(str).replace(
      /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
      function (_m, key) {
        return vars && vars[key] != null ? String(vars[key]) : "";
      }
    );
  } catch {
    return str;
  }
}

// Helper: inject per-instance CSS (position/size) so no inline styles are needed
function injectInstanceCSS(node, width, height) {
  try {
    if (!node) return;
    const id =
      "component-instance-css-" + String(node.id || node.cssClass || "");
    if (document.getElementById(id)) return;
    const cls = String(node.cssClass || node.id || "").trim();
    if (!cls) return;
    const left =
      (node.position && node.position.x) != null ? node.position.x : 0;
    const top =
      (node.position && node.position.y) != null ? node.position.y : 0;
    const lines = [
      `.${cls}{position:absolute;left:${left}px;top:${top}px;box-sizing:border-box;display:block;}`,
    ];
    if (width != null)
      lines.push(
        `.${cls}{width:${typeof width === "number" ? width + "px" : width};}`
      );
    if (height != null)
      lines.push(
        `.${cls}{height:${
          typeof height === "number" ? height + "px" : height
        };}`
      );
    const tag = document.createElement("style");
    tag.id = id;
    tag.textContent = lines.join("\n");
    document.head.appendChild(tag);
  } catch {}
}

// New export: renderCanvasNode — produce a pure element for a created node
export function renderCanvasNode(node) {
  const React = (typeof window !== "undefined" && window.React) || null;
  if (!React || !node) return null;

  const component = node.component || node.componentData || {};
  const template = (component.ui && component.ui.template) || "<div></div>";
  const stylesCss =
    component.ui && component.ui.styles && component.ui.styles.css;

  // Inject CSS once
  injectRawCSS(stylesCss);

  // Determine tag and base classes from template
  const shape = parseTemplateShape(template);
  const tagName = shape.tag || node.type || "div";

  // Compose className: instance cssClass + resolved template classes
  const vars = {
    variant:
      (node && node.variant) ||
      (component && component.metadata && component.metadata.variant) ||
      "primary",
    size:
      (node && node.size) ||
      (component && component.metadata && component.metadata.size) ||
      "md",
  };
  const resolvedTemplateClasses = shape.classes.map((c) =>
    resolveTemplateTokens(c, vars)
  );
  const classes = [
    String(node.cssClass || node.id || ""),
    ...resolvedTemplateClasses,
  ]
    .filter(Boolean)
    .join(" ");

  // Dimensions from canvas integration
  const defaults =
    (component.integration && component.integration.canvasIntegration) || {};
  const width = defaults.defaultWidth;
  const height = defaults.defaultHeight;

  // Inject per-instance CSS for layout (no inline styles)
  injectInstanceCSS(node, width, height);

  const props = {
    id: node.id,
    className: classes,
    "data-component-id": node.id,
    draggable: true,
  };

  // Content: replace {{content}} with metadata.name if present
  const name =
    (component.metadata &&
      (component.metadata.name || component.metadata.type)) ||
    "";
  const text = String(template).includes("{{content}}")
    ? String(name || "")
    : undefined;

  // Void tags cannot have children
  const voidTags = new Set([
    "input",
    "img",
    "br",
    "hr",
    "meta",
    "link",
    "area",
    "base",
    "col",
    "embed",
    "source",
    "track",
    "wbr",
  ]);
  if (voidTags.has(tagName)) {
    return React.createElement(tagName, props);
  }
  return React.createElement(tagName, props, text);
}

// UI export: CanvasPage
// Uses window.React to remain decoupled from app build
export function CanvasPage(props = {}) {
  const React = (window && window.React) || null;
  if (!React) return null;
  const { useEffect, useState } = React;

  // Dev hint to console when mounted; wait until the plugin is mounted before calling play
  useEffect(() => {
    const pluginName = "Canvas UI Plugin";
    console.log("🎨 Canvas UI Plugin (Scaffold): mounted UI");
    const tryStart = () => {
      try {
        const system = (window && window.renderxCommunicationSystem) || null;
        const conductor = system && system.conductor;
        if (!conductor) return setTimeout(tryStart, 120);
        // Avoid duplicate runs under StrictMode
        if ((window && window.__rx_canvas_ui_played__) === true) return;
        const getIds =
          conductor.getMountedPlugins && conductor.getMountedPlugins();
        const ids = Array.isArray(getIds) ? getIds : [];
        if (ids.includes && ids.includes(pluginName)) {
          window.__rx_canvas_ui_played__ = true;
          conductor.play(pluginName, "Canvas.ui-symphony", {
            source: "canvas-ui-plugin",
          });
        } else {
          setTimeout(tryStart, 120);
        }
      } catch {
        setTimeout(tryStart, 150);
      }
    };

    tryStart();
  }, []);

  // Render a safe placeholder that mirrors existing Canvas DOM structure
  // Local state for created nodes (scaffold render)
  const [nodes, setNodes] =
    window.React && typeof window.React.useState === "function"
      ? window.React.useState([])
      : [[], function noop() {}];

  return React.createElement(
    "div",
    { className: "canvas-container canvas-container--editor" },
    React.createElement(
      "div",
      { className: "canvas-toolbar" },
      React.createElement(
        "div",
        { className: "canvas-toolbar-left" },
        React.createElement(
          "button",
          { className: "toolbar-button", disabled: true },
          "💾 Save"
        ),
        React.createElement(
          "button",
          { className: "toolbar-button", disabled: true },
          "📁 Load"
        ),
        React.createElement(
          "button",
          { className: "toolbar-button", disabled: true },
          "↩️ Undo"
        ),
        React.createElement(
          "button",
          { className: "toolbar-button", disabled: true },
          "↪️ Redo"
        )
      ),
      React.createElement(
        "div",
        { className: "canvas-toolbar-center" },
        React.createElement(
          "span",
          { className: "canvas-title" },
          "Canvas (Plugin UI - scaffold)"
        )
      ),
      React.createElement(
        "div",
        { className: "canvas-toolbar-right" },
        React.createElement(
          "button",
          { className: "toolbar-button", disabled: true },
          "🔍 Zoom"
        ),
        React.createElement(
          "button",
          { className: "toolbar-button", disabled: true },
          "⚙️ Settings"
        )
      )
    ),
    React.createElement(
      "div",
      {
        className: "canvas-workspace",
        onDragOver: (e) => {
          try {
            e && e.preventDefault && e.preventDefault();
          } catch {}
        },
        onDrop: (e) => {
          try {
            e && e.preventDefault && e.preventDefault();
            const system =
              (window && window.renderxCommunicationSystem) || null;
            const conductor = system && system.conductor;
            if (typeof handleCanvasDrop === "function") {
              handleCanvasDrop(conductor, e, {
                onComponentCreated: (node) => {
                  try {
                    if (!node) return;
                    const next = Array.isArray(nodes) ? nodes.slice() : [];
                    next.push(node);
                    setNodes(next);
                  } catch {}
                },
              });
            }
          } catch {}
        },
      },
      React.createElement("div", { className: "canvas-grid" }),
      React.createElement(
        "div",
        { className: "canvas-content" },
        nodes && nodes.length > 0
          ? nodes.map((n) => {
              const el =
                typeof renderCanvasNode === "function"
                  ? renderCanvasNode({
                      id: n.id || n.elementId,
                      cssClass:
                        n.cssClass ||
                        (n.type
                          ? makeRxCompClass(String(n.type).toLowerCase())
                          : ""),
                      type: n.type,
                      position: n.position || { x: 0, y: 0 },
                      component: n.component || n.componentData,
                    })
                  : null;
              return el;
            })
          : React.createElement(
              "div",
              { className: "canvas-placeholder" },
              React.createElement("h3", null, "Canvas Workspace (Plugin UI)"),
              React.createElement(
                "p",
                null,
                "Drag components from Element Library to add them"
              ),
              React.createElement(
                "p",
                null,
                "This is a scaffold; drop/selection will be added next."
              )
            )
      )
    )
  );
}
