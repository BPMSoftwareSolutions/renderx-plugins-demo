import { describe, it, expect, beforeAll } from "vitest";
import { EventRouter } from "../../src/core/events/EventRouter";

function buildTopicsManifest(catalogs: any[]) {
  const topics: Record<string, any> = {};
  for (const cat of catalogs || []) {
    const t = (cat as any)?.topics || {};
    for (const [key, def] of Object.entries(t)) {
      const routes: any[] = [];
      if ((def as any)?.route) routes.push((def as any).route);
      if (Array.isArray((def as any)?.routes)) routes.push(...(def as any).routes);
      topics[key] = { routes, payloadSchema: null, visibility: "public", correlationKeys: [], perf: {}, notes: "" };
    }
  }
  return { version: "1.0.0", topics } as any;
}

const catalogs = [
  {
    topics: {
      "test.route": { routes: [{ pluginId: "P1", sequenceId: "S1" }] },
      "test.notify": { routes: [] },
    },
  },
];

function makeReentrantConductor(republishTopic: string) {
  const calls: any[] = [];
  let republished = false;
  return {
    calls,
    play: async (pid: string, sid: string, payload: any) => {
      calls.push({ pid, sid, payload });
      if (!republished) {
        republished = true;
        await EventRouter.publish(republishTopic, { from: "reentrant" }, (globalThis as any).conductor);
      }
    },
  } as any;
}

describe("EventRouter reentrancy guard (feedback loops)", () => {
  beforeAll(async () => {
    // Inject topics
    const manifest = buildTopicsManifest(catalogs as any);
    // @ts-expect-error test-only injection
    const mod = await import("../../src/core/manifests/topicsManifest");
    // @ts-expect-error override internals for test
    mod.__setTopics?.(manifest.topics);
    await EventRouter.init();
  });

  it("blocks immediate same-topic republish from within conductor.play (routes stage)", async () => {
    // Use a global to let nested publish reuse the same conductor
    (globalThis as any).conductor = makeReentrantConductor("test.route");

    // Without a guard, this would route twice (calls.length === 2)
    // With the guard, the inner publish should be no-op and we only route once.
    await EventRouter.publish("test.route", { test: 1 }, (globalThis as any).conductor);

    expect((globalThis as any).conductor.calls.length).toBe(1);
  });

  it("blocks immediate same-topic republish from a subscriber (notify stage)", async () => {
    const conductor = { play: async () => {} } as any;
    let republished = false;
    let observed = 0;
    const unsub = EventRouter.subscribe("test.notify", async () => {
      observed += 1;
      if (!republished) {
        republished = true;
        await EventRouter.publish("test.notify", { from: "subscriber" }, conductor);
      }
    });

    await EventRouter.publish("test.notify", { test: 2 }, conductor);
    unsub();

    // First delivery happened, inner publish was blocked, so observed only once.
    expect(observed).toBe(1);
  });
});

