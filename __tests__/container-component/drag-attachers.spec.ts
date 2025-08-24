/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { attachContainerAwareDrag, attachContainerAwareSelection } from "../../plugins/container-component/utils/drag-attachers";
import { initInteractionManifest } from "../../src/interactionManifest";

describe("Container-aware drag attachers", () => {
  beforeEach(async () => {
    await initInteractionManifest();
    document.body.innerHTML = `
      <div id="canvas" style="position: relative; width: 800px; height: 600px;">
        <div id="container-1" data-role="container" style="
          position: absolute;
          left: 100px;
          top: 50px;
          width: 300px;
          height: 200px;
          padding: 10px;
        ">
          <div id="node-in-container" style="
            position: absolute;
            left: 20px;
            top: 15px;
            width: 40px;
            height: 20px;
          ">Container Node</div>
        </div>
        <div id="node-on-canvas" style="
          position: absolute;
          left: 500px;
          top: 100px;
          width: 40px;
          height: 20px;
        ">Canvas Node</div>
      </div>
    `;
  });

  describe("attachContainerAwareDrag", () => {
    it("routes container node drag to container.component.drag handlers", () => {
      const canvas = document.getElementById("canvas")!;
      const container = document.getElementById("container-1")!;
      const node = document.getElementById("node-in-container")!;
      
      const conductor = {
        play: vi.fn(),
      };

      const callbacks = {
        onDragStart: vi.fn(),
        onDragMove: vi.fn(),
        onDragEnd: vi.fn(),
      };

      // Mock getBoundingClientRect
      container.getBoundingClientRect = () => ({
        left: 100,
        top: 50,
        right: 400,
        bottom: 250,
        width: 300,
        height: 200,
      } as DOMRect);

      node.getBoundingClientRect = () => ({
        left: 130, // 100 + 10 (padding) + 20 (left)
        top: 75,   // 50 + 10 (padding) + 15 (top)
        right: 170,
        bottom: 95,
        width: 40,
        height: 20,
      } as DOMRect);

      attachContainerAwareDrag(node, canvas, "node-in-container", callbacks, conductor);

      // Simulate mousedown
      const mouseDownEvent = new MouseEvent("mousedown", {
        button: 0,
        clientX: 150,
        clientY: 85,
      });
      node.dispatchEvent(mouseDownEvent);

      // Should route to container drag start
      expect(conductor.play).toHaveBeenCalledWith(
        "ContainerComponentPlugin",
        "container-component-drag-symphony",
        expect.objectContaining({
          nodeId: "node-in-container",
          containerId: "container-1",
          position: expect.any(Object),
        })
      );

      // Should also call callback
      expect(callbacks.onDragStart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "node-in-container",
          containerId: "container-1",
        })
      );
    });

    it("uses callbacks for canvas node drag (no container)", () => {
      const canvas = document.getElementById("canvas")!;
      const node = document.getElementById("node-on-canvas")!;
      
      const conductor = {
        play: vi.fn(),
      };

      const callbacks = {
        onDragStart: vi.fn(),
        onDragMove: vi.fn(),
        onDragEnd: vi.fn(),
      };

      // Mock getBoundingClientRect
      canvas.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
      } as DOMRect);

      node.getBoundingClientRect = () => ({
        left: 500,
        top: 100,
        right: 540,
        bottom: 120,
        width: 40,
        height: 20,
      } as DOMRect);

      attachContainerAwareDrag(node, canvas, "node-on-canvas", callbacks, conductor);

      // Simulate mousedown
      const mouseDownEvent = new MouseEvent("mousedown", {
        button: 0,
        clientX: 520,
        clientY: 110,
      });
      node.dispatchEvent(mouseDownEvent);

      // Should NOT route to container drag (no container found)
      expect(conductor.play).not.toHaveBeenCalled();

      // Should call callback with no containerId
      expect(callbacks.onDragStart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "node-on-canvas",
          containerId: undefined,
        })
      );
    });
  });

  describe("attachContainerAwareSelection", () => {
    it("routes container node selection to container.component.select", () => {
      const node = document.getElementById("node-in-container")!;
      
      const conductor = {
        play: vi.fn(),
      };

      const onSelected = vi.fn();

      attachContainerAwareSelection(node, "node-in-container", conductor, onSelected);

      // Simulate click
      const clickEvent = new MouseEvent("click");
      node.dispatchEvent(clickEvent);

      // Should route to container select
      expect(conductor.play).toHaveBeenCalledWith(
        "ContainerComponentPlugin",
        "container-component-select-symphony",
        expect.objectContaining({
          nodeId: "node-in-container",
          containerId: "container-1",
        })
      );

      // Should also call callback
      expect(onSelected).toHaveBeenCalledWith({
        id: "node-in-container",
        containerId: "container-1",
      });
    });

    it("handles canvas node selection (no container routing)", () => {
      const node = document.getElementById("node-on-canvas")!;
      
      const conductor = {
        play: vi.fn(),
      };

      const onSelected = vi.fn();

      attachContainerAwareSelection(node, "node-on-canvas", conductor, onSelected);

      // Simulate click
      const clickEvent = new MouseEvent("click");
      node.dispatchEvent(clickEvent);

      // Should NOT route to container select (no container found)
      expect(conductor.play).not.toHaveBeenCalled();

      // Should call callback with no containerId
      expect(onSelected).toHaveBeenCalledWith({
        id: "node-on-canvas",
        containerId: undefined,
      });
    });
  });
});
