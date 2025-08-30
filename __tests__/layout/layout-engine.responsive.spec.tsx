/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";

// Stub PanelSlot to avoid plugin-manifest dependency
vi.mock("../../src/components/PanelSlot", () => ({
  PanelSlot: (props: any) => React.createElement("div", { "data-panel-slot": props.slot })
}));

function mockFetch(manifest: any) {
  vi.spyOn(globalThis, "fetch").mockImplementation((input: any) => {
    const url = String(input || "");
    if (url.endsWith("/layout-manifest.json")) {
      return Promise.resolve(new Response(JSON.stringify(manifest), { status: 200 })) as any;
    }
    return Promise.resolve(new Response("not found", { status: 404 })) as any;
  });
}

function mockMatchMedia(widthPx: number) {
  // Simple matchMedia mock: only respond to (max-width: Xpx)
  const impl = (query: string) => {
    const m = /max-width:\s*(\d+)px/.exec(query);
    const max = m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
    const matches = widthPx <= max;
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    } as any;
  };
  (globalThis as any).matchMedia = impl;
}

describe("LayoutEngine respects responsive overrides from layout-manifest (TDD)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("applies small-viewport override", async () => {
    const manifest = {
      version: "1.0.0",
      layout: {
        kind: "grid",
        columns: ["320px", "1fr", "360px"],
        rows: ["1fr"],
        areas: [["library", "canvas", "controlPanel"]],
        responsive: [
          {
            media: "(max-width: 900px)",
            columns: ["1fr"],
            rows: ["auto", "1fr", "auto"],
            areas: [["library"], ["canvas"], ["controlPanel"]]
          }
        ]
      },
      slots: [
        { name: "library" },
        { name: "canvas" },
        { name: "controlPanel" }
      ]
    };

    mockFetch(manifest);
    mockMatchMedia(600); // small viewport

    const el = document.createElement("div");
    document.body.appendChild(el);
    const root = createRoot(el);

    const { LayoutEngine } = await import("../../src/layout/LayoutEngine");

    root.render(React.createElement(LayoutEngine));

    // Poll until style is applied
    let style = "";
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 0));
      const container = document.querySelector("[data-layout-container]") as HTMLElement | null;
      style = container?.getAttribute("style") || "";
      if (style.includes("grid-template-columns: 1fr")) break;
    }

    expect(style).toContain("grid-template-columns: 1fr");
  });
});

