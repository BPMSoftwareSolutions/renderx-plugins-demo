/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "@renderx-plugins/canvas-component/symphonies/create/create.symphony.ts";

function makeSvgTemplateWithMarkup() {
  return {
    tag: "svg",
    text: "",
    classes: ["rx-comp", "rx-svg"],
    css: `.rx-svg * { vector-effect: non-scaling-stroke; }`,
    cssVariables: {},
    dimensions: { width: 900, height: 500 },
    content: {
      viewBox: "0 0 900 500",
      preserveAspectRatio: "xMidYMid meet",
      svgMarkup: `<!-- defs and marker snippet -->\n<defs>\n  <marker id=\"arrowhead\"></marker>\n</defs>\n<rect x=\"10\" y=\"10\" width=\"100\" height=\"50\" stroke=\"#000\" fill=\"none\"/>`
    }
  } as any;
}

describe("SVG component (markup)", () => {
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
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("applies svgMarkup as innerHTML on the <svg>", () => {
    ctx.payload = {} };
    const template = makeSvgTemplateWithMarkup();

    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 0, y: 0 } } as any, ctx);

    const svg = document.querySelector("#rx-canvas svg.rx-svg") as SVGSVGElement | null;
    expect(svg).toBeTruthy();

    const html = (svg as any).innerHTML || "";
    expect(html).toContain("<defs>");
    expect(html).toContain("marker");
    expect(html).toContain("<rect");
  });
});


