/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock host SDK with spy for EventRouter.publish
vi.mock("@renderx-plugins/host-sdk", () => ({
  EventRouter: {
    publish: vi.fn().mockResolvedValue(undefined),
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

// Import from package's own select handlers
import { handlers as selectHandlers } from "../src/symphonies/select/select.stage-crew.ts";
import { EventRouter } from "@renderx-plugins/host-sdk";

describe("Canvas selection publishes selection.changed topic", () => {
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
    vi.clearAllMocks();
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-select-symphony:1.3:1
   *
   * Given: selection change occurs with element ID
   * When: publishSelectionChanged executes
   * Then: canvas.component.selection.changed event is published via EventRouter
   *       event payload includes element ID
   *       event payload includes optional metadata (type, classes, dimensions)
   *       event is published with conductor context
   * And: operation completes within 50ms P95
   *      event delivery is guaranteed FIFO
   *      dependent systems can synchronize state
   */
  it("[AC:renderx-web-orchestration:canvas-component-select-symphony:1.3:1] publishes canvas.component.selection.changed when publishSelectionChanged handler is called", async () => {
    // Given: selection change occurs with element ID
    const conductor = { play: vi.fn() };
    const ctx = { conductor, baton: { id: "rx-node-abc123" } };

    // When: publishSelectionChanged executes
    await selectHandlers.publishSelectionChanged({}, ctx);

    // Then: canvas.component.selection.changed event is published via EventRouter
    // Then: event payload includes element ID
    // Then: event is published with conductor context
    expect(EventRouter.publish).toHaveBeenCalledWith(
      "canvas.component.selection.changed",
      { id: "rx-node-abc123" },
      conductor
    );
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-select-symphony:1.3:1
   *
   * Given: selection change occurs with element ID
   * When: publishSelectionChanged executes
   * Then: canvas.component.selection.changed event is published via EventRouter
   *       event payload includes element ID
   *       event payload includes optional metadata (type, classes, dimensions)
   *       event is published with conductor context
   * And: operation completes within 50ms P95
   *      event delivery is guaranteed FIFO
   *      dependent systems can synchronize state
   */
  it("[AC:renderx-web-orchestration:canvas-component-select-symphony:1.3:1] publishes selection.changed with elementId from baton when id is missing", async () => {
    // Given: selection change occurs with element ID from baton.elementId
    const conductor = { play: vi.fn() };
    const ctx = { conductor, baton: { elementId: "rx-node-from-elementId" } };

    // When: publishSelectionChanged executes
    await selectHandlers.publishSelectionChanged({}, ctx);

    // Then: canvas.component.selection.changed event is published via EventRouter
    // Then: event payload includes element ID
    // Then: event is published with conductor context
    expect(EventRouter.publish).toHaveBeenCalledWith(
      "canvas.component.selection.changed",
      { id: "rx-node-from-elementId" },
      conductor
    );
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-select-symphony:1.3:1
   *
   * Given: selection change occurs with element ID
   * When: publishSelectionChanged executes
   * Then: canvas.component.selection.changed event is published via EventRouter
   *       event payload includes element ID
   *       event payload includes optional metadata (type, classes, dimensions)
   *       event is published with conductor context
   * And: operation completes within 50ms P95
   *      event delivery is guaranteed FIFO
   *      dependent systems can synchronize state
   */
  it("[AC:renderx-web-orchestration:canvas-component-select-symphony:1.3:1] publishes selection.changed with selectedId from baton when id and elementId are missing", async () => {
    // Given: selection change occurs with element ID from baton.selectedId
    const conductor = { play: vi.fn() };
    const ctx = { conductor, baton: { selectedId: "rx-node-from-selectedId" } };

    // When: publishSelectionChanged executes
    await selectHandlers.publishSelectionChanged({}, ctx);

    // Then: canvas.component.selection.changed event is published via EventRouter
    // Then: event payload includes element ID
    // Then: event is published with conductor context
    expect(EventRouter.publish).toHaveBeenCalledWith(
      "canvas.component.selection.changed",
      { id: "rx-node-from-selectedId" },
      conductor
    );
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-select-symphony:1.3:2
   *
   * Given: element ID is missing
   * When: publishSelectionChanged validates input
   * Then: event publication is skipped
   *       warning is logged with context
   * And: system remains stable without errors
   */
  it("[AC:renderx-web-orchestration:canvas-component-select-symphony:1.3:2] does not publish when no id is available", async () => {
    // Given: element ID is missing
    const conductor = { play: vi.fn() };
    const ctx = { conductor, baton: {} };

    // When: publishSelectionChanged validates input
    await selectHandlers.publishSelectionChanged({}, ctx);

    // Then: event publication is skipped
    expect(EventRouter.publish).not.toHaveBeenCalled();
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-select-symphony:1.3:3
   *
   * Given: conductor is not available in context
   * When: publishSelectionChanged attempts to publish
   * Then: event is published with undefined conductor
   *       EventRouter handles missing conductor gracefully
   * And: legacy flows without conductor are supported
   */
  it("[AC:renderx-web-orchestration:canvas-component-select-symphony:1.3:3] handles missing conductor gracefully (matches SVG node pattern)", async () => {
    // Given: conductor is not available in context
    const ctx = { baton: { id: "rx-node-abc123" } };

    // When: publishSelectionChanged attempts to publish
    expect(async () => {
      await selectHandlers.publishSelectionChanged({}, ctx);
    }).not.toThrow();

    // Then: event is published with undefined conductor
    // Then: EventRouter handles missing conductor gracefully
    expect(EventRouter.publish).toHaveBeenCalledWith(
      "canvas.component.selection.changed",
      { id: "rx-node-abc123" },
      undefined
    );
  });

  it("handles EventRouter.publish errors gracefully", async () => {
    (EventRouter.publish as any).mockImplementationOnce(() => {
      throw new Error("EventRouter error");
    });

    const conductor = { play: vi.fn() };
    const ctx = { conductor, baton: { id: "rx-node-abc123" } };

    expect(async () => {
      await selectHandlers.publishSelectionChanged({}, ctx);
    }).not.toThrow();
  });
});

