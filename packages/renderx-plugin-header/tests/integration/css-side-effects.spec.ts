/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";

// Intentionally import the built ESM to validate tsup --injectStyle behavior
// When moved to the standalone repo, this will become `import '@renderx-plugins/header'`

describe("CSS side-effects (dist build)", () => {
  it("injects a <style> tag with header CSS on import", async () => {
    const before = Array.from(document.head.querySelectorAll("style"));

    // Dynamic import so the test file itself doesn't fail to load in environments
    // that don't stub CSS imports the same way
    await import("../../dist/index.js");

    const after = Array.from(document.head.querySelectorAll("style"));
    // There should be at least one new style tag
    expect(after.length).toBeGreaterThanOrEqual(before.length + 1);

    // Find an injected style that contains a known selector from Header.css
    const injected = after.find((el) => el.textContent?.includes(".header-theme-button") || el.textContent?.includes(".header-container"));
    expect(!!injected).toBe(true);
  });
});

