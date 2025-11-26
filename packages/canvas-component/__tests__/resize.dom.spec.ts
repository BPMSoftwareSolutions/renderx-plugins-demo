import { vi } from "vitest";
vi.mock("@renderx-plugins/host-sdk", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    // Ensure feature flags used by showSelectionOverlay are available
    isFlagEnabled: actual?.isFlagEnabled ?? (() => false),
    // Provide a test-safe resolveInteraction that never throws
    resolveInteraction: (key: string) => ({
      pluginId: "CanvasComponentPlugin",
      sequenceId: key,
    }),
    // Drive conductor directly in tests to avoid no-op host router.
    // We bypass the real routing and call the provided conductor directly
    // so resize.move events invoke the canvas-component resize handlers.
    EventRouter: {
      ...actual?.EventRouter,
      publish: (key: string, payload: any, conductor?: any) => {
        if (!conductor?.play) return;
        const route = { pluginId: "CanvasComponentPlugin", sequenceId: key };
        conductor.play(route.pluginId, route.sequenceId, payload);
      },
    },
  } as any;
});

/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers } from "../src/symphonies/create/create.symphony";
import { showSelectionOverlay } from "../src/symphonies/select/select.stage-crew";
import { handlers as resizeHandlers } from "../src/symphonies/resize/resize.stage-crew";

function makeTemplate() {
  return {
    tag: "div",
    text: "",
    classes: ["rx-comp", "rx-box"],
    css: ".rx-box { background: #eee; }",
    cssVariables: {},
    dimensions: { width: 100, height: 50 },
  };
}

function makeCtx() {
  return { payload: {} } as any;
}

function dispatchMouse(el: Element | Document, type: string, opts: any) {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, ...opts });
  (el as any).dispatchEvent(ev);
}

describe("canvas-component resize (DOM-only)", () => {
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
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("resizes the element via SE handle drag", () => {
    const _ctx: any = makeCtx();
    const template = makeTemplate();

    handlers.resolveTemplate({ component: { template } } as any, ctx);
    handlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const id = ctx.payload.nodeId;
    const el = document.getElementById(id)!;

    // Mock conductor for resize operations
    const conductor = {
      play: (_pluginId: string, _seqId: string, payload: any) => {
        // Update DOM via resize handler
        resizeHandlers.updateSize?.(payload, {});
      },
    };

    // Show overlay (creates handles)
    showSelectionOverlay({ id }, { conductor });

    const overlay = document.getElementById("rx-selection-overlay")!;
    const se = overlay.querySelector(".rx-handle.se")!;

    // initial size
    expect((el as HTMLElement).style.width).toBe("100px");
    expect((el as HTMLElement).style.height).toBe("50px");

    // Start drag near bottom-right
    dispatchMouse(se, "mousedown", {
      clientX: 200,
      clientY: 200,
      button: 0,
    });
    // Move mouse by +20,+30
    dispatchMouse(document, "mousemove", {
      clientX: 220,
      clientY: 230,
    });
    // End
    dispatchMouse(document, "mouseup", {
      clientX: 220,
      clientY: 230,
    });

    expect((el as HTMLElement).style.width).toBe("120px");
    expect((el as HTMLElement).style.height).toBe("80px");
  });

  it("emits a single resize.move for repeated mousemove at same geometry", () => {
    const _ctx: any = makeCtx();
    const template = makeTemplate();

    handlers.resolveTemplate({ component: { template } } as any, ctx);
    handlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const id = ctx.payload.nodeId;
    const el = document.getElementById(id)!;

    const conductor = {
      play: (_pluginId: string, _seqId: string, payload: any) => {
        resizeHandlers.updateSize?.(payload, {});
      },
    };

    showSelectionOverlay({ id }, { conductor });

    const overlay = document.getElementById("rx-selection-overlay")!;
    const se = overlay.querySelector(".rx-handle.se")!;

    const spy = vi.spyOn(resizeHandlers, "updateSize");

    const originalRaf = (globalThis as any).requestAnimationFrame;
    const originalCancelRaf = (globalThis as any).cancelAnimationFrame;

    (globalThis as any).requestAnimationFrame = (
      cb: FrameRequestCallback
    ) => {
      cb(performance.now() as any);
      return 1 as any;
    };
    (globalThis as any).cancelAnimationFrame = () => {};

    try {
      dispatchMouse(se, "mousedown", {
        clientX: 200,
        clientY: 200,
        button: 0,
      });

      for (let i = 0; i < 3; i++) {
        dispatchMouse(document, "mousemove", {
          clientX: 220,
          clientY: 230,
        });
      }

      dispatchMouse(document, "mouseup", {
        clientX: 220,
        clientY: 230,
      });

      const moveCalls = spy.mock.calls.filter(
        ([payload]) => payload?.phase === "move"
      );
      expect(moveCalls.length).toBe(1);
    } finally {
      (globalThis as any).requestAnimationFrame = originalRaf;
      (globalThis as any).cancelAnimationFrame = originalCancelRaf;
      spy.mockRestore();
    }

    expect((el as HTMLElement).style.width).toBe("120px");
    expect((el as HTMLElement).style.height).toBe("80px");
  });
});


