import { describe, it, expect, vi } from "vitest";
import { registerCssForComponents } from "packages/renderx-plugin-library/src/ui/LibraryPanel";

vi.mock("@renderx-plugins/host-sdk", async (orig) => {
  const mod = await (orig as any)();
  return {
    ...mod,
    EventRouter: {
      publish: vi.fn(async () => {}),
    },
  };
});

import { EventRouter } from "@renderx-plugins/host-sdk";

describe("@renderx-plugins/library  registerCssForComponents (host wrapper)", () => {
  it("publishes edit+create once per class and supports css from ui.styles.css", async () => {
    const items = [
      { template: { css: ".rx-button{}", classes: ["rx-button", "rx-comp"] }, metadata: { type: "button" } },
      { template: { css: ".rx-button{}", classes: ["rx-button"] }, metadata: { type: "button" } },
      { ui: { styles: { css: ".rx-card{}" } }, metadata: { type: "card" } },
    ];

    const conductor = {} as any;
    const spy = vi.spyOn(EventRouter, "publish");

    await registerCssForComponents(items as any, conductor);

    const topics = spy.mock.calls.map(c => c[0]);
    expect(topics).toEqual(expect.arrayContaining([
      "control.panel.css.edit.requested",
      "control.panel.css.create.requested",
    ]));

    const createIds = spy.mock.calls
      .filter(c => c[0] === "control.panel.css.create.requested")
      .map(([, payload]) => (payload as any).id);
    const unique = new Set(createIds);
    expect(unique.size).toBe(createIds.length);
  });
});

