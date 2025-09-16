/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { handlers as packageSelectionHandlers } from "../..//packages/control-panel/src/symphonies/selection/selection.symphony";
import { setSelectionObserver } from "../../packages/control-panel/src/state/observer.store";

describe("Control Panel (package) selection notify -> observer store", () => {
  beforeEach(() => {
    // ensure clean observer state
    setSelectionObserver(null);
  });
  afterEach(() => {
    setSelectionObserver(null);
  });

  it("calls the package observer store when notifyUi runs", () => {
    const observer = vi.fn();
    setSelectionObserver(observer);

    const selectionModel = {
      header: { type: "button", id: "rx-node-test" },
      content: { content: "Click me", variant: "primary", size: "medium", disabled: false },
      layout: { x: 50, y: 30, width: 120, height: 40 },
      styling: { "bg-color": "#007acc", "text-color": "#ffffff" },
      classes: ["rx-comp", "rx-button"],
    };

    const ctx: any = { payload: { selectionModel }, logger: { warn: vi.fn() } };

    packageSelectionHandlers.notifyUi({}, ctx);

    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith(selectionModel);
  });
});

