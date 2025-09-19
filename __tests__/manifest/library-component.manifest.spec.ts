import { describe, it, expect } from "vitest";
import manifest from "../../catalog/json-plugins/plugin-manifest.json";

/**
 * TDD: Ensure host manifest includes a runtime-only entry for the externalized
 * library-component package using a bare package specifier and register export.
 */
describe("Library-Component runtime manifest entry", () => {
  it("lists @renderx-plugins/library-component with export register", () => {
    const plugins = (manifest as any)?.plugins || [];
    const entries = plugins.filter(
      (p: any) => p?.runtime?.module === "@renderx-plugins/library-component"
    );
    expect(entries.length).toBeGreaterThan(0);
    const anyEntry = entries[0];
    expect(anyEntry.runtime?.export).toBe("register");
  });
});
