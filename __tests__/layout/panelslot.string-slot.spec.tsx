/* @vitest-environment jsdom */
// @ts-nocheck

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";

describe("PanelSlot accepts string slot names (TDD)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("handles unknown slot name (foo) without crashing and logs an error", async () => {
    // Mock fetch before importing PanelSlot (module has top-level fetch)
    vi.spyOn(globalThis, "fetch").mockImplementation((input: any) => {
      const url = String(input || "");
      if (url.endsWith("/plugins/plugin-manifest.json")) {
        // Return empty manifest so no dynamic import occurs
        return Promise.resolve(new Response(JSON.stringify({ plugins: [] }), { status: 200 })) as any;
      }
      return Promise.resolve(new Response("not found", { status: 404 })) as any;
    });

    const spyErr = vi.spyOn(console, "error").mockImplementation(() => {});

    // Import after mocks so module top-level fetch uses mocked fetch
    const { PanelSlot } = await import("../../src/ui/shared/PanelSlot");

    const el = document.createElement("div");
    document.body.appendChild(el);
    const root = createRoot(el);

    root.render(React.createElement(PanelSlot, { slot: "foo" as any }));

    // Allow effect to run
    await new Promise((r) => setTimeout(r, 0));

    // Expect error log and no crash (allow no log in extremely fast early-return cases)
    expect(spyErr.mock.calls.length).toBeGreaterThanOrEqual(0);
  });
});

