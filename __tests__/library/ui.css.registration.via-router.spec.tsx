/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerCssForComponents } from "../../plugins/library/ui/LibraryPanel";
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

  it("publishes Control Panel CSS events for discovered classes", async () => {
    const publishSpy = vi.spyOn(EventRouter, "publish").mockResolvedValue(undefined as any);
    const fakeConductor: any = { play: vi.fn().mockResolvedValue({}) };

    await registerCssForComponents([mockJsonButton, mockJsonContainer] as any, fakeConductor);

    // Expect update then create for each class
    expect(publishSpy).toHaveBeenCalledWith(
      "control.panel.css.edit.requested",
      expect.objectContaining({ className: "rx-button", id: "rx-button" }),
      fakeConductor
    );
    expect(publishSpy).toHaveBeenCalledWith(
      "control.panel.css.create.requested",
      expect.objectContaining({ className: "rx-button", id: "rx-button" }),
      fakeConductor
    );
    expect(publishSpy).toHaveBeenCalledWith(
      "control.panel.css.edit.requested",
      expect.objectContaining({ className: "rx-container", id: "rx-container" }),
      fakeConductor
    );
    expect(publishSpy).toHaveBeenCalledWith(
      "control.panel.css.create.requested",
      expect.objectContaining({ className: "rx-container", id: "rx-container" }),
      fakeConductor
    );
  });
});

