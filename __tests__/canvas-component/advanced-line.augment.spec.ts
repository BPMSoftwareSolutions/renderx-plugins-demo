/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { enhanceLine } from "../../plugins/canvas-component/symphonies/augment/augment.line.stage-crew";
import {
  setFlagOverride,
  clearFlagOverrides,
} from "../../src/feature-flags/flags";

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

describe("Advanced Line augmentation (Phase 1)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
    setFlagOverride("lineAdvanced", true);
  });
  afterEach(() => {
    clearFlagOverrides();
  });

  it("adds defs with markers exactly once (idempotent)", () => {
    const ctx: any = makeCtx();
    const template = makeSvgLineTemplate();

    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const svg = document.querySelector("#rx-canvas svg") as SVGSVGElement | null;
    expect(svg).toBeTruthy();
    // Before augment: no defs
    expect(svg!.querySelector("defs#rx-line-markers")).toBeNull();

    // Call augment
    enhanceLine({}, ctx);
    const first = svg!.querySelectorAll("defs#rx-line-markers");
    expect(first.length).toBe(1);

    // Call augment again -> still one defs
    enhanceLine({}, ctx);
    const second = svg!.querySelectorAll("defs#rx-line-markers");
    expect(second.length).toBe(1);
  });
});

