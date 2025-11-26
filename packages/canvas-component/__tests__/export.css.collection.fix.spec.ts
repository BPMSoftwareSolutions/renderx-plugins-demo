import { describe, it, expect, beforeEach } from "vitest";
import { collectCssClasses } from "@renderx-plugins/canvas-component/symphonies/export/export.css.stage-crew.ts";
import { cssRegistry } from "../src/temp-deps/css-registry.store.ts";

describe("CSS collection fix for classRefs vs classes mismatch (migrated)", () => {
  let _ctx: any;
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
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
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
    const _ctx: any = {
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
      logger: { info: () => {}, error: () => {} }
    };

    collectCssClasses({}, ctx);

    expect(ctx.payload.cssClasses).toBeDefined();
    expect(ctx.payload.cssClasses["rx-button"]).toBeDefined();
    expect(ctx.payload.cssClasses["rx-button"].content).toContain(".rx-button");
    expect(ctx.payload.cssClassCount).toBeGreaterThan(0);
  });

  it("still supports legacy components with classes property", () => {
    const _ctx: any = {
      payload: {
        components: [
          {
            id: "legacy-comp",
            type: "button",
            classes: ["rx-comp", "rx-button"],
            style: {}
          }
        ]
      },
      logger: { info: () => {}, error: () => {} }
    };

    collectCssClasses({}, ctx);

    expect(ctx.payload.cssClasses).toBeDefined();
    expect(ctx.payload.cssClasses["rx-button"]).toBeDefined();
    expect(ctx.payload.cssClassCount).toBeGreaterThan(0);
  });
});

