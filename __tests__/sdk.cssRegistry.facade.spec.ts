import { describe, it, expect } from "vitest";
import { EventRouter } from "../src/EventRouter";

// Validate that the cssRegistry facade publishes expected topics

describe("Host cssRegistry facade (Phase 2 groundwork)", () => {
  it("createClass publishes control.panel.css.create.requested with payload", async () => {
    const g: any = globalThis as any;
    const css = g?.window?.RenderX?.cssRegistry;
    expect(css).toBeTruthy();

    const seen: any[] = [];
    const off = EventRouter.subscribe("control.panel.css.create.requested", (p) => seen.push(p));
    try {
      await css.createClass("test-id", "my-class", ".my-class { color: red; }");
      expect(seen.length).toBeGreaterThan(0);
      expect(seen[0]).toMatchObject({ id: "test-id", className: "my-class" });
    } finally {
      off();
    }
  });

  it("updateClass publishes control.panel.css.edit.requested with payload", async () => {
    const g: any = globalThis as any;
    const css = g?.window?.RenderX?.cssRegistry;
    expect(css).toBeTruthy();

    const seen: any[] = [];
    const off = EventRouter.subscribe("control.panel.css.edit.requested", (p) => seen.push(p));
    try {
      await css.updateClass("test-id-2", "my-class-2", ".my-class-2 { color: blue; }");
      expect(seen.length).toBeGreaterThan(0);
      expect(seen[0]).toMatchObject({ id: "test-id-2", className: "my-class-2" });
    } finally {
      off();
    }
  });
});

