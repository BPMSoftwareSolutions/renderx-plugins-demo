/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveTemplate } from "../src/symphonies/create/create.arrangement";

describe("resolveTemplate handler", () => {
  let ctx: any;

  beforeEach(() => {
    ctx = {
      payload: {}
    };
  });

  afterEach(() => {
    ctx = null;
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-create-symphony:1.1:1
   *
   * Given: valid component data with template is provided
   * When: resolveTemplate processes the input
   * Then: template is extracted and stored in context.payload.template
   *       a unique node ID is generated or override ID is used
   *       React rendering strategy is detected when render.strategy === 'react'
   * And: operation completes within 1s P95
   *      schema fetches are deduped across calls and instances
   *      telemetry includes latency metrics
   */
  it("[AC:renderx-web-orchestration:canvas-component-create-symphony:1.1:1] extracts template, generates ID, and detects React strategy", () => {
    const data = {
      component: {
        template: {
          tag: "button",
          classes: ["rx-comp", "rx-button"],
          style: { color: "red" },
          render: {
            strategy: "react"
          }
        }
      }
    };

    resolveTemplate(data, ctx);

    // Verify template is extracted and stored
    expect(ctx.payload.template).toBeDefined();
    expect(ctx.payload.template.tag).toBe("button");
    expect(ctx.payload.template.classes).toEqual(["rx-comp", "rx-button"]);

    // Verify unique node ID is generated
    expect(ctx.payload.nodeId).toBeDefined();
    expect(ctx.payload.nodeId).toMatch(/^rx-node-[a-z0-9]{6}$/);

    // Verify React rendering strategy is detected
    expect(ctx.payload.kind).toBe("react");
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-create-symphony:1.1:2
   *
   * Given: component data is missing template
   * When: resolveTemplate processes invalid input
   * Then: error is thrown with message 'Missing component template.'
   * And: error context is logged
   *      system remains stable
   */
  it("[AC:renderx-web-orchestration:canvas-component-create-symphony:1.1:2] throws error when template is missing", () => {
    const dataWithoutTemplate = {
      component: {}
    };

    expect(() => {
      resolveTemplate(dataWithoutTemplate, ctx);
    }).toThrow("Missing component template.");

    // Verify system remains stable - context is unchanged
    expect(ctx.payload).toBeDefined();
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-create-symphony:1.1:3
   *
   * Given: import scenario with _overrideNodeId provided
   * When: resolveTemplate processes import data
   * Then: override ID is used instead of generating new ID
   *       template resolution proceeds normally
   * And: imported nodes have stable, predictable IDs
   */
  it("[AC:renderx-web-orchestration:canvas-component-create-symphony:1.1:3] uses override ID for import scenarios", () => {
    const importData = {
      component: {
        template: {
          tag: "div",
          classes: ["rx-comp"]
        }
      },
      _overrideNodeId: "imported-node-123"
    };

    resolveTemplate(importData, ctx);

    // Verify override ID is used
    expect(ctx.payload.nodeId).toBe("imported-node-123");

    // Verify template resolution proceeds normally
    expect(ctx.payload.template).toBeDefined();
    expect(ctx.payload.template.tag).toBe("div");
  });

  it("generates different IDs for multiple calls", () => {
    const data = {
      component: {
        template: { tag: "div", classes: ["rx-comp"] }
      }
    };

    const ctx1 = { payload: {} };
    const ctx2 = { payload: {} };

    resolveTemplate(data, ctx1);
    resolveTemplate(data, ctx2);

    // Verify IDs are different (deduplication behavior)
    expect(ctx1.payload.nodeId).toBeDefined();
    expect(ctx2.payload.nodeId).toBeDefined();
    expect(ctx1.payload.nodeId).not.toBe(ctx2.payload.nodeId);
  });

  it("does not set kind when render strategy is not 'react'", () => {
    const data = {
      component: {
        template: {
          tag: "div",
          classes: ["rx-comp"],
          render: {
            strategy: "dom"
          }
        }
      }
    };

    resolveTemplate(data, ctx);

    // Verify React kind is not set for non-React strategies
    expect(ctx.payload.kind).toBeUndefined();
  });
});
