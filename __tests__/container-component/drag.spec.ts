/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers } from "../../plugins/container-component/symphonies/drag/drag.symphony";

describe("Container component drag handlers", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container" data-role="container" style="
        position: relative;
        width: 300px;
        height: 200px;
        padding: 10px;
        overflow: auto;
      ">
        <div id="test-node" style="
          position: absolute;
          left: 50px;
          top: 30px;
          width: 40px;
          height: 20px;
        ">Test Node</div>
      </div>
    `;
  });

  describe("startDrag", () => {
    it("initializes drag state and adds visual feedback", () => {
      const ctx: any = {};
      const data = {
        nodeId: "test-node",
        containerId: "test-container",
        position: { x: 50, y: 30 },
      };

      const result = handlers.startDrag(data, ctx);

      expect(result.ok).toBe(true);
      expect(ctx.payload.dragState).toEqual({
        nodeId: "test-node",
        containerId: "test-container",
        startPosition: { x: 50, y: 30 },
        isDragging: true,
      });

      const node = document.getElementById("test-node")!;
      expect(node.style.zIndex).toBe("1000");
      expect(node.classList.contains("rx-dragging")).toBe(true);
    });

    it("throws error for missing container or node", () => {
      const ctx: any = {};
      const data = {
        nodeId: "missing-node",
        containerId: "test-container",
        position: { x: 0, y: 0 },
      };

      expect(() => handlers.startDrag(data, ctx)).toThrow(
        "Container drag start: missing container(test-container) or node(missing-node)"
      );
    });
  });

  describe("updatePosition", () => {
    it("updates node position with clamping", () => {
      const container = document.getElementById("test-container")!;
      const node = document.getElementById("test-node")!;
      
      // Mock getBoundingClientRect for container
      container.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 300,
        bottom: 200,
        width: 300,
        height: 200,
      } as DOMRect);

      const ctx: any = { payload: { dragState: {} } };
      const data = {
        nodeId: "test-node",
        containerId: "test-container",
        position: { x: 100, y: 80 },
      };

      const result = handlers.updatePosition(data, ctx);

      expect(result.ok).toBe(true);
      expect(node.style.position).toBe("absolute");
      expect(ctx.payload.dragState.currentPosition).toBeDefined();
    });

    it("handles missing container gracefully", () => {
      const ctx: any = {};
      const data = {
        nodeId: "test-node",
        containerId: "missing-container",
        position: { x: 100, y: 80 },
      };

      const result = handlers.updatePosition(data, ctx);
      expect(result.ok).toBe(false);
    });
  });

  describe("endDrag", () => {
    it("removes visual feedback and clears drag state", () => {
      const node = document.getElementById("test-node")!;
      node.style.zIndex = "1000";
      node.classList.add("rx-dragging");

      const ctx: any = {
        payload: {
          dragState: { isDragging: true },
        },
      };
      const data = { nodeId: "test-node" };

      const result = handlers.endDrag(data, ctx);

      expect(result.ok).toBe(true);
      expect(node.style.zIndex).toBe("");
      expect(node.classList.contains("rx-dragging")).toBe(false);
      expect(ctx.payload.dragState.isDragging).toBe(false);
    });

    it("handles missing node gracefully", () => {
      const ctx: any = {};
      const data = { nodeId: "missing-node" };

      const result = handlers.endDrag(data, ctx);
      expect(result.ok).toBe(false);
    });
  });
});
