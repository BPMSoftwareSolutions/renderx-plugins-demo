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
          beginBeat: (correlationId: string, meta?: any) => {
            const ops: any[] = [];
            return {
              create: (tag: string, opts: { classes?: string[]; attrs?: Record<string, string> }) => {
                ops.push(["create", tag, opts]);
                return {
                  appendTo: (parent: string) => {
                    ops.push(["appendTo", parent]);
                    return txn;
                  },
                } as any;
              },
              update: (selector: string, opts: any) => {
                ops.push(["update", selector, opts]);
                return txn;
              },
              remove: (selector: string) => {
                ops.push(["remove", selector]);
                return txn;
              },
              commit: (opts?: any) => {
                calls.push(["commit", ops, opts]);
              },
            } as any;
            function txn() { /* placeholder chainable */ }
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

  describe("StageCrew transaction path", () => {
    it("creates, updates and commits a StageCrew transaction", () => {
      const ctx: any = makeCtx(true);
      const template = makeTemplate();

      handlers.resolveTemplate({ component: { template } } as any, ctx as any);
      handlers.createNode({ position: { x: 10, y: 20 } } as any, ctx as any);

      const commitCalls = ctx.calls.filter((c: any[]) => c[0] === "commit");
      expect(commitCalls.length).toBe(1);
      const ops = commitCalls[0][1];
      const opNames = ops.map((o: any[]) => o[0]);
      expect(opNames).toContain("create");
      expect(opNames).toContain("appendTo");
      expect(opNames).toContain("update");
    });
  });
});

