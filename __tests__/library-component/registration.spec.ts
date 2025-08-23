import { describe, it, expect, vi } from "vitest";
import { loadJsonSequenceCatalogs } from "../../src/conductor";

// Unit test for JSON loader: ensure both drag and drop sequences are mounted under the correct plugin ids

describe("JSON loader — library-component sequences", () => {
  it("mounts drag and drop via catalogs with correct plugin ids", async () => {
    const mounts: Array<{ seqId: string; pluginId: string }> = [];
    const conductor = {
      mount: vi.fn(async (seq: any, _handlers: any, pluginId: string) => {
        mounts.push({ seqId: seq?.id, pluginId });
      }),
      logger: { warn: vi.fn(), info: vi.fn() },
    } as any;

    await loadJsonSequenceCatalogs(conductor);

    // Filter to library-component mounts and verify ids
    const libCompMounts = mounts.filter(
      (m) =>
        m.pluginId === "LibraryComponentPlugin" ||
        m.pluginId === "LibraryComponentDropPlugin"
    );

    const ids = libCompMounts.map((m) => m.seqId).sort();
    expect(ids).toEqual([
      "library-component-drag-symphony",
      "library-component-drop-symphony",
    ]);
  });
});
