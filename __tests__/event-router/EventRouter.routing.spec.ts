import { describe, it, expect, beforeAll } from "vitest";
import { EventRouter } from "../../src/EventRouter";
import { buildTopicsManifest } from "../../scripts/generate-topics-manifest.js";

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
    const mod = await import("../../src/topicsManifest");
    // @ts-expect-error override internals for test
    mod.__setTopics?.(manifest.topics);
    await EventRouter.init();
  });

  it("routes publish() to conductor.play for topics with routes", async () => {
    const conductor = makeConductorCapture();
    await EventRouter.publish(
      "test.route",
      { foo: 1 },
      conductor
    );
    expect(conductor.calls.length).toBe(1);
    expect(conductor.calls[0]).toEqual({ pid: "P1", sid: "S1", payload: { foo: 1 } });
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

