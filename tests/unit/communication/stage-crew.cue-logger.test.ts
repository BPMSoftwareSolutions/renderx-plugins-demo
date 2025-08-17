import { TestEnvironment } from "../../utils/test-helpers";

// Use a temp file in ./.logs for tests
const path = require("path");
const fs = require("fs");

describe("StageCueLogger", () => {
  afterEach(() => TestEnvironment.cleanup());

  test("writes JSONL lines to a file when stage:cue fires", async () => {
    const logsDir = path.resolve(".logs");
    try { fs.mkdirSync(logsDir, { recursive: true }); } catch {}
    const filePath = path.join(logsDir, `mc-stage-cues-test.log`);
    try { fs.unlinkSync(filePath); } catch {}

    const eventBus = TestEnvironment.createEventBus();
    const { StageCueLogger } = await import("../../../modules/communication/sequences/stage/StageCueLogger");
    const logger = new StageCueLogger(eventBus as any, filePath);
    logger.init();

    const conductor = TestEnvironment.createMusicalConductor(eventBus as any);

    const sequence: any = {
      id: "stage-logger",
      name: "stage-logger",
      movements: [
        {
          id: "m1",
          name: "m1",
          beats: [
            { beat: 1, event: "go", handler: "h", timing: "immediate" },
          ],
        },
      ],
      events: { triggers: ["go"], emits: ["go"] },
      category: "system",
    };

    const handlers: any = {
      h: (_d: any, ctx: any) => {
        const txn = ctx.stageCrew.beginBeat("corr-log-1", {});
        txn.update("#not-present", { classes: { add: ["noop"] } });
        txn.commit();
      },
    };

    await conductor.mount(sequence, handlers, sequence.id);
    await conductor.play(sequence.id, sequence.id, {});

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.trim().split(/\r?\n/);
    expect(lines.length).toBeGreaterThanOrEqual(1);

    const obj = JSON.parse(lines[0]);
    expect(obj.correlationId).toBe("corr-log-1");
    expect(Array.isArray(obj.operations)).toBe(true);
  });
});

