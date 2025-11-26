/* @vitest-environment jsdom */

import { describe, it, expect } from "vitest";

// Verifies registerAllSequences can be called multiple times without duplicating mounts

describe("registerAllSequences idempotency (canvas-component)", () => {
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
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  it("does not duplicate sequence mounts on subsequent calls", async () => {
    (process as any).env.HOST_ARTIFACTS_DIR = "public";

    const { initConductor, registerAllSequences } = await import("../src/temp-deps/conductor");
    const conductor = await initConductor();

    await registerAllSequences(conductor);
    const firstIds = Object.keys((conductor as any).sequences || {});

    await registerAllSequences(conductor);
    const secondIds = Object.keys((conductor as any).sequences || {});

    expect(new Set(secondIds).size).toBe(firstIds.length);
  });
});

