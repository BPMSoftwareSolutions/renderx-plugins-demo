/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import {
  updateSvgNodeAttribute,
  refreshControlPanel,
} from "../../plugins/canvas-component/symphonies/update/update.svg-node.stage-crew";

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
  return {
    payload: {},
    conductor: { play: vi.fn() },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
    },
  } as any;
}

describe("SVG node update functionality", () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="rx-canvas" style="position:relative; left:0; top:0; width:900px; height:600px"></div>';
  });

  it("should update rect fill attribute correctly", async () => {
    const ctx = makeCtx();
    const template = makeSvgTemplateWithNestedChildren();

    // Create the SVG component
    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const svg = document.querySelector(
      "#rx-canvas svg.rx-svg"
    ) as SVGSVGElement;
    const rect = svg.querySelector('rect[id="outer"]') as SVGRectElement;
    const svgId = svg.id;

    expect(rect).toBeTruthy();
    expect(rect.getAttribute("fill")).toBe("#ccc");

    // Update the fill attribute
    await updateSvgNodeAttribute(
      {
        id: svgId,
        path: "0/0", // g[0] -> rect[0]
        attribute: "fill",
        value: "#ff0000",
      },
      ctx
    );

    // Check that the attribute was updated
    expect(rect.getAttribute("fill")).toBe("#ff0000");
    expect(ctx.payload.updatedSvgNode).toEqual({
      id: svgId,
      path: "0/0",
      attribute: "fill",
      value: "#ff0000",
    });
  });

  it("should update circle radius attribute correctly", async () => {
    const ctx = makeCtx();
    const template = makeSvgTemplateWithNestedChildren();

    // Create the SVG component
    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const svg = document.querySelector(
      "#rx-canvas svg.rx-svg"
    ) as SVGSVGElement;
    const circle = svg.querySelector('circle[id="dot"]') as SVGCircleElement;
    const svgId = svg.id;

    expect(circle).toBeTruthy();
    expect(circle.getAttribute("r")).toBe("15");

    // Update the radius attribute
    await updateSvgNodeAttribute(
      {
        id: svgId,
        path: "0/1/0", // g[0] -> g[1] -> circle[0]
        attribute: "r",
        value: "25",
      },
      ctx
    );

    // Check that the attribute was updated
    expect(circle.getAttribute("r")).toBe("25");
  });

  it("should remove attribute when value is null or empty", async () => {
    const ctx = makeCtx();
    const template = makeSvgTemplateWithNestedChildren();

    // Create the SVG component
    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const svg = document.querySelector(
      "#rx-canvas svg.rx-svg"
    ) as SVGSVGElement;
    const rect = svg.querySelector('rect[id="outer"]') as SVGRectElement;
    const svgId = svg.id;

    expect(rect.getAttribute("fill")).toBe("#ccc");

    // Remove the fill attribute by setting it to null
    await updateSvgNodeAttribute(
      {
        id: svgId,
        path: "0/0",
        attribute: "fill",
        value: null,
      },
      ctx
    );

    // Check that the attribute was removed
    expect(rect.getAttribute("fill")).toBeNull();
  });

  it("should reject non-whitelisted attributes", async () => {
    const ctx = makeCtx();
    const template = makeSvgTemplateWithNestedChildren();

    // Create the SVG component
    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const svg = document.querySelector(
      "#rx-canvas svg.rx-svg"
    ) as SVGSVGElement;
    const rect = svg.querySelector('rect[id="outer"]') as SVGRectElement;
    const svgId = svg.id;

    // Try to update a non-whitelisted attribute
    await updateSvgNodeAttribute(
      {
        id: svgId,
        path: "0/0",
        attribute: "onclick", // Not in whitelist
        value: "alert('xss')",
      },
      ctx
    );

    // Should not have updated the attribute
    expect(rect.getAttribute("onclick")).toBeNull();
    expect(ctx.logger.warn).toHaveBeenCalledWith(
      "SVG attribute 'onclick' is not allowed for security reasons"
    );
  });

  it("should handle invalid paths gracefully", async () => {
    const ctx = makeCtx();
    const template = makeSvgTemplateWithNestedChildren();

    // Create the SVG component
    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const svg = document.querySelector(
      "#rx-canvas svg.rx-svg"
    ) as SVGSVGElement;
    const svgId = svg.id;

    // Try to update with an invalid path
    await updateSvgNodeAttribute(
      {
        id: svgId,
        path: "99/99/99", // Invalid path
        attribute: "fill",
        value: "#ff0000",
      },
      ctx
    );

    // Should log a warning about invalid path
    expect(ctx.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Invalid path segment")
    );
  });

  it("should handle refresh control panel function", () => {
    const ctx = makeCtx();
    ctx.payload.elementId = "test-svg-id";

    // Test that the function runs without errors
    expect(() => refreshControlPanel({}, ctx)).not.toThrow();
  });

  it("should handle missing element ID in refresh gracefully", () => {
    const ctx = makeCtx();
    // No elementId in payload

    // Test that the function runs without errors
    expect(() => refreshControlPanel({}, ctx)).not.toThrow();
    expect(ctx.logger.warn).toHaveBeenCalledWith(
      "No element ID found for Control Panel refresh"
    );
  });
});
