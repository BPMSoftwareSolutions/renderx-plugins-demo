/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";

// Stub PanelSlot to avoid plugin-manifest dependency in this unit test
vi.mock("../../src/components/PanelSlot", () => ({
  PanelSlot: (props: any) => React.createElement("div", { "data-panel-slot": props.slot })
}));

function mockFetchLayoutManifest() {
  const manifest = {
    version: "1.0.0",
    layout: {
      kind: "grid",
      columns: ["320px", "1fr", "360px"],
      rows: ["1fr"],
      areas: [["library", "canvas", "controlPanel"]],
      gap: { column: "0", row: "0" }
    },
    slots: [
      { name: "library", constraints: { minWidth: 280 } },
      { name: "canvas", constraints: { minWidth: 480 } },
      { name: "controlPanel", constraints: { minWidth: 320 } }
    ]
  };
  vi.spyOn(globalThis, "fetch").mockImplementation((input: any) => {
    const url = String(input || "");
    if (url.endsWith("/layout-manifest.json")) {
      return Promise.resolve(new Response(JSON.stringify(manifest), { status: 200 })) as any;
    }
    // let other fetches fall through with a basic 404 to avoid masking missing mocks
    return Promise.resolve(new Response("not found", { status: 404 })) as any;
  });
}

describe("LayoutEngine renders slots dynamically from layout-manifest (TDD)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads layout-manifest and mounts PanelSlot per area", async () => {
    mockFetchLayoutManifest();

    const el = document.createElement("div");
    document.body.appendChild(el);
    const root = createRoot(el);

    const { LayoutEngine } = await import("../../src/layout/LayoutEngine");

    // Act: render the new engine
    root.render(React.createElement(LayoutEngine));

    // Poll until rendered or timeout
    const tryFind = () => Array.from(document.querySelectorAll('[data-slot]'));
    for (let i = 0; i < 10 && tryFind().length < 3; i++) {
      await new Promise((r) => setTimeout(r, 0));
    }

    // Assert placeholders: expect three slot containers by data-slot attribute
    expect(tryFind().length).toBe(3);
  });
});

