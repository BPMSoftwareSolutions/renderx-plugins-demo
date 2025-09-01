/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { handlers as resizeMoveHandlers } from "../../plugins/canvas-component/symphonies/resize/resize.move.symphony";

function makeSvgTemplate() {
  return {
    tag: "svg",
    classes: ["rx-comp", "rx-svg"],
    css: ".rx-svg * { vector-effect: non-scaling-stroke; }",
    dimensions: { width: 300, height: 200 },
    content: {
      viewBox: "0 0 300 200",
      preserveAspectRatio: "xMidYMid meet",
      svgMarkup: "<rect id='r1' x='0' y='0' width='300' height='200' stroke='black' fill='none' />"
    },
  metadata: { type: "svg" }
  } as any;
}

function makeCtx() { return { payload: {} } as any; }

describe("SVG component resize", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("resizes outer dimensions without removing inner content and preserves non-scaling stroke styling", () => {
    const ctx: any = makeCtx();
    const template = makeSvgTemplate();

    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 5, y: 10 } } as any, ctx);

    const id = ctx.payload.nodeId as string;
    const el = document.getElementById(id)! as HTMLElement;

    expect(el.style.width).toBe('300px');
    expect(el.style.height).toBe('200px');

    // Perform resize
    const payload = {
      id,
      dir: 'se',
      startLeft: 5,
      startTop: 10,
      startWidth: 300,
      startHeight: 200,
      dx: 120,
      dy: 80,
      phase: 'move'
    } as any;

    resizeMoveHandlers.updateSize?.(payload, {} as any);

    expect(el.style.width).toBe('420px');
    expect(el.style.height).toBe('280px');

    // Inner content remains
    const rect = el.querySelector('rect#r1');
    expect(rect).toBeTruthy();

    // CSS rule still present
    const styleEl = document.getElementById('rx-components-styles') as HTMLStyleElement | null;
    expect(styleEl?.textContent || '').toContain('non-scaling-stroke');
  });
});
