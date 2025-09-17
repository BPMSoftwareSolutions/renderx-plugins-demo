/* @vitest-environment jsdom */
// @ts-nocheck

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";

function render() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  return { el, root };
}

describe("PanelSlot loads Control Panel UI from package and reacts to selection updates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("selection → update notifies package UI observer and updates header", async () => {
    const { PanelSlot, __setPanelSlotManifestForTests } = await import(
      "../../src/components/PanelSlot"
    );

    // Point manifest UI to the package entry
    __setPanelSlotManifestForTests({
      plugins: [
        {
          id: "ControlPanelPlugin",
          ui: { slot: "controlPanel", module: "@renderx-plugins/control-panel", export: "ControlPanel" },
        },
      ],
    });

    const spyErr = vi.spyOn(console, "error").mockImplementation(() => {});

    const { root } = render();
    root.render(React.createElement(PanelSlot, { slot: "controlPanel" }));

    // Let the dynamic import settle and React effect run; wait for header to appear
    let headerFound = false;
    for (let i = 0; i < 200; i++) {
      await new Promise((r) => setTimeout(r, 10));
      if (document.querySelector(".control-panel-header")) { headerFound = true; break; }
    }
    expect(headerFound).toBe(true);

    // Arrange: create a canvas element using canvas-component handlers to get an id
    const { handlers: createHandlers } = await import("@renderx-plugins/canvas-component");
    const ctx: any = { payload: {} };
    // Provide a canvas root for canvas-component handlers
    const canvasRoot = document.createElement('div');
    canvasRoot.id = 'rx-canvas';
    canvasRoot.style.position = 'relative';
    document.body.appendChild(canvasRoot);

    const template = {
      tag: "button",
      text: "Click me",
      classes: ["rx-comp", "rx-button"],
      css: ".rx-button { background: var(--bg-color); color: var(--text-color); }",
      cssVariables: { "bg-color": "#007acc", "text-color": "#ffffff" },
      dimensions: { width: 120, height: 40 },
    };
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);
    const nodeId = ctx.payload.nodeId as string;

    // Act: use PACKAGE selection symphony to derive model and notify UI observer
    const { handlers: selectionHandlers } = await import(
      "@renderx-plugins/control-panel/symphonies/selection/selection.symphony"
    );
    const selCtx: any = { payload: {} };
    selectionHandlers.deriveSelectionModel({ id: nodeId }, selCtx);
    expect(selCtx.payload?.selectionModel?.header?.type).toBe("button");
    selectionHandlers.notifyUi({}, selCtx);

    // Assert: header reflects selected element
    let typeFound = "";
    for (let i = 0; i < 100; i++) {
      await new Promise((r) => setTimeout(r, 10));
      const el = document.querySelector(".control-panel-header .element-type");
      if (el) { typeFound = el.textContent || ""; if (typeFound) break; }
    }
    expect(typeFound).toBe("button");

    expect(spyErr).not.toHaveBeenCalled();

    root.unmount();
    await Promise.resolve();
  });
});

