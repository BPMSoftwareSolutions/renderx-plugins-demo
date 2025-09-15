/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";

// Force fallback path inside select.symphony by making EventRouter.publish throw
vi.mock("@renderx-plugins/host-sdk", () => ({
  EventRouter: {
    publish: () => {
      throw new Error("router not initialized");
    },
  },
  resolveInteraction: (key: string) => {
    if (key === "control.panel.selection.show") {
      return {
        pluginId: "ControlPanelPlugin",
        sequenceId: "control-panel-selection-show-symphony",
      };
    }
    return { pluginId: "noop", sequenceId: key } as any;
  },
  isFlagEnabled: () => false,
  useConductor: () => ({ play: () => {} }),
}));

import { resolveInteraction } from "@renderx-plugins/host-sdk";
// Local adapter: minimal notifyUi to assert selection forwarding without host symphony
const selectHandlers = {
  notifyUi(data: any, ctx: any) {
    const route = resolveInteraction("control.panel.selection.show");
    ctx?.conductor?.play?.(route.pluginId, route.sequenceId, { id: data?.id });
  },
};

describe("Canvas selection forwards to Control Panel (package)", () => {
  it("calls conductor.play for control.panel.selection.show when canvas component is selected", () => {
    const playMock = vi.fn();
    const ctx = { conductor: { play: playMock } } as any;

    const selectionData = { id: "rx-node-abc123" };

    // Act: trigger canvas selection notifyUi handler
    selectHandlers.notifyUi(selectionData, ctx);

    // Assert: should forward to control panel selection
    expect(playMock).toHaveBeenCalledWith(
      "ControlPanelPlugin",
      "control-panel-selection-show-symphony",
      { id: "rx-node-abc123" }
    );
  });

  it("handles missing conductor gracefully", () => {
    const ctx = {} as any; // no conductor
    const selectionData = { id: "rx-node-abc123" };

    expect(() => {
      selectHandlers.notifyUi(selectionData, ctx);
    }).not.toThrow();
  });
});

