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

import { LibraryPanel } from "../src/ui/LibraryPanel";

function nextTick() {
  return new Promise((r) => setTimeout(r, 0));
}

describe("LibraryPanel", () => {
  let container: HTMLDivElement;
  let root: ReactDOM.Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    document.body.removeChild(container);
  });

  it("renders header and items from inventory via EventRouter publish", async () => {
    root.render(React.createElement(LibraryPanel));
    await nextTick();

    const text = container.textContent || "";
    expect(text).toContain("Component Library");
    expect(text).toContain("Basic Components");
    expect(text).toContain("Button");
  });
});

