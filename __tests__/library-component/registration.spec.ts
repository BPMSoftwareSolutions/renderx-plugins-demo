import { describe, it, expect, vi } from "vitest";

// Unit test for plugin registration: ensure both drag and drop sequences are mounted under the correct plugin id

describe("library-component registrar", () => {
  it("mounts drag and drop under LibraryComponentPlugin", async () => {
    const mounts: Array<{ seqId: string; pluginId: string }> = [];
    const conductor = {
      mount: vi.fn(async (seq: any, _handlers: any, pluginId: string) => {
        mounts.push({ seqId: seq?.id, pluginId });
      }),
    } as any;

    const mod = await import("../../plugins/library-component");
    await mod.register(conductor);

    // Expect two mounts with correct plugin id and sequence ids
    const ids = mounts.map((m) => m.seqId).sort();
    expect(ids).toEqual([
      "library-component-drag-symphony",
      "library-component-drop-symphony",
    ]);
    // Drag and drop must be mounted under distinct plugin IDs due to PluginManager's single-mount constraint
    const pluginIds = mounts.map((m) => m.pluginId).sort();
    expect(pluginIds).toEqual(["LibraryComponentDropPlugin", "LibraryComponentPlugin"].sort());
  });
});

