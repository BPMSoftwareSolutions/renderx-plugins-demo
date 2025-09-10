import { describe, it, expect } from "vitest";

// These tests validate the host-side inventory aggregator bridge exposed on window.RenderX

describe("Host inventory facade (Phase 2 groundwork)", () => {
  it("listComponents() returns an array and getComponentById() resolves a known id", async () => {
    const g: any = globalThis as any;
    expect(g?.window?.RenderX?.inventory).toBeTruthy();
    const inv = g.window.RenderX.inventory;

    const list = await inv.listComponents();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);

    const first = list[0];
    const id = first?.id;
    expect(typeof id === "string" && id.length > 0).toBe(true);

    const byId = await inv.getComponentById(id);
    expect(byId).toBeTruthy();
    expect(byId.id).toBe(id);
  });

  it("onInventoryChanged() returns an unsubscribe function", () => {
    const g: any = globalThis as any;
    const inv = g.window.RenderX.inventory;
    const off = inv.onInventoryChanged(() => {});
    expect(typeof off).toBe("function");
    off();
  });
});

