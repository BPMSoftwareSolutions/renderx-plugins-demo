/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { onDropForTest } from "../../plugins/canvas/ui/CanvasDrop";
import { initInteractionManifest } from "../../src/interactionManifest";

/**
 * Verifies that dropping from Library into a container element routes to library.container.drop
 * and that position is computed relative to the container's bounding rect.
 */
describe("library container drop routes correctly", () => {
  beforeEach(async () => {
    await initInteractionManifest();
    document.body.innerHTML = `
      <div id="canvas-root">
        <div id="rx-canvas" style="position:relative; width:800px; height:600px;">
          <div id="container-1" data-role="container" style="position:absolute; left:100px; top:50px; width:300px; height:200px; padding:0;"></div>
        </div>
      </div>`;
  });

  it("routes to library.container.drop and computes local position", async () => {
    const calls: any[] = [];
    const conductor = {
      play: vi.fn((pluginId: string, seqId: string, payload: any) =>
        calls.push([pluginId, seqId, payload])
      ),
    } as any;

    const containerEl = document.getElementById("container-1")!;
    // Mock getBoundingClientRect for container and canvas root to stable values
    const origGetBcr = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      if ((this as any).id === "container-1") {
        return {
          left: 100,
          top: 50,
          right: 400,
          bottom: 250,
          width: 300,
          height: 200,
        } as any;
      }
      if ((this as any).id === "rx-canvas") {
        return {
          left: 0,
          top: 0,
          right: 800,
          bottom: 600,
          width: 800,
          height: 600,
        } as any;
      }
      return origGetBcr.apply(this);
    } as any;

    const fakeEvent: any = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => JSON.stringify({ component: { id: "x" } })),
      },
      clientX: 150, // 50px inside container from left
      clientY: 90, // 40px inside container from top
      currentTarget: document.getElementById("rx-canvas")!,
      target: containerEl,
    };

    try {
      await onDropForTest(fakeEvent, conductor);
    } finally {
      // restore
      Element.prototype.getBoundingClientRect = origGetBcr;
    }

    // Find container drop call
    const found = calls.find((c) => c[1] === "library-container-drop-symphony");
    expect(found).toBeTruthy();
    const payload = found?.[2];
    expect(payload?.position).toEqual({ x: 50, y: 40 });
    expect(payload?.containerId).toBe("container-1");
  });
});
