/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { renderTemplatePreview, applyTemplateStyles } from "../../plugins/library-component/symphonies/drag/drag.preview.stage-crew";

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

describe("Library drag preview renders SVG line", () => {
  beforeEach(() => {
    document.body.innerHTML = "<div id=host></div>";
  });

  it("builds an <svg> with a child <line.segment> in the ghost", () => {
    const ghost = document.getElementById("host")! as HTMLElement;
    const tpl = makeSvgLineTemplate();

    // mirror library behavior: append child and inject styles
    renderTemplatePreview(ghost, tpl, 120, 60);
    applyTemplateStyles(ghost, tpl);

    const svg = ghost.querySelector("svg.rx-line") as SVGSVGElement | null;
    expect(svg).toBeTruthy();
    const line = svg!.querySelector("line.segment") as SVGLineElement | null;
    expect(line).toBeTruthy();
    expect(line!.getAttribute("vector-effect")).toBe("non-scaling-stroke");
  });
});

