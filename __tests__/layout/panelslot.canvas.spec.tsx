/* @vitest-environment jsdom */
// @ts-nocheck

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";

function render(slot: string) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  return { el, root };
}

describe("PanelSlot loads Canvas UI via package specifier", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("resolves '@renderx-plugins/canvas' and mounts CanvasPage without errors", async () => {
    const { PanelSlot, __setPanelSlotManifestForTests } = await import(
      "../../src/components/PanelSlot"
    );

    __setPanelSlotManifestForTests({
      plugins: [
        {
          id: "CanvasPlugin",
          ui: { slot: "canvas", module: "@renderx-plugins/canvas", export: "CanvasPage" },
        },
      ],
    });

    const spyErr = vi.spyOn(console, "error").mockImplementation(() => {});

    const { root } = render("canvas");
    root.render(React.createElement(PanelSlot, { slot: "canvas" }));

    // Let the dynamic import settle and React effect run
    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 0));
      if (document.querySelector('#rx-canvas')) break;
    }

    // Should not log errors during successful mount
    expect(spyErr).not.toHaveBeenCalled();

    // CanvasPage renders #rx-canvas inside .canvas-content
    const rx = document.querySelector('#rx-canvas');
    expect(rx).toBeTruthy();

    root.unmount();
    await Promise.resolve();
  });
});

