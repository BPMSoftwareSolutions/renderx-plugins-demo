/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";
import {
  setFlagOverride,
  clearFlagOverrides,
} from "../../src/core/environment/feature-flags";

describe("App falls back to legacy 3-column layout when layout-manifest missing (TDD)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearFlagOverrides();
    document.body.innerHTML = "";
  });

  it("renders legacy grid when /layout-manifest.json is 404 and flag enabled", async () => {
    // Import App after mocks to ensure PanelSlot uses mocked fetch
    const App = (await import("../../src/ui/App")).default;

    // Enable feature flag path while simulating missing manifest
    setFlagOverride("ui.layout-manifest", true);

    // Mock plugin-manifest fetch to avoid PanelSlot throwing in Node
    vi.spyOn(globalThis, "fetch").mockImplementation((input: any) => {
      const url = String(input || "");
      if (url.endsWith("/plugins/plugin-manifest.json")) {
        return Promise.resolve(
          new Response(JSON.stringify({ plugins: [] }), { status: 200 })
        ) as any;
      }
      return Promise.resolve(new Response("not found", { status: 404 })) as any;
    });

    const el = document.createElement("div");
    document.body.appendChild(el);
    const root = createRoot(el);

    root.render(React.createElement(App));

    // Poll until fallback layout is rendered
    let gtc = "";
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 10));
      const container = el.firstElementChild as HTMLElement | null;
      if (container) {
        gtc = (container.style as any).gridTemplateColumns || "";
        if (gtc.includes("320px 1fr 360px")) break;
      }
    }

    expect(gtc).toContain("320px 1fr 360px");

    // Ensure React roots and observers are cleaned up to avoid jsdom teardown errors
    root.unmount();
  });
});
