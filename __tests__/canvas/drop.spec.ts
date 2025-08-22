/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";

// Import from CanvasDrop (no React, no conductor hook) to avoid SSR asserts
import { onDropForTest } from "../../plugins/canvas/ui/CanvasDrop";

// This test enforces that Canvas drop triggers the LibraryComponentPlugin drop symphony

describe("canvas drop triggers library-component drop sequence", () => {
  it("calls conductor.play with LibraryComponentPlugin and library-component-drop-symphony", async () => {
    const calls: any[] = [];
    const conductor = {
      play: vi.fn((pluginId: string, seqId: string) => calls.push([pluginId, seqId])),
    } as any;

    const fakeEvent: any = {
      preventDefault: vi.fn(),
      dataTransfer: { getData: vi.fn(() => JSON.stringify({ component: { id: "x" } })) },
      clientX: 10,
      clientY: 20,
      currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
    };

    await onDropForTest(fakeEvent, conductor);

    const found = calls.find((c) => c[0] === "LibraryComponentDropPlugin" && c[1] === "library-component-drop-symphony");
    expect(found).toBeTruthy();
  });
});

