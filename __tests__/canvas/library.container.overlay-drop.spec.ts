/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { onDropForTest } from "../../plugins/canvas/ui/CanvasDrop";
import { initInteractionManifest } from "../../src/interactionManifest";

describe("Library→Container drop when selection overlay is target (FAILING first)", () => {
  let conductor: any;

  beforeEach(async () => {
    await initInteractionManifest();
    conductor = { play: vi.fn() } as any;

    document.body.innerHTML = `
      <div id="canvas-root">
        <div id="rx-canvas" style="position: relative; width: 800px; height: 600px;">
          <div id="container-1" data-role="container" class="rx-container" style="
            position: absolute; left: 100px; top: 50px; width: 300px; height: 200px; padding: 10px;
          "></div>
          <div class="rx-selection-overlay" data-target-id="container-1" style="
            position: absolute; left: 100px; top: 50px; width: 300px; height: 200px; pointer-events: auto;
          "></div>
        </div>
      </div>
    `;
  });

  it("routes to library.container.drop when dropping over overlay targeting a container", async () => {
    const canvas = document.getElementById("rx-canvas")!;
    const container = document.getElementById("container-1")!;
    const overlay = document.querySelector(
      ".rx-selection-overlay"
    ) as HTMLElement;

    // Mock rects for stable coords
    canvas.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
      } as DOMRect);
    container.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 50,
        right: 400,
        bottom: 250,
        width: 300,
        height: 200,
      } as DOMRect);
    overlay.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 50,
        right: 400,
        bottom: 250,
        width: 300,
        height: 200,
      } as DOMRect);

    let createdNodeId: string | undefined;
    const onCreated = (node: any) => (createdNodeId = node.id);
    (conductor.play as any).mockImplementation(
      (pluginId: string, seqId: string, payload: any) => {
        // mimic immediate callback to simulate creation
        payload?.onComponentCreated?.({ id: "fake-node" });
      }
    );

    // Simulate dropping within the overlay bounds over the container
    const dropEvent: any = {
      preventDefault: () => {},
      dataTransfer: {
        getData: () =>
          JSON.stringify({
            component: {
              id: "rx-button",
              name: "Button",
              template: {
                tag: "button",
                text: "Click me",
                classes: ["rx-comp", "rx-button"],
              },
            },
          }),
      },
      clientX: 150,
      clientY: 90,
      currentTarget: canvas,
      target: overlay,
    };

    await onDropForTest(dropEvent, conductor, onCreated);

    // Assert we routed to the correct plugin/sequence with container context
    expect(conductor.play).toHaveBeenCalled();
    const [pluginId, sequenceId, payload] = (conductor.play as any).mock
      .calls[0];
    expect(pluginId).toBe("LibraryComponentDropPlugin");
    expect(sequenceId).toBe("library-container-drop-symphony");
    expect(payload.containerId).toBe("container-1");

    expect(createdNodeId).toBe("fake-node");
  });
});
