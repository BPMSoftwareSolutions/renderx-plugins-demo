import { describe, it, expect } from "vitest";
import { registerInstance } from "@renderx-plugins/canvas-component/symphonies/create/create.io.ts";

describe("canvas-component create.io", () => {
  let ctx: any;
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
      error: null,
      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  function makeCtx() {
    const ops: any[] = [];
    return {
      payload: {
        nodeId: "rx-node-abc123",
        template: { tag: "button", classes: ["rx-button"], style: {} },
      },
      io: {
        kv: { put: async (...a: any[]) => ops.push(["kv.put", ...a]) },
        cache: { put: async (...a: any[]) => ops.push(["cache.put", ...a]) },
      },
      _ops: ops,
    } as any;
  }

  it("persists node metadata to KV/cache", async () => {
    const _ctx: any = makeCtx();
    await registerInstance({}, ctx);
    const names = ctx._ops.map((x: any[]) => x[0]);
    expect(names).toContain("kv.put");
  });

  it("throws when IO is accessed in a pure beat (guard example)", () => {
    const _ctx: any = {
      io: new Proxy(
        {},
        {
          get() {
            throw new Error("IO not available in this beat");
          },
        }
      ),
    };
    expect(() => (ctx as any).io.kv.put("k", "v")).toThrow();
  });
});


