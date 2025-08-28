import { describe, it, expect, beforeEach } from "vitest";
import { collectCssClasses } from "../../plugins/canvas-component/symphonies/export/export.css.stage-crew";
import { cssRegistry } from "../../plugins/control-panel/state/css-registry.store";

describe("CSS collection fix for classRefs vs classes mismatch", () => {
  beforeEach(() => {
    // Ensure rx-button CSS is registered (simulating library load)
    const buttonCss = ".rx-button { background: var(--bg-color); } .rx-button--primary { --bg-color: #007bff; }";
    if (cssRegistry.hasClass("rx-button")) {
      cssRegistry.updateClass("rx-button", buttonCss);
    } else {
      cssRegistry.createClass("rx-button", buttonCss);
    }
  });

  it("collects CSS from components with template.classRefs (current export format)", () => {
    const ctx: any = {
      payload: {
        components: [
          {
            id: "rx-node-vd8esh",
            type: "button",
            template: {
              tag: "button",
              classRefs: ["rx-comp", "rx-button", "rx-comp-button-vd8esh"],
              style: {}
            }
          }
        ]
      },
      logger: {
        info: () => {},
        error: () => {}
      }
    };

    collectCssClasses({}, ctx);

    // Should now collect CSS classes from template.classRefs
    expect(ctx.payload.cssClasses).toBeDefined();
    expect(ctx.payload.cssClasses["rx-button"]).toBeDefined();
    expect(ctx.payload.cssClasses["rx-button"].content).toContain(".rx-button--primary");
    expect(ctx.payload.cssClassCount).toBeGreaterThan(0);
  });

  it("still supports legacy components with classes property", () => {
    const ctx: any = {
      payload: {
        components: [
          {
            id: "legacy-comp",
            type: "button",
            classes: ["rx-comp", "rx-button"], // Legacy format
            style: {}
          }
        ]
      },
      logger: {
        info: () => {},
        error: () => {}
      }
    };

    collectCssClasses({}, ctx);

    // Should still work with legacy format
    expect(ctx.payload.cssClasses).toBeDefined();
    expect(ctx.payload.cssClasses["rx-button"]).toBeDefined();
    expect(ctx.payload.cssClassCount).toBeGreaterThan(0);
  });
});
