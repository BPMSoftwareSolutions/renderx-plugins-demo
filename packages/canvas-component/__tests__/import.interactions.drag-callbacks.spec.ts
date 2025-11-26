/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock host SDK with spy for EventRouter.publish
vi.mock("@renderx-plugins/host-sdk", () => ({
  EventRouter: {
    publish: vi.fn().mockResolvedValue(undefined),
  },
}));

import { EventRouter } from "@renderx-plugins/host-sdk";
import { attachStandardImportInteractions } from "../src/symphonies/create/create.from-import";

describe("attachStandardImportInteractions forwards drag positions", () => {
  let _ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes drag.move with { id, position }", async () => {
    const payload: any = {};
    const _ctx: any = { conductor: {} };
    attachStandardImportInteractions(payload, ctx);

    const id = "rx-node-abc";
    const position = { x: 10, y: 20 };
    // Simulate drag move callback from createNode's attachDrag
    payload.onDragMove?.({ id, position, delta: { x: 1, y: 2 } });

    expect(EventRouter.publish).toHaveBeenCalledWith(
      "canvas.component.drag.move",
      { id, position },
      ctx.conductor
    );
  });

  it("publishes drag.end with { id, position } mapped from finalPosition when present", async () => {
    const payload: any = {};
    const _ctx: any = { conductor: {} };
    attachStandardImportInteractions(payload, ctx);

    const id = "rx-node-xyz";
    const finalPosition = { x: 55, y: 77 };
    payload.onDragEnd?.({ id, finalPosition, totalDelta: { x: 5, y: 7 } });

    expect(EventRouter.publish).toHaveBeenCalledWith(
      "canvas.component.drag.end",
      { id, position: finalPosition, correlationId: undefined },
      ctx.conductor
    );
  });
});

