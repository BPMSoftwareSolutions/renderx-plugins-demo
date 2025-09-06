/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { recomputeLineSvg } from "../../plugins/canvas-component/symphonies/augment/line.recompute.stage-crew";

function makeSvgLineTemplate() {
  return {
    tag: "svg",
    text: "",
    classes: ["rx-comp", "rx-line"],
    css: `.rx-line .segment { stroke: var(--stroke, #111827); stroke-width: var(--thickness, 2); }`,
    cssVariables: { stroke: "#111827", thickness: 2 },
    dimensions: { width: 120, height: 60 },
  } as any;
}

function makeCtx() {
  return { payload: {} } as any;
}

describe("Advanced Line — fixed viewBox during drag", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("keeps viewBox fixed when data-viewbox=fixed even if endpoints exceed host", () => {
    const ctx: any = makeCtx();
    const template = makeSvgLineTemplate();
    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 0, y: 0 } } as any, ctx);

    const svg = document.querySelector("#rx-canvas svg") as SVGSVGElement;
    const host = svg as unknown as HTMLElement;

    host.style.setProperty("--x1", "0");
    host.style.setProperty("--y1", "30");
    host.style.setProperty("--x2", "180"); // beyond 120 width
    host.style.setProperty("--y2", "30");

    // Normal behavior: autosize expands viewBox width > 100
    recomputeLineSvg(svg);
    const vbAuto = (svg.getAttribute("viewBox") || "0 0 100 100").split(/\s+/).map(parseFloat);
    expect(vbAuto[2]).toBeGreaterThan(100);

    // Simulate drag: fix viewBox to 0 0 100 100
    (host as any).dataset.viewbox = "fixed";
    (host as any).dataset.viewboxSaved = "0 0 100 100";
    recomputeLineSvg(svg);
    const vbFixed = (svg.getAttribute("viewBox") || "").trim();
    expect(vbFixed).toBe("0 0 100 100");

    // Clean up / end drag
    delete (host as any).dataset.viewbox;
    delete (host as any).dataset.viewboxSaved;
    recomputeLineSvg(svg);
    const vbAfter = (svg.getAttribute("viewBox") || "0 0 100 100").split(/\s+/).map(parseFloat);
    expect(vbAfter[2]).toBeGreaterThan(100); // autosize resumes
  });
});

