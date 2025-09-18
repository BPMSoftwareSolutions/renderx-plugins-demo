import { describe, it, expect, beforeEach, vi } from "vitest";
import * as mod from "../../src/core/environment/feature-flags";

describe("feature flags runtime registry", () => {
  beforeEach(() => {
    // reset time
    vi.useRealTimers();
  });

  it("returns enabled for 'on' and 'experiment' statuses and logs usage", () => {
    const meta1 = mod.getFlagMeta("perf.fast-initial-drag");
    expect(meta1?.status).toBeDefined();

    const startLen = mod.getUsageLog().length;
    const on = mod.isFlagEnabled("perf.fast-initial-drag");
    const exp = mod.isFlagEnabled("feature.control-panel.sequences");
    const off = mod.isFlagEnabled("perf.cp.debug");

    expect(on).toBeTypeOf("boolean");
    expect(exp).toBeTypeOf("boolean");

    // off should be false if unknown
    expect(off).toBe(false);

    const after = mod.getUsageLog();
    expect(after.length).toBe(startLen + 3);

    // latest entry should be the last call
    const last = after[after.length - 1];
    expect(last.id).toBe("perf.cp.debug");
    expect(typeof last.when).toBe("number");
  });
});
