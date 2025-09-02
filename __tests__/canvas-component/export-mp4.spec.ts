/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the MP4 encoder module before importing handlers
vi.mock(
  "../../plugins/canvas-component/symphonies/export/export.mp4-encoder",
  () => {
    const mockEncoder = {
      initialize: vi.fn().mockResolvedValue(undefined),
      addFrame: vi.fn(),
      finalize: vi
        .fn()
        .mockResolvedValue(new Blob(["fake-mp4"], { type: "video/mp4" })),
      setProgressCallback: vi.fn(),
      setCompleteCallback: vi.fn(),
      setErrorCallback: vi.fn(),
    };

    return {
      createMP4Encoder: vi.fn().mockResolvedValue(mockEncoder),
      WebCodecsMP4Encoder: vi.fn(() => mockEncoder),
      MediaRecorderMP4Encoder: vi.fn(() => mockEncoder),
      __mockEncoder: mockEncoder, // Export for test access
    };
  }
);

// Mock VideoEncoder for WebCodecs API tests
Object.defineProperty(window, "VideoEncoder", {
  value: vi.fn(() => ({
    configure: vi.fn(),
    encode: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  })),
  writable: true,
});

// Mock VideoFrame
Object.defineProperty(window, "VideoFrame", {
  value: vi.fn(() => ({
    close: vi.fn(),
  })),
  writable: true,
});

// Add isConfigSupported static method
(window.VideoEncoder as any).isConfigSupported = vi
  .fn()
  .mockResolvedValue({ supported: true });

