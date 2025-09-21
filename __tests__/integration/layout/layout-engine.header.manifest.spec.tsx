/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";

// Stub PanelSlot to avoid plugin-manifest dependency in this unit test
vi.mock("../../src/ui/shared/PanelSlot", () => ({
  PanelSlot: (props: any) =>
    React.createElement("div", { "data-panel-slot": props.slot }),
}));

function mockFetchLayoutManifestWithHeader() {
  const manifest = {
    version: "1.0.0",
    layout: {
      kind: "grid",
      columns: ["320px", "1fr", "360px"],
      rows: ["48px", "1fr"],
      areas: [
        ["headerLeft", "headerCenter", "headerRight"],
        ["library", "canvas", "controlPanel"],
      ],
      gap: { column: "0", row: "0" },
    },
    slots: [
      { name: "headerLeft", constraints: { minHeight: 40 } },
      { name: "headerCenter", constraints: { minHeight: 40 } },
      { name: "headerRight", constraints: { minHeight: 40 } },
      { name: "library", constraints: { minWidth: 280 } },
      { name: "canvas", constraints: { minWidth: 480 } },
      { name: "controlPanel", constraints: { minWidth: 320 } },
    ],
  };
  vi.spyOn(globalThis, "fetch").mockImplementation((input: any) => {
    const url = String(input || "");
    if (url.endsWith("/layout-manifest.json")) {
      return Promise.resolve(
        new Response(JSON.stringify(manifest), { status: 200 })
      ) as any;
    }
    return Promise.resolve(new Response("not found", { status: 404 })) as any;
  });
}

describe("LayoutEngine default manifest includes header row with three slots (TDD)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders 6 slot wrappers including headerLeft/Center/Right", async () => {
    // Ensure fresh module state and stub fetch for this test
    vi.resetModules();
    mockFetchLayoutManifestWithHeader();

    const el = document.createElement("div");
    document.body.appendChild(el);
    const root = createRoot(el);

    const { LayoutEngine } = await import("../../src/domain/layout/LayoutEngine");

    // Act: render the engine
    root.render(React.createElement(LayoutEngine));

    // Poll until rendered or timeout
    const tryFind = () => Array.from(document.querySelectorAll("[data-slot]"));
    for (let i = 0; i < 20 && tryFind().length < 6; i++) {
      await new Promise((r) => setTimeout(r, 0));
    }

    const wrappers = tryFind();
    const names = wrappers.map((el) => el.getAttribute("data-slot"));

    expect(wrappers.length).toBe(6);
    expect(names).toContain("headerLeft");
    expect(names).toContain("headerCenter");
    expect(names).toContain("headerRight");
    expect(names).toContain("library");
    expect(names).toContain("canvas");
    expect(names).toContain("controlPanel");
  }, 30000); // Integration test timeout
});
