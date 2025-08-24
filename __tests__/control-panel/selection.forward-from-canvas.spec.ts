/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { handlers as selectHandlers } from "../../plugins/canvas-component/symphonies/select/select.symphony";

describe("Canvas selection forwards to Control Panel", () => {
  it("calls conductor.play for control.panel.selection.show when canvas component is selected", () => {
    const playMock = vi.fn();
    const ctx = {
      conductor: { play: playMock }
    };

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
    const ctx = {}; // no conductor
    const selectionData = { id: "rx-node-abc123" };

    // Should not throw
    expect(() => {
      selectHandlers.notifyUi(selectionData, ctx);
    }).not.toThrow();
  });
});
