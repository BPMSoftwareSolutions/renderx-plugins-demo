/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers } from "../../plugins/container-component/symphonies/select/select.symphony";

describe("Container component select handlers", () => {
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

  describe("selectComponent", () => {
    it("creates selection overlay and adds selected class", () => {
      const container = document.getElementById("test-container")!;
      const node = document.getElementById("test-node")!;
      
      // Mock getBoundingClientRect
      container.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 300,
        bottom: 200,
        width: 300,
        height: 200,
      } as DOMRect);
      
      node.getBoundingClientRect = () => ({
        left: 60, // 50 + 10 (container padding)
        top: 40,  // 30 + 10 (container padding)
        right: 100,
        bottom: 60,
        width: 40,
        height: 20,
      } as DOMRect);

      const ctx: any = {};
      const data = {
        nodeId: "test-node",
        containerId: "test-container",
      };

      const result = handlers.selectComponent(data, ctx);

      expect(result.ok).toBe(true);
      expect(result.selectedNodeId).toBe("test-node");
      expect(node.classList.contains("rx-selected")).toBe(true);
      
      // Check selection state
      expect(ctx.payload.selection).toBeDefined();
      expect(ctx.payload.selection.nodeId).toBe("test-node");
      expect(ctx.payload.selection.containerId).toBe("test-container");
      
      // Check overlay was created
      const overlay = container.querySelector(".rx-selection-overlay");
      expect(overlay).toBeTruthy();
      expect(overlay?.style.position).toBe("absolute");
    });

    it("throws error for missing container or node", () => {
      const ctx: any = {};
      const data = {
        nodeId: "missing-node",
        containerId: "test-container",
      };

      expect(() => handlers.selectComponent(data, ctx)).toThrow(
        "Container select: missing container(test-container) or node(missing-node)"
      );
    });
  });

  describe("clearSelection", () => {
    it("removes selected class and overlays", () => {
      const node = document.getElementById("test-node")!;
      node.classList.add("rx-selected");
      
      const overlay = document.createElement("div");
      overlay.className = "rx-selection-overlay";
      document.body.appendChild(overlay);

      const ctx: any = { payload: { selection: { nodeId: "test-node" } } };
      const result = handlers.clearSelection({}, ctx);

      expect(result.ok).toBe(true);
      expect(node.classList.contains("rx-selected")).toBe(false);
      expect(document.querySelector(".rx-selection-overlay")).toBeNull();
      expect(ctx.payload.selection).toBeNull();
    });
  });

  describe("updateSelectionOverlay", () => {
    it("updates existing overlay position", () => {
      const container = document.getElementById("test-container")!;
      const node = document.getElementById("test-node")!;
      
      // Create existing overlay
      const overlay = document.createElement("div");
      overlay.id = "test-overlay";
      overlay.className = "rx-selection-overlay";
      container.appendChild(overlay);

      // Mock getBoundingClientRect
      container.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 300,
        bottom: 200,
        width: 300,
        height: 200,
      } as DOMRect);
      
      node.getBoundingClientRect = () => ({
        left: 70, // Updated position
        top: 50,
        right: 110,
        bottom: 70,
        width: 40,
        height: 20,
      } as DOMRect);

      const ctx: any = {
        payload: {
          selection: { overlayId: "test-overlay" },
        },
      };
      const data = {
        nodeId: "test-node",
        containerId: "test-container",
      };

      const result = handlers.updateSelectionOverlay(data, ctx);

      expect(result.ok).toBe(true);
      expect(overlay.style.width).toBe("40px");
      expect(overlay.style.height).toBe("20px");
    });

    it("handles missing container gracefully", () => {
      const ctx: any = {};
      const data = {
        nodeId: "test-node",
        containerId: "missing-container",
      };

      const result = handlers.updateSelectionOverlay(data, ctx);
      expect(result.ok).toBe(false);
    });
  });
});
