/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@renderx-plugins/host-sdk", () => ({
  resolveInteraction: (key: string) => {
    if (key === "canvas.component.select") {
      return {
        pluginId: "CanvasComponentPlugin",
        sequenceId: "canvas-component-select-symphony",
      };
    }
    return { pluginId: "noop", sequenceId: key } as any;
  },
  EventRouter: {
    publish: vi.fn().mockResolvedValue(undefined),
  },
  useConductor: () => ({ play: vi.fn() }),
}));

import { setupHostClickToSelectLegacy } from "./helpers/host-click-select";

describe("Host-like click-to-select harness forwards to canvas.component.select", () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null,`n      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  let dispose: undefined | (() => void);

  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas"><button id="b1" class="rx-comp rx-button">Button</button></div>';
  });

  afterEach(() => {
    try { dispose?.(); } catch {}
    dispose = undefined;
  });

  it("clicking an rx-comp element triggers conductor.play with the select sequence", () => {
    const play = vi.fn();
    const getConductor = () => ({ play });

    dispose = setupHostClickToSelectLegacy(getConductor);

    document.getElementById("b1")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(play).toHaveBeenCalledWith(
      "CanvasComponentPlugin",
      "canvas-component-select-symphony",
      { id: "b1" }
    );
  });
});


