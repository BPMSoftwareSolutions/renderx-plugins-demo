/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock gif.js.optimized before importing handlers
vi.mock("gif.js.optimized", () => {
  const mockGif = {
    addFrame: vi.fn(),
    on: vi.fn(),
    render: vi.fn(),
  };

  return {
    default: vi.fn(() => mockGif),
    __mockGif: mockGif, // Export for test access
  };
});

// Mock worker URL import
vi.mock("gif.js.optimized/dist/gif.worker.js?url", () => ({
  default: "mock-worker-url",
}));

describe("Export SVG to GIF", () => {
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
  });

  describe("Selection gating", () => {
    it("should only show Export GIF option when exactly one SVG is selected", () => {
      // This test will be implemented when we add the UI component
      // For now, we'll test the handler directly
      expect(true).toBe(true);
    });
  });

  describe("Handler happy path", () => {
    it("should export SVG to GIF blob and trigger download", async () => {
      // Setup: Add an SVG element to the canvas
      const canvas = document.getElementById("rx-canvas")!;
      const svgEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgEl.id = "test-svg";
      svgEl.setAttribute("width", "100");
      svgEl.setAttribute("height", "100");
      svgEl.innerHTML = '<rect width="50" height="50" fill="red" />';
      canvas.appendChild(svgEl);

      // Mock Image loading
      const imageSrcs: string[] = [];
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        _src: "",
        set src(v: string) {
          imageSrcs.push(v);
          Promise.resolve().then(() => this.onload && this.onload());
        },
        get src() {
          return this._src;
        },
        width: 100,
        height: 100,
      } as any;
      vi.spyOn(window, "Image").mockImplementation(() => mockImage);

      // Mock canvas context
      const mockContext = {
        drawImage: vi.fn(),
        fillStyle: "",
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(400) })),
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };
      const mockAnchor = { href: "", download: "", click: vi.fn() };

      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        if (tagName === "a") return mockAnchor as any;
        return document.createElement(tagName);
      });

      // Mock gif.js
      const GIF = await import("gif.js.optimized");
      const mockGif = (GIF as any).__mockGif;

      // Setup gif.js to call the finished callback immediately
      mockGif.on.mockImplementation((event: string, callback: Function) => {
        if (event === "finished") {
          // Call immediately to avoid timeout
          callback(new Blob(["fake-gif"], { type: "image/gif" }));
        }
      });

      // Import handler
      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
      );
      const exportGifHandler = handlers.exportSvgToGif;

      // Test payload
      const ctx = {
        payload: {
          targetId: "test-svg",
          options: { width: 100, height: 100 },
        },
        logger: { info: vi.fn(), error: vi.fn() },
      };

      // Execute handler - this will trigger the image load
      const handlerPromise = exportGifHandler({}, ctx);

      // onload auto-triggered by mock Image.src setter

      await handlerPromise;

      // Assertions
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(mockGif.addFrame).toHaveBeenCalledWith(mockCanvas, {
        delay: 100,
        copy: true,
      });
      expect(mockGif.render).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
    }, 10000); // Increase timeout
  });

  it("should use getBoundingClientRect dimensions when options are omitted", async () => {
    // Setup: Add an SVG element to the canvas
    const canvas = document.getElementById("rx-canvas")!;
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.id = "test-svg-bbox";
    svgEl.setAttribute("viewBox", "0 0 900 500");
    canvas.appendChild(svgEl);

    // Mock getBoundingClientRect to return specific dimensions
    vi.spyOn(svgEl, "getBoundingClientRect").mockReturnValue({
      width: 450,
      height: 250,
      top: 0,
      left: 0,
      bottom: 250,
      right: 450,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    // Mock Image loading
    const imageSrcs2: string[] = [];
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      _src: "",
      set src(v: string) {
        imageSrcs2.push(v);
        Promise.resolve().then(() => this.onload && this.onload());
      },
      get src() {
        return this._src;
      },
      width: 450,
      height: 250,
    } as any;
    vi.spyOn(window, "Image").mockImplementation(() => mockImage);

    // Mock canvas context
    const mockContext = {
      drawImage: vi.fn(),
      fillStyle: "",
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(450 * 250 * 4),
      })),
    };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
    };
    const mockAnchor = { href: "", download: "", click: vi.fn() };

    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") return mockCanvas as any;
      if (tagName === "a") return mockAnchor as any;
      return document.createElement(tagName);
    });

    // Mock gif.js
    const GIF = await import("gif.js.optimized");
    const mockGif = (GIF as any).__mockGif;

    mockGif.on.mockImplementation((event: string, callback: Function) => {
      if (event === "finished") {
        callback(new Blob(["fake-gif"], { type: "image/gif" }));
      }
    });

    // Import handler
    const { handlers } = await import(
      "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
    );
    const exportGifHandler = handlers.exportSvgToGif;

    // Test payload WITHOUT width/height options
    const ctx = {
      payload: {
        targetId: "test-svg-bbox",
        options: {}, // No width/height specified
      },
      logger: { info: vi.fn(), error: vi.fn() },
    };

    // Execute handler
    const handlerPromise = exportGifHandler({}, ctx);

    // onload auto-triggered by mock Image.src setter

    await handlerPromise;

    // Assertions: canvas should be sized to bbox dimensions (450x250)
    expect(mockCanvas.width).toBe(450);
    expect(mockCanvas.height).toBe(250);
    expect(mockGif.addFrame).toHaveBeenCalledWith(mockCanvas, {
      delay: 100,
      copy: true,
    });
    expect(mockAnchor.click).toHaveBeenCalled();
  }, 10000);

  it("should use CSS dimensions when element is clipped (off-screen positioning)", async () => {
    // Setup: Add an SVG element that's positioned off-screen
    const canvas = document.getElementById("rx-canvas")!;
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.id = "test-svg-clipped";
    svgEl.setAttribute("viewBox", "0 0 900 500");
    svgEl.style.width = "900px";
    svgEl.style.height = "500px";
    svgEl.style.position = "absolute";
    svgEl.style.left = "-56px"; // Positioned off-screen like your example
    svgEl.style.top = "135px";
    canvas.appendChild(svgEl);

    // Mock getBoundingClientRect to return clipped dimensions (what's visible)
    vi.spyOn(svgEl, "getBoundingClientRect").mockReturnValue({
      width: 844, // 900 - 56 = 844 (clipped width)
      height: 500,
      top: 135,
      left: 0, // Browser clips negative left to 0
      bottom: 635,
      right: 844,
      x: 0,
      y: 135,
      toJSON: () => ({}),
    });

    // Mock Image loading
    const imageSrcs3: string[] = [];
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      _src: "",
      set src(v: string) {
        imageSrcs3.push(v);
        Promise.resolve().then(() => this.onload && this.onload());
      },
      get src() {
        return this._src;
      },
      width: 900,
      height: 500,
    } as any;
    vi.spyOn(window, "Image").mockImplementation(() => mockImage);

    // Mock canvas context and elements
    const mockContext = {
      drawImage: vi.fn(),
      fillStyle: "",
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(900 * 500 * 4),
      })),
    };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
    };
    const mockAnchor = { href: "", download: "", click: vi.fn() };

    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") return mockCanvas as any;
      if (tagName === "a") return mockAnchor as any;
      return document.createElement(tagName);
    });

    // Mock gif.js
    const GIF = await import("gif.js.optimized");
    const mockGif = (GIF as any).__mockGif;

    mockGif.on.mockImplementation((event: string, callback: Function) => {
      if (event === "finished") {
        callback(new Blob(["fake-gif"], { type: "image/gif" }));
      }
    });

    // Import handler
    const { handlers } = await import(
      "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
    );
    const exportGifHandler = handlers.exportSvgToGif;

    // Test payload WITHOUT width/height options (should detect clipping)
    const ctx = {
      payload: {
        targetId: "test-svg-clipped",
        options: {}, // No width/height specified
      },
      logger: { info: vi.fn(), error: vi.fn() },
    };

    // Execute handler
    const handlerPromise = exportGifHandler({}, ctx);

    // onload auto-triggered by mock Image.src setter

    await handlerPromise;

    // Assertions: should use CSS dimensions (900x500) not bbox (844x500)
    expect(mockCanvas.width).toBe(900); // Full CSS width, not clipped bbox
    expect(mockCanvas.height).toBe(500);
    expect(ctx.logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Using CSS dimensions (900x500) instead of bbox (844x500) due to clipping"
      )
    );
    expect(mockGif.addFrame).toHaveBeenCalledWith(mockCanvas, {
      delay: 100,
      copy: true,
    });
    expect(mockAnchor.click).toHaveBeenCalled();
  }, 10000);

  it("does not use left/top offsets when rendering (always draws at 0,0)", async () => {
    // Setup: Add an SVG element with non-zero offsets
    const canvas = document.getElementById("rx-canvas")!;
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.id = "test-svg-offsets";
    svgEl.setAttribute("viewBox", "0 0 300 200");
    svgEl.style.position = "absolute";
    svgEl.style.left = "123px";
    svgEl.style.top = "77px";
    svgEl.style.width = "300px";
    svgEl.style.height = "200px";
    canvas.appendChild(svgEl);

    // Mock bbox to match CSS size so clipping logic doesn't interfere
    vi.spyOn(svgEl, "getBoundingClientRect").mockReturnValue({
      width: 300,
      height: 200,
      top: 77,
      left: 123,
      bottom: 277,
      right: 423,
      x: 123,
      y: 77,
      toJSON: () => ({}),
    });

    // Mock Image load
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      _src: "",
      set src(v: string) {
        Promise.resolve().then(() => this.onload && this.onload());
      },
      get src() {
        return this._src;
      },
    } as any;
    vi.spyOn(window, "Image").mockImplementation(() => mockImage);

    // Mock canvas context and spy drawImage args
    const mockContext = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      fillStyle: "",
    };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
    };
    const mockAnchor = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") return mockCanvas as any;
      if (tagName === "a") return mockAnchor as any;
      return document.createElement(tagName);
    });

    // Mock gif.js
    const GIF = await import("gif.js.optimized");
    const mockGif = (GIF as any).__mockGif;
    mockGif.on.mockImplementation((event: string, callback: Function) => {
      if (event === "finished")
        callback(new Blob(["fake-gif"], { type: "image/gif" }));
    });

    // Import handler
    const { handlers } = await import(
      "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
    );
    const exportGifHandler = handlers.exportSvgToGif;

    const ctx = {
      payload: { targetId: "test-svg-offsets", options: {} },
      logger: { info: vi.fn(), error: vi.fn() },
    };

    await exportGifHandler({}, ctx);

    // Assert we drew at (0,0) regardless of element left/top offsets
    expect(mockContext.drawImage).toHaveBeenCalled();
    const args = (mockContext.drawImage as any).mock.calls[0];
    // args: [img, dx, dy, dw, dh]
    expect(args[1]).toBe(0);
    expect(args[2]).toBe(0);
    expect(args[3]).toBe(300);
    expect(args[4]).toBe(200);
  }, 10000);

  describe("Animation", () => {
    it("exports animated GIF with explicit keyframes", async () => {
      // SVG with elements to animate
      const canvas = document.getElementById("rx-canvas")!;
      const svgEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgEl.id = "anim-svg";
      svgEl.setAttribute("viewBox", "0 0 200 100");
      svgEl.style.width = "200px";
      svgEl.style.height = "100px";
      svgEl.innerHTML = `
        <rect id="box1" x="20" y="30" width="20" height="20" fill="#0bf" />
        <rect id="box2" x="60" y="30" width="20" height="20" fill="#f50" />
        <path id="line1" d="M 10 10 L 190 10" stroke="#333" stroke-width="2" />
        <g id="group1" opacity="1"><circle cx="160" cy="50" r="8" fill="#090" /></g>
      `;
      canvas.appendChild(svgEl);

      vi.spyOn(svgEl, "getBoundingClientRect").mockReturnValue({
        width: 200,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Capture per-frame Image.src to ensure frames differ
      const imageSrcs: string[] = [];
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        _src: "",
        set src(v: string) {
          imageSrcs.push(v);
          Promise.resolve().then(() => this.onload && this.onload());
        },
        get src() {
          return this._src;
        },
      } as any;
      vi.spyOn(window, "Image").mockImplementation(() => mockImage);

      const mockContext = {
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        fillStyle: "",
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };
      const mockAnchor = { href: "", download: "", click: vi.fn() };
      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        if (tagName === "a") return mockAnchor as any;
        return document.createElement(tagName);
      });

      const GIF = await import("gif.js.optimized");
      const mockGif = (GIF as any).__mockGif;
      mockGif.on.mockImplementation((event: string, cb: Function) => {
        if (event === "finished") cb(new Blob(["g"], { type: "image/gif" }));
      });

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
      );
      const exportGifHandler = handlers.exportSvgToGif;

      const ctx = {
        payload: {
          targetId: "anim-svg",
          options: {
            fps: 10,
            durationMs: 1000,
            animation: {
              keyframes: [
                {
                  selector: "#box1",
                  attr: "transform",
                  from: 0,
                  to: 360,
                  kind: "rotate",
                },
                {
                  selector: "#box2",
                  attr: "transform",
                  from: 1.0,
                  to: 1.5,
                  kind: "scale",
                },
                { selector: "#group1", attr: "opacity", from: 1.0, to: 0.5 },
              ],
            },
          },
        },
        logger: { info: vi.fn(), error: vi.fn() },
      };
      await exportGifHandler({}, ctx);

      // Check for errors first
      if (ctx.payload.error) {
        console.error("Handler error:", ctx.payload.error);
      }

      expect(mockGif.addFrame).toHaveBeenCalled();
      const calls = (mockGif.addFrame as any).mock.calls.length;
      expect(calls).toBeGreaterThanOrEqual(10); // ~10 frames for 1s at 10fps
      const distinct = new Set(imageSrcs);
      expect(distinct.size).toBeGreaterThanOrEqual(5); // frames differ
    });

    it("encodes multiple frames using fps/duration and keyframes", async () => {
      // Setup SVG with a rect we will animate
      const canvas = document.getElementById("rx-canvas")!;
      const svgEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgEl.id = "anim-svg";
      svgEl.setAttribute("viewBox", "0 0 100 50");
      svgEl.style.width = "200px";
      svgEl.style.height = "100px";
      const ns = "http://www.w3.org/2000/svg";
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("id", "box");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", "10");
      rect.setAttribute("width", "20");
      rect.setAttribute("height", "20");
      rect.setAttribute("fill", "#f00");
      svgEl.appendChild(rect);
      canvas.appendChild(svgEl);

      // Mock bbox to match CSS size
      vi.spyOn(svgEl, "getBoundingClientRect").mockReturnValue({
        width: 200,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Capture per-frame serialized SVG by spying on Image.src assignments
      const imageSrcs: string[] = [];
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        _src: "",
        set src(v: string) {
          imageSrcs.push(v);
          // call onload immediately for each frame
          Promise.resolve().then(() => this.onload && this.onload());
        },
        get src() {
          return this._src;
        },
      } as any;
      vi.spyOn(window, "Image").mockImplementation(() => mockImage);

      // Mock canvas context
      const mockContext = {
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        fillStyle: "",
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };
      const mockAnchor = { href: "", download: "", click: vi.fn() };
      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        if (tagName === "a") return mockAnchor as any;
        return document.createElement(tagName);
      });

      // Mock gif.js
      const GIF = await import("gif.js.optimized");
      const mockGif = (GIF as any).__mockGif;
      mockGif.on.mockImplementation((event: string, callback: Function) => {
        if (event === "finished")
          callback(new Blob(["fake-gif"], { type: "image/gif" }));
      });

      // Import handler
      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
      );
      const exportGifHandler = handlers.exportSvgToGif;

      // fps=5, duration=1000ms => 5 frames minimal; expect N frames and varying serialized srcs
      const ctx = {
        payload: {
          targetId: "anim-svg",
          options: {
            fps: 5,
            durationMs: 1000,
            animation: {
              keyframes: [{ selector: "#box", attr: "x", from: 0, to: 80 }],
            },
          },
        },
        logger: { info: vi.fn(), error: vi.fn() },
      };

      await exportGifHandler({}, ctx);

      // Expect addFrame called ~5 times
      expect(mockGif.addFrame).toHaveBeenCalled();
      const calls = (mockGif.addFrame as any).mock.calls.length;
      expect(calls).toBeGreaterThanOrEqual(5);

      // Expect multiple distinct serialized frames
      const distinctSrcs = new Set(imageSrcs);
      expect(distinctSrcs.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Error handling", () => {
    it("should handle missing SVG element", async () => {
      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
      );
      const exportGifHandler = handlers.exportSvgToGif;

      const ctx = {
        payload: {
          targetId: "non-existent",
          options: {},
        },
        logger: { info: vi.fn(), error: vi.fn() },
      };

      await exportGifHandler({}, ctx);

      expect(ctx.payload.error).toContain("not found");
    });

    it("should handle non-SVG element", async () => {
      // Setup: Add a non-SVG element
      const canvas = document.getElementById("rx-canvas")!;
      const divEl = document.createElement("div");
      divEl.id = "test-div";
      canvas.appendChild(divEl);

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
      );
      const exportGifHandler = handlers.exportSvgToGif;

      const ctx = {
        payload: {
          targetId: "test-div",
          options: {},
        },
        logger: { info: vi.fn(), error: vi.fn() },
      };

      await exportGifHandler({}, ctx);

      expect(ctx.payload.error).toContain("not an SVG");
    });

    it("should handle canvas context unavailable", async () => {
      // Setup SVG with valid dimensions
      const canvas = document.getElementById("rx-canvas")!;
      const svgEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgEl.id = "test-svg";
      svgEl.setAttribute("width", "100");
      svgEl.setAttribute("height", "100");
      canvas.appendChild(svgEl);

      // Mock getBoundingClientRect to return valid dimensions
      vi.spyOn(svgEl, "getBoundingClientRect").mockReturnValue({
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Mock canvas with no context
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => null), // No 2D context
      };
      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas as any;
        return document.createElement(tagName);
      });

      const { handlers } = await import(
        "../../plugins/canvas-component/symphonies/export/export.gif.symphony"
      );
      const exportGifHandler = handlers.exportSvgToGif;

      const ctx = {
        payload: {
          targetId: "test-svg",
          options: { width: 100, height: 100 },
        },
        logger: { info: vi.fn(), error: vi.fn() },
      };

      await exportGifHandler({}, ctx);

      expect(ctx.payload.error).toContain("2D context unavailable");
    });
  });
});
