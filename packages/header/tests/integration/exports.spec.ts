/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";

// Import source entry to validate named exports in dev/migration context
import * as pkg from "../../src/index";

describe("package exports (source)", () => {
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
  it("exposes expected symbols", () => {
    expect(typeof pkg.HeaderTitle).toBe("function");
    expect(typeof pkg.HeaderControls).toBe("function");
    expect(typeof pkg.HeaderThemeToggle).toBe("function");
    expect(typeof pkg.handlers).toBe("object");
    expect(typeof pkg.register).toBe("function");
  });
});

