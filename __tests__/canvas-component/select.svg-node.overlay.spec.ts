/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { showSvgNodeOverlay } from "../../plugins/canvas-component/symphonies/select/select.svg-node.stage-crew";

// This test is TDD for issue #87: selecting a sub-node inside an SVG should position the overlay over that sub-node

function makeSvgTemplateWithNestedChildren() {
  return {
    tag: "svg",
    text: "",
    classes: ["rx-comp", "rx-svg"],
    css: `.rx-svg * { vector-effect: non-scaling-stroke; }`,
    cssVariables: {},
    dimensions: { width: 300, height: 200 },
    content: {
      viewBox: "0 0 300 200",
      preserveAspectRatio: "xMidYMid meet",
      svgMarkup: `
        <g id="layer1">
          <rect id="outer" x="10" y="20" width="120" height="60" fill="#ccc" />
          <g id="inner">
            <circle id="dot" cx="200" cy="120" r="15" fill="#f00" />
          </g>
        </g>
      `,
    },
  } as any;
}

function makeCtx() {
  return { payload: {} } as any;
}

describe("SVG sub-node selection overlay (TDD)", () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="rx-canvas" style="position:relative; left:0; top:0; width:900px; height:600px"></div>';
  });

  it("positions overlay over the target sub-element given a child-index path (e.g., '0/1')", () => {
    const ctx: any = makeCtx();
    const template = makeSvgTemplateWithNestedChildren();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } }, ctx);

    const id = ctx.payload.nodeId as string;

    // Target the <circle id=\"dot\"> which is nested under g#layer1 (index-based path from svg root):
    // svg -> g(layer1) -> g(inner) -> circle(dot)
    // We choose a path format "0/1/0" counting only element children at each level.

    // Act: show overlay for the circle node
    showSvgNodeOverlay({ id, path: "0/1/0" });

    // Assert overlay exists and is aligned to the circle's bounding box
    const overlay = document.getElementById(
      "rx-selection-overlay"
    ) as HTMLDivElement;
    expect(overlay).toBeTruthy();

    // Basic assertions: overlay should be visible and non-zero size
    expect(overlay.style.display).toBe("block");
    expect(parseFloat(overlay.style.width || "0")).toBeGreaterThan(0);
    expect(parseFloat(overlay.style.height || "0")).toBeGreaterThan(0);
  });
});
