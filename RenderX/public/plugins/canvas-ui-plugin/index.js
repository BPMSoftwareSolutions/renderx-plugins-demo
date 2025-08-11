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
          ? nodes.map((n) =>
              React.createElement(
                "div",
                {
                  key:
                    n.id ||
                    n.elementId ||
                    Math.random().toString(36).slice(2, 8),
                  id: n.id || n.elementId,
                  className:
                    (n.cssClass || "") +
                    " " +
                    (n.type
                      ? makeRxCompClass(String(n.type).toLowerCase())
                      : ""),
                  "data-component-id": n.id || n.elementId,
                  style: {
                    position: "absolute",
                    left: (n.position && n.position.x) || 0,
                    top: (n.position && n.position.y) || 0,
                  },
                },
                React.createElement(
                  "div",
                  { className: "component-inner" },
                  n.type || "Component"
                )
              )
            )
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
