import { describe, it, expect, beforeEach, vi } from "vitest";
import { createCssClass, updateCssClass } from "../src/symphonies/css-management/css-management.stage-crew";
import { cssRegistry } from "../src/state/css-registry.store";

function makeCtx() {
  return {
    payload: {} as any,
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  } as any;
}

describe("CSS registry idempotency", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("createCssClass is idempotent: second create with same content is a success no-op", () => {
    const className = `rx-idem-${Math.random().toString(36).slice(2)}`;
    const content = `.${className} { color: #123; }`;

    // Ensure clean slate
    if ((cssRegistry as any).removeClass) {
      (cssRegistry as any).removeClass(className);
    }

    const ctx1 = makeCtx();
    createCssClass({ className, content }, ctx1);
    expect(ctx1.payload.success).toBe(true);
    const first = cssRegistry.getClass(className)!;
    expect(first?.content).toBe(content);

    const ctx2 = makeCtx();
    createCssClass({ className, content }, ctx2);
    // Idempotent behavior: should be treated as success (no-op)
    expect(ctx2.payload.success).toBe(true);
    const second = cssRegistry.getClass(className)!;
    // unchanged timestamps for true no-op on identical content
    expect(second.updatedAt).toBe(first.updatedAt);
    expect(second.createdAt).toBe(first.createdAt);
  });

  it("updateCssClass upserts when missing and no-ops when content unchanged", () => {
    const className = `rx-idem-upsert-${Math.random().toString(36).slice(2)}`;
    const content = `.${className} { background: #abc; }`;

    // Ensure missing
    if ((cssRegistry as any).removeClass) {
      (cssRegistry as any).removeClass(className);
    }

    const ctx1 = makeCtx();
    updateCssClass({ className, content }, ctx1);
    // Upsert: succeeds by creating when missing
    expect(ctx1.payload.success).toBe(true);
    const created = cssRegistry.getClass(className)!;
    expect(created?.content).toBe(content);

    const ctx2 = makeCtx();
    updateCssClass({ className, content }, ctx2);
    // No-op on identical content
    expect(ctx2.payload.success).toBe(true);
    const after = cssRegistry.getClass(className)!;
    expect(after.updatedAt).toBe(created.updatedAt);
  });
});