describe("Export SVG to MP4", () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML =
      '<div id="rx-canvas" style="position: relative;"></div>';

    // Reset all mocks
    vi.clearAllMocks();
    vi.restoreAllMocks();

    // Mock URL methods for download
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock canvas getContext globally for JSDOM
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      fillStyle: "",
    }));

    // Mock document.createElement globally
    const originalCreateElement = document.createElement;
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            drawImage: vi.fn(),
            fillStyle: "",
          })),
        } as any;
      }
      if (tagName === "a") {
        return { href: "", download: "", click: vi.fn() } as any;
      }
      return originalCreateElement.call(document, tagName);
    });

    // Mock Image globally
    const originalImage = window.Image;
    (window as any).Image = vi.fn(() => {
      const img = new originalImage();
      Object.defineProperty(img, "src", {
        set: function (_value) {
          setTimeout(() => this.onload?.(), 0);
        },
      });
      return img;
    });

    // Mock XMLSerializer globally
    (window as any).XMLSerializer = vi.fn(() => ({
      serializeToString: vi.fn(() => "<svg><rect/></svg>"),
    }));
  });

  describe("Basic MP4 export functionality", () => {
    it("should export a simple SVG to MP4", async () => {
      // Setup test SVG
      const testSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      testSvg.id = "test-svg";
      testSvg.setAttribute("width", "200");
      testSvg.setAttribute("height", "150");
      testSvg.setAttribute("viewBox", "0 0 200 150");

      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", "10");
      rect.setAttribute("y", "10");
      rect.setAttribute("width", "180");
      rect.setAttribute("height", "130");
      rect.setAttribute("fill", "blue");
      testSvg.appendChild(rect);

      document.getElementById("rx-canvas")!.appendChild(testSvg);

      // All mocks are now set up globally in beforeEach

      // Import handler
      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      // Test payload
      const ctx = {
        payload: {
          targetId: "test-svg",
          options: { width: 200, height: 150 },
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      // Execute handler
      await exportMp4Handler({}, ctx);

      // Check for errors first
      if (ctx.payload.error) {
        console.error("Handler error:", ctx.payload.error);
      }

      // Get mock encoder
      const { __mockEncoder, createMP4Encoder } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4-encoder"
      );

      // Assertions
      expect(ctx.payload.error).toBeUndefined();
      expect(createMP4Encoder).toHaveBeenCalled();
      expect(__mockEncoder.initialize).toHaveBeenCalled();
      expect(__mockEncoder.addFrame).toHaveBeenCalled();
      expect(__mockEncoder.finalize).toHaveBeenCalled();
    });

    it("should handle missing target element", async () => {
      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "non-existent-svg",
          options: {},
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      expect(ctx.payload.error).toContain(
        'Element with ID "non-existent-svg" not found'
      );
    });

    it("should handle non-SVG elements", async () => {
      // Create a non-SVG element
      const testDiv = document.createElement("div");
      testDiv.id = "test-div";
      document.getElementById("rx-canvas")!.appendChild(testDiv);

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "test-div",
          options: {},
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      expect(ctx.payload.error).toContain(
        'Element "test-div" is not an SVG element'
      );
    });
  });

  describe("Animation keyframes", () => {
    it("should process rotation keyframes", async () => {
      // Setup animated SVG
      const testSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      testSvg.id = "anim-svg";
      testSvg.setAttribute("width", "200");
      testSvg.setAttribute("height", "200");

      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.id = "rotating-rect";
      rect.setAttribute("x", "90");
      rect.setAttribute("y", "90");
      rect.setAttribute("width", "20");
      rect.setAttribute("height", "20");
      rect.setAttribute("fill", "red");

      // Mock getBBox for rotation center calculation
      (rect as any).getBBox = vi.fn(() => ({
        x: 90,
        y: 90,
        width: 20,
        height: 20,
      }));

      testSvg.appendChild(rect);
      document.getElementById("rx-canvas")!.appendChild(testSvg);

      // Mock canvas and context
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          drawImage: vi.fn(),
        })),
      };
      const mockAnchor = { href: "", download: "", click: vi.fn() };

      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        if (tagName === "a") return mockAnchor as any;
        return document.createElement(tagName);
      });

      // Mock Image with auto-trigger onload
      const originalImage = window.Image;
      (window as any).Image = vi.fn(() => {
        const img = new originalImage();
        Object.defineProperty(img, "src", {
          set: function (_value) {
            setTimeout(() => this.onload?.(), 0);
          },
        });
        return img;
      });

      // Mock XMLSerializer
      (window as any).XMLSerializer = vi.fn(() => ({
        serializeToString: vi.fn(() => "<svg><rect/></svg>"),
      }));

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "anim-svg",
          options: {
            fps: 10,
            durationMs: 1000,
            animation: {
              keyframes: [
                {
                  selector: "#rotating-rect",
                  attr: "transform",
                  from: 0,
                  to: 360,
                  kind: "rotate",
                },
              ],
            },
          },
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      // Get mock encoder
      const { __mockEncoder } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4-encoder"
      );

      // Should generate multiple frames for animation
      expect(__mockEncoder.addFrame).toHaveBeenCalled();
      const frameCount = (__mockEncoder.addFrame as any).mock.calls.length;
      expect(frameCount).toBeGreaterThan(1); // Should have multiple frames for animation
    });

    it("should process scale keyframes", async () => {
      // Setup SVG with scaling element
      const testSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      testSvg.id = "scale-svg";
      testSvg.setAttribute("width", "200");
      testSvg.setAttribute("height", "200");

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.id = "scaling-circle";
      circle.setAttribute("cx", "100");
      circle.setAttribute("cy", "100");
      circle.setAttribute("r", "20");
      circle.setAttribute("fill", "green");

      // Mock getBBox for scale center calculation
      (circle as any).getBBox = vi.fn(() => ({
        x: 80,
        y: 80,
        width: 40,
        height: 40,
      }));

      testSvg.appendChild(circle);
      document.getElementById("rx-canvas")!.appendChild(testSvg);

      // Mock canvas and context
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          drawImage: vi.fn(),
        })),
      };
      const mockAnchor = { href: "", download: "", click: vi.fn() };

      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        if (tagName === "a") return mockAnchor as any;
        return document.createElement(tagName);
      });

      // Mock Image
      const originalImage = window.Image;
      (window as any).Image = vi.fn(() => {
        const img = new originalImage();
        Object.defineProperty(img, "src", {
          set: function (_value) {
            setTimeout(() => this.onload?.(), 0);
          },
        });
        return img;
      });

      // Mock XMLSerializer
      (window as any).XMLSerializer = vi.fn(() => ({
        serializeToString: vi.fn(() => "<svg><circle/></svg>"),
      }));

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "scale-svg",
          options: {
            fps: 5,
            durationMs: 500,
            animation: {
              keyframes: [
                {
                  selector: "#scaling-circle",
                  attr: "transform",
                  from: 1.0,
                  to: 2.0,
                  kind: "scale",
                },
              ],
            },
          },
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      // Get mock encoder
      const { __mockEncoder } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4-encoder"
      );

      // Should generate multiple frames for animation
      expect(__mockEncoder.addFrame).toHaveBeenCalled();
      const frameCount = (__mockEncoder.addFrame as any).mock.calls.length;
      expect(frameCount).toBeGreaterThanOrEqual(2); // Should have multiple frames
    });
  });

  describe("MP4 encoder integration", () => {
    it("should use higher default fps for MP4 (30fps vs 5fps for GIF)", async () => {
      // Setup test SVG
      const testSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      testSvg.id = "fps-test-svg";
      testSvg.setAttribute("width", "100");
      testSvg.setAttribute("height", "100");
      document.getElementById("rx-canvas")!.appendChild(testSvg);

      // Mock canvas and context
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          drawImage: vi.fn(),
        })),
      };

      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        if (tagName === "a")
          return { href: "", download: "", click: vi.fn() } as any;
        return document.createElement(tagName);
      });

      // Mock Image
      const originalImage = window.Image;
      (window as any).Image = vi.fn(() => {
        const img = new originalImage();
        Object.defineProperty(img, "src", {
          set: function (_value) {
            setTimeout(() => this.onload?.(), 0);
          },
        });
        return img;
      });

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "fps-test-svg",
          options: {}, // No fps specified, should use default
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      // Get mock encoder creation call
      const { createMP4Encoder } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4-encoder"
      );

      // Should be called with 30fps default (higher than GIF's 5fps)
      expect(createMP4Encoder).toHaveBeenCalledWith(
        expect.objectContaining({
          fps: 30, // MP4 default
          bitrate: 2000000, // 2Mbps default
          codec: "avc1.42001f", // H.264 baseline
        })
      );
    });

    it("should handle encoder initialization failure", async () => {
      // Setup test SVG first
      const testSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      testSvg.id = "fail-svg";
      testSvg.setAttribute("width", "100");
      testSvg.setAttribute("height", "100");
      document.getElementById("rx-canvas")!.appendChild(testSvg);

      // Mock canvas and context properly
      const mockContext = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        fillStyle: "",
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };

      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        if (tagName === "a")
          return { href: "", download: "", click: vi.fn() } as any;
        return document.createElement(tagName);
      });

      // Mock encoder creation to fail
      const { createMP4Encoder } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4-encoder"
      );
      (createMP4Encoder as any).mockRejectedValueOnce(
        new Error("No MP4 encoding method available")
      );

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "fail-svg",
          options: {},
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      expect(ctx.payload.error).toContain("MP4 export failed");
      expect(ctx.logger.error).toHaveBeenCalledWith(
        "MP4 export failed:",
        expect.any(Error)
      );
    });

    it("should handle custom bitrate and codec options", async () => {
      // Setup test SVG
      const testSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      testSvg.id = "custom-options-svg";
      testSvg.setAttribute("width", "100");
      testSvg.setAttribute("height", "100");
      document.getElementById("rx-canvas")!.appendChild(testSvg);

      // Mock canvas and context
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          drawImage: vi.fn(),
        })),
      };

      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        if (tagName === "a")
          return { href: "", download: "", click: vi.fn() } as any;
        return document.createElement(tagName);
      });

      // Mock Image
      const originalImage = window.Image;
      (window as any).Image = vi.fn(() => {
        const img = new originalImage();
        Object.defineProperty(img, "src", {
          set: function (_value) {
            setTimeout(() => this.onload?.(), 0);
          },
        });
        return img;
      });

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "custom-options-svg",
          options: {
            bitrate: 5000000, // 5Mbps
            codec: "avc1.42001e", // H.264 extended
            fps: 60,
          },
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      // Get mock encoder creation call
      const { createMP4Encoder } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4-encoder"
      );

      // Should be called with custom options
      expect(createMP4Encoder).toHaveBeenCalledWith(
        expect.objectContaining({
          fps: 60,
          bitrate: 5000000,
          codec: "avc1.42001e",
        })
      );
    });
  });

  describe("Browser compatibility", () => {
    it("should handle missing VideoEncoder gracefully", async () => {
      // Mock createMP4Encoder to simulate fallback behavior
      const { createMP4Encoder } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4-encoder"
      );
      (createMP4Encoder as any).mockRejectedValueOnce(
        new Error("WebCodecs not available, falling back to MediaRecorder")
      );

      // Setup test SVG
      const testSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      testSvg.id = "compat-svg";
      testSvg.setAttribute("width", "100");
      testSvg.setAttribute("height", "100");
      document.getElementById("rx-canvas")!.appendChild(testSvg);

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "compat-svg",
          options: {},
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      expect(ctx.payload.error).toContain("MP4 export failed");
    });

    it("should handle server-side rendering environment", async () => {
      // Mock document as undefined to simulate SSR
      const originalDocument = global.document;
      (global as any).document = undefined;

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.mp4.symphony"
      );
      const exportMp4Handler = handlers.exportSvgToMp4;

      const ctx = {
        payload: {
          targetId: "ssr-svg",
          options: {},
        },
        logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      };

      await exportMp4Handler({}, ctx);

      expect(ctx.payload.error).toBe(
        "Browser environment required for MP4 export"
      );

      // Restore document
      global.document = originalDocument;
    });
  });
});
