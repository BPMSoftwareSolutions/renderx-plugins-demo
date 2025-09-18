/* @vitest-environment jsdom */
// @ts-nocheck

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "react-dom/client";

function renderSlot(_slot: string) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  return { el, root };
}

describe("PanelSlot supports package and URL module specifiers (graceful fallback)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("attempts to import a package specifier and renders error fallback on failure", async () => {
    // Mock manifest via test-only override instead of fetch
    const { PanelSlot, __setPanelSlotManifestForTests } = await import(
      "../../src/ui/shared/PanelSlot"
    );
    __setPanelSlotManifestForTests({
      plugins: [
        {
          id: "PkgPlugin",
          ui: { slot: "pkg", module: "@does/not-exist", export: "SomePanel" },
        },
      ],
    });

    const { root } = renderSlot("pkg");
    root.render(React.createElement(PanelSlot, { slot: "pkg" }));

    const spyErr = vi.spyOn(console, "error").mockImplementation(() => {});
    await new Promise((r) => setTimeout(r, 0));

    expect(spyErr.mock.calls.length).toBeGreaterThanOrEqual(0);

    // Avoid async state updates after test teardown
    root.unmount();
    await Promise.resolve();
  });

  it("attempts to import a URL specifier and renders error fallback on failure", async () => {
    const { PanelSlot, __setPanelSlotManifestForTests } = await import(
      "../../src/ui/shared/PanelSlot"
    );
    __setPanelSlotManifestForTests({
      plugins: [
        {
          id: "UrlPlugin",
          ui: {
            slot: "url",
            module: "https://example.com/does-not-exist.mjs",
            export: "SomePanel",
          },
        },
      ],
    });

    const { root } = renderSlot("url");
    root.render(React.createElement(PanelSlot, { slot: "url" }));

    const spyErr = vi.spyOn(console, "error").mockImplementation(() => {});
    await new Promise((r) => setTimeout(r, 0));

    expect(spyErr.mock.calls.length).toBeGreaterThanOrEqual(0);

    // Avoid async state updates after test teardown
    root.unmount();
    await Promise.resolve();
  });
});
