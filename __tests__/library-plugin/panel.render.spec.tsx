import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import ReactDOM from "react-dom/client";

// Mock Host SDK before importing component
const sampleList = [
  {
    id: "json-button",
    name: "Button",
    template: { tag: "button", attributes: { "data-category": "basic" } },
    metadata: { type: "button", name: "Button" },
  },
];

vi.mock("@renderx-plugins/host-sdk", () => {
  return {
    EventRouter: {
      publish: vi.fn(async (topic: string, payload: any) => {
        if (topic === "library.load.requested") {
          payload?.onComponentsLoaded?.(sampleList);
        }
      }),
    },
    useConductor: () => ({ play: vi.fn() }),
    resolveInteraction: vi.fn(() => ({ pluginId: "@renderx-plugins/library", sequenceId: "library-load" })),
    isFlagEnabled: () => false,
  };
});

import { LibraryPanel } from "packages/renderx-plugin-library/src/ui/LibraryPanel";

function nextTick() {
  return new Promise((r) => setTimeout(r, 0));
}

describe("@renderx-plugins/library – LibraryPanel (host wrapper)", () => {
  let container: HTMLDivElement;
  let root: ReactDOM.Root;

  beforeEach(() => {
    if (typeof document === "undefined") return;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    if (!root || typeof document === "undefined") return;
    root.unmount?.();
    document.body.removeChild(container);
  });

  (typeof document === "undefined" ? it.skip : it)("renders header and items via EventRouter publish", async () => {
    root.render(React.createElement(LibraryPanel));
    await nextTick();

    const text = container.textContent || "";
    expect(text).toContain("Component Library");
    expect(text).toContain("Basic Components");
    expect(text).toContain("Button");
  });
});

