import { TestEnvironment } from "@test-utils/test-helpers";
import { loadRenderXPlugin } from "@test-utils/renderx-plugin-loader";

// This test validates the expected log signature for Library.drop -> Canvas.create
// Uses the real MusicalConductor with CIA plugins registered

describe("Drop→Create log signature", () => {
  test("logs PluginInterfaceFacade.play, forwarding, Canvas.create, and DataBaton payload", async () => {
    const eventBus = TestEnvironment.createEventBus();
    const conductor = TestEnvironment.createMusicalConductor(eventBus as any);

    // Register CIA plugins via manifest (unit runner loads local files via jest.cia-plugins.setup.ts)
    // Manually mount the two plugins we care about using the same loader used elsewhere in unit tests
    const lib: any = loadRenderXPlugin(
      "RenderX/public/plugins/library-drop-plugin/index.js"
    );
    const create: any = loadRenderXPlugin(
      "RenderX/public/plugins/canvas-create-plugin/index.js"
    );
    await conductor.mount(lib.sequence, lib.handlers, lib.sequence.id);
    await conductor.mount(create.sequence, create.handlers, create.sequence.id);

    // Capture console logs and conductor logger events
    (global as any).testUtils.restoreConsole();
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args: any[]) => {
      try {
        logs.push(String(args[0]));
      } catch {}
      orig.apply(console, args as any);
    };
    const unsubscribe = eventBus.subscribe(
      "musical-conductor:log",
      (evt: any) => {
        try {
          logs.push(String((evt?.message || [])[0]));
        } catch {}
      }
    );

    await conductor.play(
      "Library.component-drop-symphony",
      "Library.component-drop-symphony",
      {
        coordinates: { x: 10, y: 20 },
        dragData: {
          component: { metadata: { type: "button", name: "Button" } },
        },
        // Provide onComponentCreated to ensure Canvas.create path exercises callback
        onComponentCreated: () => {},
      }
    );

    // Allow timing for synchronized and delayed beats and processing to complete
    await new Promise((r) => setTimeout(r, 1200));

    // cleanup subscription
    try {
      unsubscribe();
    } catch {}

    // Assertions: look for key lines
    expect(
      logs.some((l) =>
        l.includes(
          "PluginInterfaceFacade.play(): Library.component-drop-symphony"
        )
      )
    ).toBe(true);
    expect(
      logs.some((l) =>
        l.includes("Forwarding to Canvas.component-create-symphony")
      )
    ).toBe(true);
    expect(
      logs.some((l) =>
        l.includes(
          "PluginInterfaceFacade.play(): Canvas.component-create-symphony"
        )
      )
    ).toBe(true);
    expect(logs.some((l) => l.includes("Canvas.create"))).toBe(true);
    // DataBaton presence: either direct DataBaton log or ConductorCore baton line
    const batonFound =
      logs.some((l) => l.includes("DataBaton")) ||
      logs.some((l) => l.includes("Data Baton"));
    expect(batonFound).toBe(true);
  });
});
