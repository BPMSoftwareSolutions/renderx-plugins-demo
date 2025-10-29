/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as uiHandlers } from "../src/symphonies/ui/ui.symphony";

function performanceNowShim() {
  if (
    typeof performance === "undefined" ||
    typeof (performance as any).now !== "function"
  ) {
    (globalThis as any).performance = { now: () => Date.now() } as any;
  }
}

describe("Control Panel UI Init — batched iterator", () => {
  beforeEach(() => {
    performanceNowShim();
  });

  it("records sub-beat telemetry for the five init steps when run via iterator", async () => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const ctx: any = { payload: {}, logger, conductor: { play: vi.fn() } };

    // Run the iterator handler directly
    await uiHandlers.initMovement({ componentTypes: ["button", "input"] }, ctx);

    const telemetry = ctx.payload.uiInitTelemetry?.subBeats || [];
    const events = telemetry.map((t: any) => t.event);

    expect(telemetry.length).toBe(5);
    expect(events).toEqual([
      "control:panel:ui:config:load",
      "control:panel:ui:resolver:init",
      "control:panel:ui:schemas:load",
      "control:panel:ui:observers:register",
      "control:panel:ui:ready:notify",
    ]);
    expect(telemetry.every((t: any) => typeof t.dur === "number")).toBe(true);
    expect(telemetry.every((t: any) => t.status === "ok")).toBe(true);
  });
});

