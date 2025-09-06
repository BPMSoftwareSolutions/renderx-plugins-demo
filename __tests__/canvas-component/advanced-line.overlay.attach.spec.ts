/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { handlers as selectHandlers } from "../../plugins/canvas-component/symphonies/select/select.symphony";
import { setFlagOverride, clearFlagOverrides } from "../../src/feature-flags/flags";

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

describe("Advanced Line overlay attaches on selection (flag ON)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
    setFlagOverride("lineAdvanced", true);
  });

  it("creates #rx-adv-line-overlay and binds dataset targetId", () => {
    const ctx: any = { payload: {} };
    const template = makeSvgLineTemplate();

    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 0, y: 0 } } as any, ctx);

    const svg = document.querySelector("#rx-canvas svg") as SVGSVGElement | null;
    expect(svg).toBeTruthy();

    const id = (svg as any).getAttribute("id");
    expect(id).toBeTruthy();

    selectHandlers.showSelectionOverlay({ id }, { conductor: { play() {} } });

    const adv = document.getElementById("rx-adv-line-overlay") as HTMLDivElement | null;
    expect(adv).toBeTruthy();
    expect(adv!.dataset.targetId).toBe(String(id));

    clearFlagOverrides();
  });
});

