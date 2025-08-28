import { describe, it, expect, beforeEach } from "vitest";
import { collectCssClasses } from "../../plugins/canvas-component/symphonies/export/export.css.stage-crew";
import { cssRegistry } from "../../plugins/control-panel/state/css-registry.store";

describe("Debug CSS collection in export", () => {
  beforeEach(() => {
    // Log current registry state
    console.log("CSS Registry state before test:");
    console.log("- Has rx-button:", cssRegistry.hasClass("rx-button"));
    console.log("- Has rx-comp:", cssRegistry.hasClass("rx-comp"));
    console.log("- All class names:", cssRegistry.getClassNames());
    
    if (cssRegistry.hasClass("rx-button")) {
      const buttonClass = cssRegistry.getClass("rx-button");
      console.log("- rx-button content preview:", buttonClass?.content?.substring(0, 100) + "...");
      console.log("- rx-button has variants:", buttonClass?.content?.includes("--primary"));
    }
  });

  it("debugs why cssClasses is empty in export", () => {
    // Simulate the exact component structure from your export
    const ctx: any = {
      payload: {
        components: [
          {
            id: "rx-node-et5orq",
            type: "button",
            template: {
              tag: "button",
              classRefs: ["rx-comp", "rx-button", "rx-comp-button-et5orq"],
              style: {}
            }
          }
        ]
      },
      logger: {
        info: (msg: string) => console.log("INFO:", msg),
        error: (msg: string) => console.log("ERROR:", msg)
      }
    };

    console.log("\n=== Before collectCssClasses ===");
    console.log("Component classRefs:", ctx.payload.components[0].template.classRefs);
    
    collectCssClasses({}, ctx);

    console.log("\n=== After collectCssClasses ===");
    console.log("cssClasses keys:", Object.keys(ctx.payload.cssClasses || {}));
    console.log("cssClassCount:", ctx.payload.cssClassCount);
    
    if (ctx.payload.cssClasses?.["rx-button"]) {
      console.log("rx-button CSS found:", ctx.payload.cssClasses["rx-button"].content?.substring(0, 100) + "...");
    } else {
      console.log("rx-button CSS NOT found in export");
    }

    if (ctx.payload.cssClasses?.["rx-comp"]) {
      console.log("rx-comp CSS found:", ctx.payload.cssClasses["rx-comp"].content?.substring(0, 100) + "...");
    } else {
      console.log("rx-comp CSS NOT found in export");
    }

    // This should not be empty if the fix is working
    expect(Object.keys(ctx.payload.cssClasses || {}).length).toBeGreaterThan(0);
  });
});
