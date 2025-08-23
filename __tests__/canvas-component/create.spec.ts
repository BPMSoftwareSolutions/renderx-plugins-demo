/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";

describe("canvas-component-create-symphony", () => {
  async function loadFirstTemplate() {
    const idx = await import("../../json-components/index.json", {
      with: { type: "json" },
    } as any);
    const files: string[] =
      (idx as any)?.default?.components || (idx as any)?.components || [];
    const first = files[0] || "button.json";
    const mod = await import(
      /* @vite-ignore */ `../../json-components/${first}`,
      { with: { type: "json" } } as any
    );
    const json: any = (mod as any)?.default || mod;
    const type = json?.metadata?.replaces || json?.metadata?.type || "div";
    const ci = json?.integration?.canvasIntegration || {};
    const template = {
      tag: type === "input" ? "input" : type || "div",
      text:
        type === "button"
          ? json?.integration?.properties?.defaultValues?.content || "Click Me"
          : undefined,
      classes: ["rx-comp", `rx-${type}`],
      css: json?.ui?.styles?.css,
      cssVariables: json?.ui?.styles?.variables || {},
      dimensions: { width: ci.defaultWidth, height: ci.defaultHeight },
      style: {},
    };
    return { template, type } as const;
  }

  function makeCtx() {
    return { payload: {} } as any;
  }

  beforeEach(() => {
    // Provide a host container for direct DOM updates
    document.body.innerHTML = '<div id="rx-canvas"></div>';
  });

  it("resolves template and returns UI payload via notifyUi (DOM path)", async () => {
    const ctx: any = makeCtx();
    const { template, type } = await loadFirstTemplate();

    handlers.resolveTemplate({ component: { template } } as any, ctx as any);
    expect(ctx.payload.template).toEqual(template);

    const pos = { x: 50, y: 30 };
    handlers.createNode({ position: pos } as any, ctx as any);

    let received: any = null;
    handlers.notifyUi(
      { onComponentCreated: (n: any) => (received = n) } as any,
      ctx as any
    );

    expect(received).toBeTruthy();
    expect(received.tag).toBe(template.tag);
    expect(received.position).toEqual(pos);
    expect(received.classes).toContain("rx-comp");
    expect(received.classes).toContain(`rx-${type}`);
  });
});
