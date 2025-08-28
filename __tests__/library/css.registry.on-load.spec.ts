import { describe, it, expect } from "vitest";
import { handlers } from "../../plugins/library/symphonies/load.symphony";
import { cssRegistry } from "../../plugins/control-panel/state/css-registry.store";

describe("library load registers JSON CSS into cssRegistry", () => {
  it("updates rx-button registry entry with JSON CSS (including variants)", async () => {
    const ctx: any = { payload: {} };

    // Sanity: built-in class exists but should not include JSON variant selectors yet
    const before = cssRegistry.getClass("rx-button");
    expect(before).toBeDefined();
    expect(before?.content || "").not.toContain(".rx-button--primary");

    await handlers.loadComponents({}, ctx);

    const after = cssRegistry.getClass("rx-button");
    expect(after).toBeDefined();

    // JSON CSS includes all variant selectors
    const content = after?.content || "";
    expect(content).toContain(".rx-button--primary");
    expect(content).toContain(".rx-button--secondary");
    expect(content).toContain(".rx-button--danger");
    expect(content).toContain(".rx-button--small");
    expect(content).toContain(".rx-button--medium");
    expect(content).toContain(".rx-button--large");
  });
});
