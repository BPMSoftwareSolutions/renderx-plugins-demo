/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";

function makeSvgTemplate() {
  return {
  tag: "svg",
  classes: ["rx-comp", "rx-svg"],
    css: ".rx-svg * { vector-effect: non-scaling-stroke; }",
    dimensions: { width: 900, height: 500 },
    // content delivered via content rules (viewBox, preserveAspectRatio)
    content: {
      viewBox: "0 0 900 500",
      preserveAspectRatio: "xMidYMid meet",
      svgMarkup: "<defs><marker id='arrow' /></defs><g class='layer'></g>"
    },
  metadata: { type: "svg" }
  } as any;
}

function makeCtx() {
  return { payload: {} } as any;
}

describe("SVG component (generic)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("creates an <svg.rx-svg> with viewBox/preserveAspectRatio and applies innerHtml", () => {
    const ctx: any = makeCtx();
    const template = makeSvgTemplate();

    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 0, y: 0 } } as any, ctx);

    const svg = document.querySelector('#rx-canvas svg.rx-svg') as SVGSVGElement | null;
    expect(svg).toBeTruthy();

    // Attributes from content rules
    expect(svg!.getAttribute('viewBox')).toBe('0 0 900 500');
    expect(svg!.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');

    // Inner markup applied
    const defs = svg!.querySelector('defs');
    expect(defs).toBeTruthy();
    const marker = defs!.querySelector('marker#arrow');
    expect(marker).toBeTruthy();

    // Non-scaling stroke rule present in injected CSS (jsdom can't compute)
    const styleEl = document.getElementById('rx-components-styles') as HTMLStyleElement | null;
    expect(styleEl?.textContent || '').toContain('non-scaling-stroke');
  });
});
