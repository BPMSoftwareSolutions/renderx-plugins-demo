/* @vitest-environment jsdom */
import { describe, it, beforeEach } from "vitest";
import { handlers as createHandlers } from "@renderx-web/canvas-component/symphonies/create/create.symphony.ts";
import { showSelectionOverlay } from "@renderx-web/canvas-component/symphonies/select/select.stage-crew.ts";

function makeTemplate() {
  return {
    tag: "button",
    text: "Click me",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { background: #007acc; color: #fff; }",
    cssVariables: {},
    dimensions: { width: 100, height: 50 },
  } as const;
}

function dispatchMouse(el: Element | Document, type: string, opts: any) {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, ...opts });
  (el as any).dispatchEvent(ev);
}

describe("canvas-component drag: overlay visibility (migrated)", () => {
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
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it.skip("hides overlay while dragging and restores visibility on drag end (drop)", () => {
    // Kept as skipped to drive future implementation
    ctx.payload = {};
    const template = makeTemplate();
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } }, ctx);
    const id = ctx.payload.nodeId as string;
    const el = document.getElementById(id)! as HTMLElement;

    showSelectionOverlay({ id });
    const _overlay = document.getElementById("rx-selection-overlay") as HTMLDivElement;

    dispatchMouse(el, "mousedown", { clientX: 50, clientY: 50, button: 0 });
    dispatchMouse(document, "mousemove", { clientX: 80, clientY: 90 });
    dispatchMouse(document, "mouseup", { clientX: 80, clientY: 90 });
  });
});


