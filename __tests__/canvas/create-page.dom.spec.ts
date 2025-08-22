/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";

import { onDropForTest } from "../../plugins/canvas/ui/CanvasDrop";

// This ensures Canvas UI does not render nodes; stage-crew/DOM handler is responsible

describe("CanvasPage drop orchestration (no UI node rendering)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas"></div>';
  });

  it("forwards to drop symphony and does not render React nodes directly", async () => {
    const calls: any[] = [];
    const conductor = { play: vi.fn((a: string, b: string) => calls.push([a, b])) } as any;

    const fakeEvent: any = {
      preventDefault: vi.fn(),
      dataTransfer: { getData: vi.fn(() => JSON.stringify({ component: { template: { tag: "button" } } })) },
      clientX: 10, clientY: 20,
      currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
    };

    await onDropForTest(fakeEvent, conductor);

    const found = calls.find((c) => c[0] === "LibraryComponentDropPlugin" && c[1] === "library-component-drop-symphony");
    expect(found).toBeTruthy();

    // The UI should not render anything; container remains empty until create beat runs
    expect(document.querySelector("#rx-canvas")!.children.length).toBe(0);
  });
});

