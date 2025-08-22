/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers } from "../../plugins/canvas-component/symphonies/create.symphony";

describe("canvas-component-create-symphony", () => {
  function makeTemplate() {
    return {
      tag: "button",
      text: "Click Me",
      classes: ["rx-comp", "rx-button"],
    };
  }

  function makeCtx() {
    return { payload: {} } as any;
  }

  beforeEach(() => {
    // Provide a host container for direct DOM updates
    document.body.innerHTML = '<div id="rx-canvas"></div>';
  });

  it("resolves template and returns UI payload via notifyUi (DOM path)", () => {
    const ctx: any = makeCtx();
    const template = makeTemplate();

    handlers.resolveTemplate({ component: { template } } as any, ctx as any);
    expect(ctx.payload.template).toBe(template);

    const pos = { x: 50, y: 30 };
    handlers.createNode({ position: pos } as any, ctx as any);

    let received: any = null;
    handlers.notifyUi({ onComponentCreated: (n: any) => (received = n) } as any, ctx as any);

    expect(received).toBeTruthy();
    expect(received.tag).toBe("button");
    expect(received.position).toEqual(pos);
    expect(received.classes).toContain("rx-button");
  });
});

