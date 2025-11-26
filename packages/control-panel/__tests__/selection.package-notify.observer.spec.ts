/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { handlers as packageSelectionHandlers } from "../src/symphonies/selection/selection.symphony";

describe("Control Panel (package) selection notify -> EventRouter", () => {
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
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  let mockEventRouter: any;
  let originalRenderX: any;

  beforeEach(() => {
    // Setup EventRouter mock
    mockEventRouter = {
      publish: vi.fn(),
    };

    // Store original globalThis.RenderX
    originalRenderX = (globalThis as any).RenderX;

    // Set up mock EventRouter on globalThis
    (globalThis as any).RenderX = {
      EventRouter: mockEventRouter,
    };
  });

  afterEach(() => {
    // Restore original globalThis.RenderX
    (globalThis as any).RenderX = originalRenderX;
  });

  it("publishes control.panel.selection.updated via EventRouter when notifyUi runs", () => {
    const selectionModel = {
      header: { type: "button", id: "rx-node-test" },
      content: { content: "Click me", variant: "primary", size: "medium", disabled: false },
      layout: { x: 50, y: 30, width: 120, height: 40 },
      styling: { "bg-color": "#007acc", "text-color": "#ffffff" },
      classes: ["rx-comp", "rx-button"],
    };

    const _ctx: any = {
      payload: { selectionModel },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
      },
    };

    packageSelectionHandlers.notifyUi({}, ctx);

    expect(mockEventRouter.publish).toHaveBeenCalledTimes(1);
    expect(mockEventRouter.publish).toHaveBeenCalledWith(
      'control.panel.selection.updated',
      selectionModel
    );
  });
});

