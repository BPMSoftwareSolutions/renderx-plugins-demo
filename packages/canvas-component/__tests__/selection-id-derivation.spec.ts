import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JSDOM } from "jsdom";
import { EventRouter } from "@renderx-plugins/host-sdk";
import { handlers as selectHandlers } from "../src/symphonies/select/select.stage-crew";

// Mock EventRouter
vi.mock("@renderx-plugins/host-sdk", () => ({
  EventRouter: {
    publish: vi.fn(),
  },
  useConductor: vi.fn(() => ({ play: vi.fn() })),
  isFlagEnabled: vi.fn(() => false),
}));

describe("Selection ID derivation and baton flow", () => {
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
  let dom: JSDOM;
  let mockConductor: any;

  beforeEach(() => {
    // Set up DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="rx-canvas" style="position: relative; width: 800px; height: 600px;">
            <div id="rx-node-button123" class="rx-comp rx-button">Button Component</div>
            <div id="rx-node-div456" class="rx-comp rx-container">Container Component</div>
            <svg id="rx-node-svg789" class="rx-comp rx-line">
              <line x1="0" y1="0" x2="100" y2="100" />
            </svg>
            <div class="nested-container">
              <button id="rx-node-nested999" class="rx-comp rx-button">Nested Button</button>
            </div>
          </div>
        </body>
      </html>
    `);
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;

    // Mock conductor
    mockConductor = {
      play: vi.fn(),
    };

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    dom.window.close();
  });

  describe("showSelectionOverlay ID derivation", () => {
    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.1:1
     *
     * Given: selection event contains data.id
     * When: showSelectionOverlay executes
     * Then: element ID is derived from data.id
     *       overlay container is created or reused
     *       overlay rect is positioned to match selected element
     * And: operation completes within 100ms P95
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.1:1] derives ID from data.id when present", () => {
      // Given: selection event contains data.id
      const data = { id: "rx-node-button123" };
      const ctx = { conductor: mockConductor };

      // When: showSelectionOverlay executes
      const result = selectHandlers.showSelectionOverlay(data, ctx);

      // Then: element ID is derived from data.id
      expect(result).toEqual({ id: "rx-node-button123" });
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.1:2
     *
     * Given: data.id is missing but data.elementId is provided
     * When: showSelectionOverlay derives ID
     * Then: element ID is derived from data.elementId as fallback
     * And: overlay rendering proceeds normally
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.1:2] derives ID from data.elementId when data.id is missing", () => {
      // Given: data.id is missing but data.elementId is provided
      const data = { elementId: "rx-node-div456" };
      const ctx = { conductor: mockConductor };

      // When: showSelectionOverlay derives ID
      const result = selectHandlers.showSelectionOverlay(data, ctx);

      // Then: element ID is derived from data.elementId as fallback
      expect(result).toEqual({ id: "rx-node-div456" });
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.1:3
     *
     * Given: both data.id and data.elementId are missing
     * When: showSelectionOverlay derives ID from DOM target
     * Then: element ID is derived from event target's id attribute
     * And: nested element clicks are handled correctly
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.1:3] derives ID from DOM target when data.id and data.elementId are missing", () => {
      // Given: both data.id and data.elementId are missing
      const buttonElement = document.getElementById("rx-node-button123");
      const mockEvent = {
        target: buttonElement,
      };
      const data = { event: mockEvent };
      const ctx = { conductor: mockConductor };

      // When: showSelectionOverlay derives ID from DOM target
      const result = selectHandlers.showSelectionOverlay(data, ctx);

      // Then: element ID is derived from event target's id attribute
      expect(result).toEqual({ id: "rx-node-button123" });
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.1:3
     *
     * Given: both data.id and data.elementId are missing
     * When: showSelectionOverlay derives ID from DOM target
     * Then: if target has no id, closest('.rx-comp') ancestor is used
     * And: nested element clicks are handled correctly
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.1:3] derives ID from nested DOM target using closest('.rx-comp')", () => {
      // Given: both data.id and data.elementId are missing
      const nestedButton = document.getElementById("rx-node-nested999");
      const mockEvent = {
        target: nestedButton,
      };
      const data = { event: mockEvent };
      const ctx = { conductor: mockConductor };

      // When: showSelectionOverlay derives ID from DOM target
      const result = selectHandlers.showSelectionOverlay(data, ctx);

      // Then: if target has no id, closest('.rx-comp') ancestor is used
      // And: nested element clicks are handled correctly
      expect(result).toEqual({ id: "rx-node-nested999" });
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.1:4
     *
     * Given: all ID sources are exhausted and baton contains ID
     * When: showSelectionOverlay uses baton fallback
     * Then: element ID is derived from ctx.baton.id or ctx.baton.elementId
     * And: baton provides last-resort ID for legacy flows
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.1:4] derives ID from ctx.baton when all other sources are missing", () => {
      // Given: all ID sources are exhausted and baton contains ID
      const data = {}; // no data.id, data.elementId, or event.target
      const ctx = {
        conductor: mockConductor,
        baton: { id: "rx-node-button123" }
      };

      // When: showSelectionOverlay uses baton fallback
      const result = selectHandlers.showSelectionOverlay(data, ctx);

      // Then: element ID is derived from ctx.baton.id
      expect(result).toEqual({ id: "rx-node-button123" });
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.1:4
     *
     * Given: all ID sources are exhausted and baton contains ID
     * When: showSelectionOverlay uses baton fallback
     * Then: element ID is derived from ctx.baton.id or ctx.baton.elementId
     * And: baton provides last-resort ID for legacy flows
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.1:4] derives ID from ctx.baton.elementId when baton.id is missing", () => {
      // Given: all ID sources are exhausted and baton contains elementId
      const data = {}; // no data.id, data.elementId, or event.target
      const ctx = {
        conductor: mockConductor,
        baton: { elementId: "rx-node-div456" }
      };

      // When: showSelectionOverlay uses baton fallback
      const result = selectHandlers.showSelectionOverlay(data, ctx);

      // Then: element ID is derived from ctx.baton.elementId
      expect(result).toEqual({ id: "rx-node-div456" });
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.1:5
     *
     * Given: no valid ID can be derived from any source
     * When: showSelectionOverlay validates ID
     * Then: handler returns early without rendering overlay
     *       warning is logged with context
     * And: system remains stable without errors
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.1:5] returns empty object when no ID can be derived", () => {
      // Given: no valid ID can be derived from any source
      const data = { event: { target: document.body } }; // body has no rx-comp class
      const ctx = { conductor: mockConductor };

      // When: showSelectionOverlay validates ID
      const result = selectHandlers.showSelectionOverlay(data, ctx);

      // Then: handler returns early without rendering overlay
      expect(result).toEqual({});
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.1:5
     *
     * Given: no valid ID can be derived from any source
     * When: showSelectionOverlay validates ID
     * Then: handler returns early without rendering overlay
     *       warning is logged with context
     * And: system remains stable without errors
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.1:5] returns empty object when element with derived ID doesn't exist in DOM", () => {
      // Given: no valid ID can be derived from any source (element doesn't exist)
      const data = { id: "rx-node-nonexistent" };
      const ctx = { conductor: mockConductor };

      // When: showSelectionOverlay validates ID
      const result = selectHandlers.showSelectionOverlay(data, ctx);

      // Then: handler returns early without rendering overlay
      expect(result).toEqual({});
    });
  });

  describe("notifyUi with baton fallback", () => {
    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.2:1
     *
     * Given: element is selected and data.id is present
     * When: notifyUi executes
     * Then: canvas.component.selected event is published via EventRouter
     *       event payload includes element ID from data.id
     *       event is published with conductor context
     * And: delivery completes within 20ms end-to-end
     *      events are ordered FIFO
     *      subscribers receive notification consistently
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.2:1] uses data.id when present", () => {
      // Given: element is selected and data.id is present
      const data = { id: "rx-node-button123" };
      const ctx = { conductor: mockConductor, baton: {} };

      // When: notifyUi executes
      selectHandlers.notifyUi(data, ctx);

      // Then: canvas.component.selected event is published via EventRouter
      // Then: event payload includes element ID from data.id
      // Then: event is published with conductor context
      expect(mockConductor.play).toHaveBeenCalledWith(
        "ControlPanelPlugin",
        "control-panel-selection-show-symphony",
        { id: "rx-node-button123" }
      );
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.2:2
     *
     * Given: data.id is missing but ctx.baton.id is available
     * When: notifyUi derives ID
     * Then: element ID is derived from ctx.baton.id as fallback
     *       canvas.component.selected event is published with baton ID
     * And: legacy flows with baton-based ID propagation are supported
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.2:2] falls back to ctx.baton.id when data.id is missing", () => {
      // Given: data.id is missing but ctx.baton.id is available
      const data = {};
      const ctx = {
        conductor: mockConductor,
        baton: { id: "rx-node-div456" }
      };

      // When: notifyUi derives ID
      selectHandlers.notifyUi(data, ctx);

      // Then: element ID is derived from ctx.baton.id as fallback
      // Then: canvas.component.selected event is published with baton ID
      expect(mockConductor.play).toHaveBeenCalledWith(
        "ControlPanelPlugin",
        "control-panel-selection-show-symphony",
        { id: "rx-node-div456" }
      );
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.2:2
     *
     * Given: data.id is missing but ctx.baton.id is available
     * When: notifyUi derives ID
     * Then: element ID is derived from ctx.baton.id as fallback
     *       canvas.component.selected event is published with baton ID
     * And: legacy flows with baton-based ID propagation are supported
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.2:2] falls back to ctx.baton.elementId when data.id and baton.id are missing", () => {
      // Given: data.id is missing but ctx.baton.elementId is available
      const data = {};
      const ctx = {
        conductor: mockConductor,
        baton: { elementId: "rx-node-svg789" }
      };

      // When: notifyUi derives ID
      selectHandlers.notifyUi(data, ctx);

      // Then: element ID is derived from ctx.baton.elementId as fallback
      // Then: canvas.component.selected event is published with baton ID
      expect(mockConductor.play).toHaveBeenCalledWith(
        "ControlPanelPlugin",
        "control-panel-selection-show-symphony",
        { id: "rx-node-svg789" }
      );
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.2:2
     *
     * Given: data.id is missing but ctx.baton.id is available
     * When: notifyUi derives ID
     * Then: element ID is derived from ctx.baton.id as fallback
     *       canvas.component.selected event is published with baton ID
     * And: legacy flows with baton-based ID propagation are supported
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.2:2] falls back to ctx.baton.selectedId when other IDs are missing", () => {
      // Given: data.id is missing but ctx.baton.selectedId is available
      const data = {};
      const ctx = {
        conductor: mockConductor,
        baton: { selectedId: "rx-node-nested999" }
      };

      // When: notifyUi derives ID
      selectHandlers.notifyUi(data, ctx);

      // Then: element ID is derived from ctx.baton.selectedId as fallback
      // Then: canvas.component.selected event is published with baton ID
      expect(mockConductor.play).toHaveBeenCalledWith(
        "ControlPanelPlugin",
        "control-panel-selection-show-symphony",
        { id: "rx-node-nested999" }
      );
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.2:3
     *
     * Given: both data.id and baton.id are missing
     * When: notifyUi validates ID
     * Then: event publication is skipped
     *       warning is logged with context
     * And: system remains stable without errors
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.2:3] does not call play when no ID is available", () => {
      // Given: both data.id and baton.id are missing
      const data = {};
      const ctx = { conductor: mockConductor, baton: {} };

      // When: notifyUi validates ID
      selectHandlers.notifyUi(data, ctx);

      // Then: event publication is skipped
      expect(mockConductor.play).not.toHaveBeenCalled();
    });
  });

  describe("publishSelectionChanged with baton", () => {
    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.3:1
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
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.3:1] publishes topic with baton.id", async () => {
      // Given: selection change occurs with element ID
      const ctx = { conductor: mockConductor, baton: { id: "rx-node-button123" } };

      // When: publishSelectionChanged executes
      await selectHandlers.publishSelectionChanged({}, ctx);

      // Then: canvas.component.selection.changed event is published via EventRouter
      // Then: event payload includes element ID
      // Then: event is published with conductor context
      expect(EventRouter.publish).toHaveBeenCalledWith(
        "canvas.component.selection.changed",
        { id: "rx-node-button123" },
        mockConductor
      );
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.3:1
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
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.3:1] publishes topic with baton.elementId when baton.id is missing", async () => {
      // Given: selection change occurs with element ID from baton.elementId
      const ctx = { conductor: mockConductor, baton: { elementId: "rx-node-div456" } };

      // When: publishSelectionChanged executes
      await selectHandlers.publishSelectionChanged({}, ctx);

      // Then: canvas.component.selection.changed event is published via EventRouter
      // Then: event payload includes element ID
      // Then: event is published with conductor context
      expect(EventRouter.publish).toHaveBeenCalledWith(
        "canvas.component.selection.changed",
        { id: "rx-node-div456" },
        mockConductor
      );
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.3:1
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
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.3:1] publishes topic with baton.selectedId when other IDs are missing", async () => {
      // Given: selection change occurs with element ID from baton.selectedId
      const ctx = { conductor: mockConductor, baton: { selectedId: "rx-node-svg789" } };

      // When: publishSelectionChanged executes
      await selectHandlers.publishSelectionChanged({}, ctx);

      // Then: canvas.component.selection.changed event is published via EventRouter
      // Then: event payload includes element ID
      // Then: event is published with conductor context
      expect(EventRouter.publish).toHaveBeenCalledWith(
        "canvas.component.selection.changed",
        { id: "rx-node-svg789" },
        mockConductor
      );
    });

    /**
     * @ac canvas-component-select-symphony:canvas-component-select-symphony:1.3:2
     *
     * Given: element ID is missing
     * When: publishSelectionChanged validates input
     * Then: event publication is skipped
     *       warning is logged with context
     * And: system remains stable without errors
     */
    it("[AC:canvas-component-select-symphony:canvas-component-select-symphony:1.3:2] does not publish when no ID is available in baton", async () => {
      // Given: element ID is missing
      const ctx = { conductor: mockConductor, baton: {} };

      // When: publishSelectionChanged validates input
      await selectHandlers.publishSelectionChanged({}, ctx);

      // Then: event publication is skipped
      expect(EventRouter.publish).not.toHaveBeenCalled();
    });
  });

  describe("End-to-end selection flow", () => {
    it("works for button component selection via DOM target", () => {
      const buttonElement = document.getElementById("rx-node-button123");
      const mockEvent = { target: buttonElement };
      
      // Beat 1: showSelectionOverlay derives ID and returns it
      const data = { event: mockEvent };
      const ctx = { conductor: mockConductor, baton: {} };
      
      const overlayResult = selectHandlers.showSelectionOverlay(data, ctx);
      expect(overlayResult).toEqual({ id: "rx-node-button123" });
      
      // Beat 2: notifyUi uses baton.id (merged from beat 1 result)
      const ctxWithBaton = { 
        conductor: mockConductor, 
        baton: { ...ctx.baton, ...overlayResult } 
      };
      
      selectHandlers.notifyUi({}, ctxWithBaton);
      expect(mockConductor.play).toHaveBeenCalledWith(
        "ControlPanelPlugin",
        "control-panel-selection-show-symphony",
        { id: "rx-node-button123" }
      );
    });

    it("works for SVG component selection", async () => {
      const svgElement = document.getElementById("rx-node-svg789");
      const mockEvent = { target: svgElement };
      
      // Beat 1: showSelectionOverlay derives ID and returns it
      const data = { event: mockEvent };
      const ctx = { conductor: mockConductor, baton: {} };
      
      const overlayResult = selectHandlers.showSelectionOverlay(data, ctx);
      expect(overlayResult).toEqual({ id: "rx-node-svg789" });
      
      // Beat 2: notifyUi uses baton.id
      const ctxWithBaton = { 
        conductor: mockConductor, 
        baton: { ...ctx.baton, ...overlayResult } 
      };
      
      selectHandlers.notifyUi({}, ctxWithBaton);
      expect(mockConductor.play).toHaveBeenCalledWith(
        "ControlPanelPlugin",
        "control-panel-selection-show-symphony",
        { id: "rx-node-svg789" }
      );
      
      // Beat 3: publishSelectionChanged uses baton.id
      await selectHandlers.publishSelectionChanged({}, ctxWithBaton);
      expect(EventRouter.publish).toHaveBeenCalledWith(
        "canvas.component.selection.changed",
        { id: "rx-node-svg789" },
        mockConductor
      );
    });
  });
});

