/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";

// Import source entry to validate named exports in dev/migration context
import * as pkg from "../../src/index";

describe("package exports (source)", () => {
  it("exposes expected symbols", () => {
    expect(typeof pkg.HeaderTitle).toBe("function");
    expect(typeof pkg.HeaderControls).toBe("function");
    expect(typeof pkg.HeaderThemeToggle).toBe("function");
    expect(typeof pkg.handlers).toBe("object");
    expect(typeof pkg.register).toBe("function");
  });
});

