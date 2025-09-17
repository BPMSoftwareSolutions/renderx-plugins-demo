import { describe, it, expect } from "vitest";
import { resolveInteraction } from "@renderx-plugins/host-sdk";

describe("Control Panel interaction routing", () => {
  it("resolves control.panel.selection.show to ControlPanelPlugin", () => {
    const route = resolveInteraction("control.panel.selection.show");
    expect(route.pluginId).toBe("ControlPanelPlugin");
    expect(route.sequenceId).toBe("control-panel-selection-show-symphony");
  });

  it("resolves control.panel.classes.add to ControlPanelPlugin", () => {
    const route = resolveInteraction("control.panel.classes.add");
    expect(route.pluginId).toBe("ControlPanelPlugin");
    expect(route.sequenceId).toBe("control-panel-classes-add-symphony");
  });

  it("resolves control.panel.classes.remove to ControlPanelPlugin", () => {
    const route = resolveInteraction("control.panel.classes.remove");
    expect(route.pluginId).toBe("ControlPanelPlugin");
    expect(route.sequenceId).toBe("control-panel-classes-remove-symphony");
  });

  it("resolves control.panel.update to ControlPanelPlugin", () => {
    const route = resolveInteraction("control.panel.update");
    expect(route.pluginId).toBe("ControlPanelPlugin");
    expect(route.sequenceId).toBe("control-panel-update-symphony");
  });
});

