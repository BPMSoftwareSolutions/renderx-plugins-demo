/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { LibraryPanel } from "@renderx-plugins/library";
import { EventRouter } from "@renderx-plugins/host-sdk";

// Minimal components with CSS content
const mockJsonButton = {
  metadata: { type: "button", name: "Button" },
  template: {
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { background: #09f; } .rx-button--primary { color: #fff; }",
  },
};

const mockJsonContainer = {
  metadata: { type: "container", name: "Container" },
  template: {
    classes: ["rx-comp", "rx-container"],
    css: ".rx-container { position: relative; }",
  },
};

describe("LibraryPanel CSS registration via router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("publishes Control Panel CSS events for discovered classes when inventory loads", async () => {
    const publishSpy = vi.spyOn(EventRouter, "publish").mockImplementation(async (topic: string, payload: any) => {
      if (topic === "library.load.requested") {
        payload?.onComponentsLoaded?.([mockJsonButton, mockJsonContainer]);
      }
      return undefined as any;
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(LibraryPanel));
    });

    // Expect update then create for each class
    expect(publishSpy).toHaveBeenCalledWith(
      "control.panel.css.edit.requested",
      expect.objectContaining({ className: "rx-button", id: "rx-button" }),
      expect.anything()
    );
    expect(publishSpy).toHaveBeenCalledWith(
      "control.panel.css.create.requested",
      expect.objectContaining({ className: "rx-button", id: "rx-button" }),
      expect.anything()
    );
    expect(publishSpy).toHaveBeenCalledWith(
      "control.panel.css.edit.requested",
      expect.objectContaining({ className: "rx-container", id: "rx-container" }),
      expect.anything()
    );
    expect(publishSpy).toHaveBeenCalledWith(
      "control.panel.css.create.requested",
      expect.objectContaining({ className: "rx-container", id: "rx-container" }),
      expect.anything()
    );

    root.unmount();
    document.body.removeChild(container);
  });
});

