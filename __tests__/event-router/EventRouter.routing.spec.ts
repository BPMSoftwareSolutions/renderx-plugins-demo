import { describe, it, expect, beforeAll } from "vitest";
import { EventRouter } from "../../src/core/events/EventRouter";
// Inline minimal manifest builder for tests (avoid importing node script)
function buildTopicsManifest(catalogs: any[]) {
  const topics: Record<string, any> = {};
  for (const cat of catalogs || []) {
    const t = (cat as any)?.topics || {};
    for (const [key, def] of Object.entries(t)) {
      const routes: any[] = [];
      if ((def as any)?.route) routes.push((def as any).route);
      if (Array.isArray((def as any)?.routes))
        routes.push(...(def as any).routes);
      topics[key] = {
        routes,
        payloadSchema: (def as any)?.payloadSchema || null,
        visibility: (def as any)?.visibility || "public",
        correlationKeys: Array.isArray((def as any)?.correlationKeys)
          ? (def as any).correlationKeys
          : [],
        perf: (def as any)?.perf || {},
        notes: (def as any)?.notes || "",
      };
    }
  }
  return { version: "1.0.0", topics } as any;
}

// Minimal in-memory catalogs for tests (avoids file I/O)
const catalogs = [
  {
    topics: {
      "test.route": {
        routes: [{ pluginId: "P1", sequenceId: "S1" }],
      },
      "test.notify": {
        routes: [],
      },
    },
  },
];

// Fake conductor capture
function makeConductorCapture() {
  const calls: any[] = [];
  return {
    play: (pid: string, sid: string, payload: any) => {
      calls.push({ pid, sid, payload });
      return Promise.resolve();
    },
    calls,
  } as any;
}

describe("EventRouter routing", () => {
  beforeAll(async () => {
    // Inject topics for this test run
    const manifest = buildTopicsManifest(catalogs as any);
    // @ts-expect-error test-only injection
    const mod = await import("../../src/core/manifests/topicsManifest");
    // @ts-expect-error override internals for test
    mod.__setTopics?.(manifest.topics);
    await EventRouter.init();
  });

  it("routes publish() to conductor.play for topics with routes", async () => {
    const conductor = makeConductorCapture();
    await EventRouter.publish("test.route", { foo: 1 }, conductor);
    expect(conductor.calls.length).toBe(1);
    expect(conductor.calls[0]).toEqual({
      pid: "P1",
      sid: "S1",
      payload: { foo: 1 },
    });
  });

  it("does not call conductor.play for notify-only topics, but notifies subscribers", async () => {
    const conductor = makeConductorCapture();
    let observed: any = null;
    const unsub = EventRouter.subscribe("test.notify", (p) => (observed = p));
    await EventRouter.publish("test.notify", { bar: 2 }, conductor);
    unsub();

    expect(conductor.calls.length).toBe(0);
    expect(observed).toEqual({ bar: 2 });
  });
});
