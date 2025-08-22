import { handlers } from "../../plugins/canvas-component/symphonies/create.symphony";

describe("canvas-component-create-symphony", () => {
  function makeTemplate() {
    return {
      tag: "button",
      text: "Click Me",
      classes: ["rx-comp", "rx-button"],
      style: { padding: "8px 12px" },
    };
  }

  function makeCtx(withStageCrew = false) {
    const calls: any[] = [];
    const stageCrew = withStageCrew
      ? {
          injectRawCSS: (css: string) => calls.push(["injectRawCSS", css]),
          injectInstanceCSS: (...args: any[]) => calls.push(["injectInstanceCSS", ...args]),
          beginBeat: () => {
            const ops: any[] = [];
            return {
              create: (...a: any[]) => ops.push(["create", ...a]),
              setPosition: (...a: any[]) => ops.push(["setPosition", ...a]),
              commit: () => calls.push(["commit", ops]),
            };
          },
        }
      : undefined;

    return {
      payload: {},
      stageCrew,
      util: { hash: () => "abc123" },
      calls,
    } as any;
  }

  it("resolves template and returns UI payload via notifyUi", () => {
    const ctx: any = makeCtx(false);
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

  describe.skip("StageCrew transaction path", () => {
    it("injects CSS and commits a StageCrew transaction", () => {
      const ctx: any = makeCtx(true);
      const template = makeTemplate();

      handlers.resolveTemplate({ component: { template } } as any, ctx as any);
      handlers.createNode({ position: { x: 10, y: 20 } } as any, ctx as any);

      const names = ctx.calls.map((c: any[]) => c[0]);
      expect(names).toContain("injectInstanceCSS");
      expect(names).toContain("commit");
    });
  });
});

