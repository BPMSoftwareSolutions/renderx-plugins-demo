/* @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from "vitest";
import { EventRouter } from "../../src/core/events/EventRouter";

const LIBRARY_COMPONENT_DRAG_START_REQUESTED = "library.component.drag.start.requested" as const;
const LIBRARY_COMPONENT_DROP_REQUESTED = "library.component.drop.requested" as const;
const LIBRARY_CONTAINER_DROP_REQUESTED = "library.container.drop.requested" as const;

function makeConductorCapture() {
  const calls: any[] = [];
  return {
    calls,
    play: (pid: string, sid: string, payload: any) => {
      calls.push({ pid, sid, payload });
      return Promise.resolve();
    },
  } as any;
}

describe("Library topics route to the correct sequences via EventRouter", () => {
  beforeAll(async () => {
    await EventRouter.init();
  });

  it("routes drag.start.requested to LibraryComponentPlugin drag symphony", async () => {
    const conductor = makeConductorCapture();
    await EventRouter.publish(
      LIBRARY_COMPONENT_DRAG_START_REQUESTED,
      { event: "library:component:drag:start", domEvent: {}, component: { id: "btn" } },
      conductor
    );
    const hit = conductor.calls.find(
      (c: any) => c.pid === "LibraryComponentPlugin" && c.sid === "library-component-drag-symphony"
    );
    expect(hit).toBeTruthy();
  });

  it("routes component.drop.requested to LibraryComponentPlugin drop symphony", async () => {
    const conductor = makeConductorCapture();
    await EventRouter.publish(
      LIBRARY_COMPONENT_DROP_REQUESTED,
      { component: { id: "btn" }, position: { x: 10, y: 20 } },
      conductor
    );
    const hit = conductor.calls.find(
      (c: any) => c.pid === "LibraryComponentPlugin" && c.sid === "library-component-drop-symphony"
    );
    expect(hit).toBeTruthy();
  });

  it("routes container.drop.requested to LibraryComponentPlugin container-drop symphony", async () => {
    const conductor = makeConductorCapture();
    await EventRouter.publish(
      LIBRARY_CONTAINER_DROP_REQUESTED,
      { component: { id: "btn" }, position: { x: 10, y: 20 }, containerId: "ct-1" },
      conductor
    );
    const hit = conductor.calls.find(
      (c: any) => c.pid === "LibraryComponentPlugin" && c.sid === "library-component-container-drop-symphony"
    );
    expect(hit).toBeTruthy();
  });
});

