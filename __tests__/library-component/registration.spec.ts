import { describe, it, expect, vi } from "vitest";
import { loadJsonSequenceCatalogs } from "../../src/core/conductor";

// Unit test for JSON loader: ensure sequences are mounted under the correct plugin ids
// NOTE: This test uses a mock conductor that accepts multiple mounts for the same plugin id.
// In the real browser, the conductor rejects the second mount for LibraryComponentDropPlugin,
// so only "library-component-drop-symphony" registers (not "library-component-container-drop-symphony").
// This will be fixed when the musical-conductor engine allows additional sequences for already-mounted plugins.

describe("JSON loader — library-component sequences", () => {
  it("mounts all sequences via catalogs with correct plugin ids (test environment)", async () => {
    const mounts: Array<{ seqId: string; pluginId: string }> = [];
    const conductor = {
      mount: vi.fn(async (seq: any, _handlers: any, pluginId: string) => {
        mounts.push({ seqId: seq?.id, pluginId });
      }),
      logger: { warn: vi.fn(), info: vi.fn() },
    } as any;

    // Point loader to built artifacts in public/ (pre:manifests syncs node_modules catalogs there)
    (process as any).env = { ...(process as any).env, HOST_ARTIFACTS_DIR: 'public' };
    await loadJsonSequenceCatalogs(conductor);

    // Filter to library-component mounts and verify ids
    const libCompMounts = mounts.filter(
      (m) =>
        m.pluginId === "LibraryComponentPlugin" ||
        m.pluginId === "LibraryComponentDropPlugin"
    );

    const ids = libCompMounts.map((m) => m.seqId).sort();
    // Test environment mounts all sequences (mock conductor accepts multiple mounts per plugin id)
    expect(ids).toEqual([
      "library-component-container-drop-symphony",
      "library-component-drag-symphony",
      "library-component-drop-symphony",
    ]);
  }, 60000);
});
