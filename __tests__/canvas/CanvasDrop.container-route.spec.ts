/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { onDropForTest } from "../../plugins/canvas/ui/CanvasDrop";
import { resolveInteraction } from "../../src/interactionManifest";

function makeConductor() {
  const calls: any[] = [];
  return {
    calls,
    play(pluginId: string, sequenceId: string, payload: any) {
      calls.push([pluginId, sequenceId, payload]);
    },
  } as any;
}

describe("CanvasDrop routes to library.container.drop when dropping onto a container", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("selects container route and passes containerId with container-relative position", async () => {
    const canvas = document.getElementById("rx-canvas")! as HTMLElement;
    // Create a container inside the canvas
    const container = document.createElement("div");
    container.id = "rx-node-ct1";
    container.dataset.role = "container";
    container.style.position = "absolute";
    // Simulate container offset within canvas by mocking its rect
    (container as any).getBoundingClientRect = () => ({ left: 100, top: 50, width: 200, height: 150, right: 300, bottom: 200, x: 100, y: 50, toJSON() {} });
    canvas.appendChild(container);
    // Canvas rect
    (canvas as any).getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON() {} });

    // Fake drop event targeting the container
    const e: any = {
      preventDefault() {},
      clientX: 125, // 25px into the container
      clientY: 80,  // 30px into the container
      currentTarget: canvas,
      target: container,
      dataTransfer: {
        getData: (type: string) =>
          type === "application/rx-component"
            ? JSON.stringify({ component: { template: { tag: "button", classes: ["rx-comp", "rx-button"], dimensions: { width: 100, height: 40 } } } })
            : "",
      },
    };

    const conductor = makeConductor();

    // Ensure the manifest has our route mapping available
    const r = resolveInteraction("library.container.drop");
    expect(r.sequenceId).toBe("library-component-container-drop-symphony");

    await onDropForTest(e, conductor);

    const found = conductor.calls.find(
      (c) => c[0] === "LibraryComponentDropPlugin" && c[1] === "library-component-container-drop-symphony"
    );
    expect(found).toBeTruthy();
    const payload = found[2];
    expect(payload.containerId).toBe("rx-node-ct1");
    expect(payload.position).toEqual({ x: 25, y: 30 }); // container-relative
  });
});

