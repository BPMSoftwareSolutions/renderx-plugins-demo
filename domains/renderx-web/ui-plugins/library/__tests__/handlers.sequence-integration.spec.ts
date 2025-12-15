import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock storage utilities
vi.mock("../src/utils/storage.utils", () => ({
  loadCustomComponents: vi.fn(() => [])
}));

import { handlers } from "../src/symphonies/load.symphony";
import { loadCustomComponents } from "../src/utils/storage.utils";

declare global {
  var window: any;
}

describe("library.handlers - Two-Beat Sequence Integration", () => {
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
      error: null,
      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    global.window = global.window || {};
    global.window.RenderX = {};
    vi.clearAllMocks();
    (loadCustomComponents as any).mockReturnValue([]);
  });

  it("REAL SCENARIO: callback flows from loadComponents beat to notifyUi beat via ctx.payload", async () => {
    // Setup: Mock inventory with sample components
    const inventoryComponents = [
      { metadata: { type: "button", name: "Button" }, ui: {} }
    ];
    global.window.RenderX.inventory = {
      async listComponents() {
        return inventoryComponents;
      },
    };

    // Simulate the two-beat sequence flow with shared ctx.payload
    const _ctx: any = { payload: {} };
    const callbackSpy = vi.fn();

    // BEAT 1: loadComponents
    // In the real sequence, data comes from EventRouter.publish with the callback
    const beat1Data = { onComponentsLoaded: callbackSpy };
    const beat1Result = await handlers.loadComponents(beat1Data, ctx);

    // Verify beat 1 loaded components into payload
    expect(beat1Result).toMatchObject({ count: 1 });
    expect(ctx.payload.components).toHaveLength(1);
    expect(ctx.payload.components[0].name).toBe("Button");

    // BEAT 2: notifyUi
    // In the real sequence, data is a DIFFERENT object (without the callback)
    // The callback should be preserved in ctx.payload from beat 1
    const beat2Data = {}; // No callback here!
    handlers.notifyUi(beat2Data, ctx);

    // VERIFY: The callback should have been invoked with the components
    expect(callbackSpy).toHaveBeenCalledTimes(1);
    expect(callbackSpy).toHaveBeenCalledWith(ctx.payload.components);
  });

  it("REAL SCENARIO: callback is preserved in ctx.payload after loadComponents", async () => {
    const inventoryComponents = [
      { metadata: { type: "button", name: "Button" }, ui: {} }
    ];
    global.window.RenderX.inventory = {
      async listComponents() {
        return inventoryComponents;
      },
    };

    const _ctx: any = { payload: {} };
    const callbackSpy = vi.fn();

    // Beat 1: loadComponents should preserve callback in ctx.payload
    await handlers.loadComponents({ onComponentsLoaded: callbackSpy }, ctx);

    // Verify callback is in ctx.payload for beat 2 to access
    expect(typeof ctx.payload.onComponentsLoaded).toBe("function");
    expect(ctx.payload.onComponentsLoaded).toBe(callbackSpy);
  });
});

