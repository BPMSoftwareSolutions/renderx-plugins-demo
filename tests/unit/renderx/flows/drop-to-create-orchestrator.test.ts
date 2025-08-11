import { loadRenderXPlugin } from "../../../utils/renderx-plugin-loader";
import { TestEnvironment } from "../../../utils/test-helpers";

const libraryPath = "RenderX/public/plugins/library-drop-plugin/index.js";
const createPath = "RenderX/public/plugins/canvas-create-plugin/index.js";

describe("Orchestrated Flow (real Conductor): Library.drop -> Canvas.create", () => {
  test("uses conductor.play (no local fallback); emits Canvas.create; invokes onComponentCreated", async () => {
    // Arrange real conductor + event bus
    const eventBus = TestEnvironment.createEventBus();
    const conductor = TestEnvironment.createMusicalConductor(eventBus as any);
    await conductor.registerCIAPlugins();

    // Capture conductor logs emitted by PluginManager logger
    const logs: string[] = [];
    eventBus.subscribe("musical-conductor:log", (evt: any) => {
      try {
        logs.push(String((evt?.message || [])[0]));
      } catch {}
    });

    const lib: any = loadRenderXPlugin(libraryPath);
    const create: any = loadRenderXPlugin(createPath);

    // Mount both plugins into real conductor
    await conductor.mount(lib.sequence, lib.handlers, lib.sequence.id);
    await conductor.mount(create.sequence, create.handlers, create.sequence.id);

    const onComponentCreated = jest.fn();

    // Act: play the library drop symphony via real conductor and wait for canvas:create beat
    await new Promise<void>(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubBeat();
        reject(new Error("timeout waiting for canvas:component:create beat"));
      }, 3000);

      const unsubBeat = eventBus.subscribe("beat-started", (evt: any) => {
        try {
          if (evt?.event === "canvas:component:create") {
            clearTimeout(timeout);
            unsubBeat();
            resolve();
          }
        } catch {}
      });

      await conductor.play(lib.sequence.id, lib.sequence.id, {
        coordinates: { x: 200, y: 120 },
        dragData: {
          component: { metadata: { type: "button", name: "Button" } },
        },
        onComponentCreated,
      });
    });

    // Assert: no local fallback should be logged
    const hasLocalFallback = logs.some((m) =>
      m.includes("Local create fallback")
    );
    expect(hasLocalFallback).toBe(false);

    // Assert: Canvas.create should be logged
    const hasCanvasCreate = logs.some((m) => m.includes("Canvas.create"));
    expect(hasCanvasCreate).toBe(true);

    // Assert: callback invoked
    expect(onComponentCreated).toHaveBeenCalledTimes(1);
    const createdArg = onComponentCreated.mock.calls[0][0];
    expect(String(createdArg.id)).toMatch(/^rx-comp-button-/);
    expect(String(createdArg.cssClass)).toMatch(/^rx-comp-button-/);
    expect(createdArg.type).toBe("button");
    expect(createdArg.position).toEqual({ x: 200, y: 120 });
  });
});
