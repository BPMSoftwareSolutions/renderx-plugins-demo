import { TestEnvironment } from "../../utils/test-helpers";

/**
 * Verifies ctx.logger.log routes through ConductorLogger with handler prefix
 */
describe("Plugin ctx.logger.log exposure", () => {
  afterEach(() => TestEnvironment.cleanup());

  test("ctx.logger.log prints via ConductorLogger", async () => {
    const bus = TestEnvironment.createEventBus();
    const conductor = TestEnvironment.createMusicalConductor(bus as any);

    const seq: any = {
      id: "plug-logger",
      name: "plug-logger",
      movements: [
        { name: "m1", beats: [{ beat: 1, event: "go", handler: "h", timing: "immediate" }] },
      ],
      events: { triggers: ["go"], emits: ["go"] },
      category: "system",
    };

    const logs: string[] = [];
    const spy = jest.spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });

    const handlers: any = {
      h: (_d: any, ctx: any) => {
        ctx.logger.log("hello", 42);
      },
    };

    await conductor.mount(seq, handlers, seq.id);
    await conductor.play(seq.id, seq.id, {});

    spy.mockRestore();
    const match = logs.some((l) => /🧩 plug-logger\.h/.test(l) && /hello/.test(l) && /42/.test(l));
    expect(match).toBe(true);
  });
});

