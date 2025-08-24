/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  enrichWithContainerContext,
  createContainerDataBaton,
  logDataBaton,
  playWithContainerTelemetry,
} from "../../plugins/container-component/utils/telemetry";

describe("Container telemetry utilities", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="outer-container" data-role="container" data-container-type="layout" style="
        position: relative;
        width: 400px;
        height: 300px;
        padding: 20px;
      ">
        <div id="inner-container" data-role="container" data-container-type="widget" style="
          position: absolute;
          left: 50px;
          top: 30px;
          width: 200px;
          height: 150px;
          padding: 10px;
        ">
          <div id="test-node" style="
            position: absolute;
            left: 25px;
            top: 15px;
            width: 40px;
            height: 20px;
          ">Test Node</div>
        </div>
      </div>
      <div id="canvas-node" style="
        position: absolute;
        left: 500px;
        top: 100px;
        width: 40px;
        height: 20px;
      ">Canvas Node</div>
    `;
  });

  describe("enrichWithContainerContext", () => {
    it("enriches payload with container context for nested element", () => {
      const node = document.getElementById("test-node")!;
      const innerContainer = document.getElementById("inner-container")!;

      // Mock getBoundingClientRect
      node.getBoundingClientRect = () =>
        ({
          left: 135, // 50 + 10 + 25 (outer + inner padding + node left)
          top: 55, // 30 + 10 + 15 (outer + inner padding + node top)
          right: 175,
          bottom: 75,
          width: 40,
          height: 20,
        } as DOMRect);

      innerContainer.getBoundingClientRect = () =>
        ({
          left: 70, // 20 + 50 (outer padding + inner left)
          top: 50, // 20 + 30 (outer padding + inner top)
          right: 270,
          bottom: 200,
          width: 200,
          height: 150,
        } as DOMRect);

      const basePayload = {
        event: "test:event",
        nodeId: "test-node",
      };

      const enriched = enrichWithContainerContext(node, basePayload);

      expect(enriched.event).toBe("test:event");
      expect(enriched.nodeId).toBe("test-node");
      expect(enriched.timestamp).toBeTypeOf("number");
      expect(enriched.container).toBeDefined();
      expect(enriched.container?.containerId).toBe("inner-container");
      expect(enriched.container?.containerType).toBe("widget");
      expect(enriched.container?.containerDepth).toBe(2); // nested in outer-container
      expect(enriched.container?.containerPath).toEqual([
        "inner-container",
        "outer-container",
      ]);
      expect(enriched.container?.localPosition).toBeDefined();
      expect(enriched.container?.globalPosition).toBeDefined();
    });

    it("handles elements not in containers", () => {
      const node = document.getElementById("canvas-node")!;

      node.getBoundingClientRect = () =>
        ({
          left: 500,
          top: 100,
          right: 540,
          bottom: 120,
          width: 40,
          height: 20,
        } as DOMRect);

      const enriched = enrichWithContainerContext(node, {
        event: "canvas:event",
      });

      expect(enriched.event).toBe("canvas:event");
      expect(enriched.container).toBeUndefined();
    });
  });

  describe("createContainerDataBaton", () => {
    it("creates baton with container context", () => {
      const node = document.getElementById("test-node")!;
      const innerContainer = document.getElementById("inner-container")!;

      // Mock getBoundingClientRect
      node.getBoundingClientRect = () =>
        ({
          left: 135,
          top: 55,
          right: 175,
          bottom: 75,
          width: 40,
          height: 20,
        } as DOMRect);

      innerContainer.getBoundingClientRect = () =>
        ({
          left: 70,
          top: 50,
          right: 270,
          bottom: 200,
          width: 200,
          height: 150,
        } as DOMRect);

      const baton = createContainerDataBaton(
        "container:test:event",
        "test-node",
        "inner-container",
        { customData: "test" }
      );

      expect(baton.event).toBe("container:test:event");
      expect(baton.nodeId).toBe("test-node");
      expect(baton.customData).toBe("test");
      expect(baton.container?.containerId).toBe("inner-container");
      expect(baton.container?.containerType).toBe("widget");
    });

    it("handles missing elements gracefully", () => {
      const baton = createContainerDataBaton(
        "container:missing:event",
        "missing-node",
        "missing-container"
      );

      expect(baton.event).toBe("container:missing:event");
      expect(baton.nodeId).toBe("missing-node");
      expect(baton.container).toBeUndefined();
    });
  });

  describe("logDataBaton", () => {
    it("logs to console in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const baton = {
        event: "test:event",
        timestamp: Date.now(),
        nodeId: "test-node",
      };

      logDataBaton(baton);

      expect(consoleSpy).toHaveBeenCalledWith(
        "📊 DataBaton:",
        expect.objectContaining({
          event: "test:event",
          nodeId: "test-node",
        })
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("playWithContainerTelemetry", () => {
    it("enhances conductor play with telemetry", () => {
      const node = document.getElementById("test-node")!;
      const conductor = {
        play: vi.fn(),
      };

      // Mock getBoundingClientRect
      node.getBoundingClientRect = () =>
        ({
          left: 135,
          top: 55,
          right: 175,
          bottom: 75,
          width: 40,
          height: 20,
        } as DOMRect);

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      playWithContainerTelemetry(
        conductor,
        "TestPlugin",
        "test-symphony",
        { originalData: "test" },
        node
      );

      expect(conductor.play).toHaveBeenCalledWith(
        "TestPlugin",
        "test-symphony",
        expect.objectContaining({
          originalData: "test",
          _telemetry: expect.objectContaining({
            event: "TestPlugin:test-symphony",
            nodeId: "test-node",
            pluginId: "TestPlugin",
            sequenceId: "test-symphony",
          }),
        })
      );

      expect(consoleSpy).toHaveBeenCalled();
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("handles missing conductor gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      playWithContainerTelemetry(null, "TestPlugin", "test-symphony", {
        data: "test",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Conductor not available for telemetry-enhanced play"
      );

      consoleSpy.mockRestore();
    });
  });
});
