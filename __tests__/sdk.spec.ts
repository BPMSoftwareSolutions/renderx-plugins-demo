import { describe, it, expect } from "vitest";

// TDD: this should fail until we add the @renderx/host-sdk local package
// and wire it via workspaces.

describe("@renderx/host-sdk exports", () => {
  it("exposes expected API surface", async () => {
    const mod = await import("@renderx/host-sdk");
    expect(mod).toBeTruthy();

    // Core APIs
    expect(typeof mod.useConductor).toBe("function");
    expect(mod.EventRouter).toBeTruthy();
    expect(typeof mod.EventRouter.publish).toBe("function");
    expect(typeof mod.EventRouter.subscribe).toBe("function");
    expect(typeof mod.resolveInteraction).toBe("function");

    // Feature flags helpers
    expect(typeof mod.isFlagEnabled).toBe("function");
    expect(typeof mod.getFlagMeta).toBe("function");
  });
});

