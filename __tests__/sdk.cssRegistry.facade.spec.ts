import { describe, it, expect, beforeAll } from "vitest";
import { EventRouter } from "../src/core/events/EventRouter";
import { cssRegistry } from "../src/domain/css/cssRegistry.facade";

// Validate that the cssRegistry facade publishes expected topics

describe("Host cssRegistry facade (Phase 2 groundwork)", () => {
  beforeAll(async () => {
    // Ensure router initialized so publish() delivers to subscribers in tests
    try { await EventRouter.init(); } catch {}
  });
  it("createClass publishes control.panel.css.create.requested with payload", async () => {
    const css = cssRegistry;

    const seen: any[] = [];
    const off = EventRouter.subscribe("control.panel.css.create.requested", (p) => seen.push(p));
    try {
      await css.createClass("test-id", "my-class", ".my-class { color: red; }");
      // Allow routing microtasks (publish -> route -> subscriber)
      await new Promise(r => setTimeout(r, 0));
      expect(seen.length).toBeGreaterThan(0);
      expect(seen[0]).toMatchObject({ id: "test-id", className: "my-class" });
    } finally {
      off();
    }
  });

  it("updateClass publishes control.panel.css.edit.requested with payload", async () => {
    const css = cssRegistry;

    const seen: any[] = [];
    const off = EventRouter.subscribe("control.panel.css.edit.requested", (p) => seen.push(p));
    try {
      await css.updateClass("test-id-2", "my-class-2", ".my-class-2 { color: blue; }");
      await new Promise(r => setTimeout(r, 0));
      expect(seen.length).toBeGreaterThan(0);
      expect(seen[0]).toMatchObject({ id: "test-id-2", className: "my-class-2" });
    } finally {
      off();
    }
  });
});

