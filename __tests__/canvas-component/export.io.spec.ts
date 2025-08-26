/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  queryAllComponents,
  downloadUiFile,
  collectCssClasses,
} from "../../plugins/canvas-component/symphonies/export/export.io";

function makeCtx() {
  const ops: any[] = [];
  const kvStore = new Map();

  // Pre-populate with test data
  kvStore.set("rx-node-1", {
    type: "button",
    classes: ["rx-comp", "rx-button"],
    style: { padding: "8px 12px" },
    createdAt: 1724668200000,
  });
  kvStore.set("rx-node-2", {
    type: "div",
    classes: ["rx-comp", "rx-card"],
    style: { padding: "12px" },
    createdAt: 1724668300000,
  });

  return {
    payload: {},
    io: {
      kv: {
        put: async (...a: any[]) => ops.push(["kv.put", ...a]),
        get: async (key: string) => {
          ops.push(["kv.get", key]);
          return kvStore.get(key);
        },
        keys: async () => {
          ops.push(["kv.keys"]);
          return Array.from(kvStore.keys());
        },
        getAll: async () => {
          ops.push(["kv.getAll"]);
          const result: any[] = [];
          for (const [key, value] of kvStore.entries()) {
            result.push({ id: key, ...value });
          }
          return result;
        },
      },
    },
    _ops: ops,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  } as any;
}

describe("canvas-component export.io", () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  describe("queryAllComponents", () => {
    it("should query all components from KV store", async () => {
      const ctx = makeCtx();

      await queryAllComponents({}, ctx);

      const ops = ctx._ops.map((x: any[]) => x[0]);
      expect(ops).toContain("kv.getAll");
      expect(ctx.payload.components).toHaveLength(2);
      expect(ctx.payload.components[0]).toMatchObject({
        id: "rx-node-1",
        type: "button",
        classes: ["rx-comp", "rx-button"],
      });
    });

    it("should handle empty KV store gracefully", async () => {
      const ctx = makeCtx();
      // Override to return empty array
      ctx.io.kv.getAll = async () => [];

      await queryAllComponents({}, ctx);

      expect(ctx.payload.components).toEqual([]);
      expect(ctx.payload.componentCount).toBe(0);
      expect(ctx.payload.source).toBe("dom-scan-fallback"); // Should attempt DOM scan
    });

    it("should handle KV store errors and fallback to DOM scanning", async () => {
      const ctx = makeCtx();
      ctx.io.kv.getAll = async () => {
        throw new Error("KV store unavailable");
      };

      // Set up DOM with components for fallback
      document.body.innerHTML = `
        <div id="rx-canvas">
          <button id="rx-node-1" class="rx-comp rx-button">Test</button>
        </div>
      `;

      await queryAllComponents({}, ctx);

      expect(ctx.payload.components).toHaveLength(1);
      expect(ctx.payload.source).toBe("dom-scan-primary"); // KV error means it's treated as unavailable
      expect(ctx.payload.components[0].id).toBe("rx-node-1");
    });

    it("should scan DOM when KV store is empty", async () => {
      const ctx = makeCtx();
      ctx.io.kv.getAll = async () => [];

      // Set up DOM with components
      document.body.innerHTML = `
        <div id="rx-canvas">
          <button id="rx-node-1" class="rx-comp rx-button" style="padding: 8px;">Test</button>
          <div id="rx-node-2" class="rx-comp rx-container">Container</div>
        </div>
      `;

      await queryAllComponents({}, ctx);

      expect(ctx.payload.components).toHaveLength(2);
      expect(ctx.payload.source).toBe("dom-scan-fallback");
      expect(ctx.payload.components[0]).toMatchObject({
        id: "rx-node-1",
        type: "button",
        classes: ["rx-comp", "rx-button"],
      });
    });

    it("should handle missing KV store gracefully", async () => {
      const ctx = makeCtx();
      // Remove KV store entirely
      delete ctx.io.kv;

      // Set up DOM with components
      document.body.innerHTML = `
        <div id="rx-canvas">
          <button id="rx-node-1" class="rx-comp rx-button">Test</button>
        </div>
      `;

      await queryAllComponents({}, ctx);

      expect(ctx.payload.components).toHaveLength(1);
      expect(ctx.payload.source).toBe("dom-scan-primary");
      expect(ctx.payload.components[0].id).toBe("rx-node-1");
    });
  });

  describe("collectCssClasses", () => {
    it("should collect CSS class definitions from components", async () => {
      const ctx = makeCtx();
      ctx.payload.components = [
        {
          id: "rx-node-1",
          classes: ["rx-comp", "rx-button", "custom-highlight"],
        },
        { id: "rx-node-2", classes: ["rx-comp", "rx-card"] },
      ];

      // Mock CSS registry
      ctx.io.cssRegistry = {
        getClass: async (className: string) => {
          const mockClasses: any = {
            "rx-comp": {
              name: "rx-comp",
              content:
                ".rx-comp { position: relative; box-sizing: border-box; }",
              isBuiltIn: true,
              createdAt: 1724668100000,
              updatedAt: 1724668100000,
            },
            "rx-button": {
              name: "rx-button",
              content: ".rx-button { background: #3b82f6; color: white; }",
              isBuiltIn: true,
              createdAt: 1724668100000,
              updatedAt: 1724668100000,
            },
            "custom-highlight": {
              name: "custom-highlight",
              content: ".custom-highlight { background: yellow; }",
              isBuiltIn: false,
              createdAt: 1724668500000,
              updatedAt: 1724668600000,
            },
          };
          return mockClasses[className] || null;
        },
      };

      await collectCssClasses({}, ctx);

      expect(ctx.payload.cssClasses).toHaveProperty("rx-comp");
      expect(ctx.payload.cssClasses).toHaveProperty("rx-button");
      expect(ctx.payload.cssClasses).toHaveProperty("custom-highlight");
      expect(ctx.payload.cssClasses["rx-comp"]).toMatchObject({
        name: "rx-comp",
        content: ".rx-comp { position: relative; box-sizing: border-box; }",
        isBuiltIn: true,
      });
    });

    it("should handle missing CSS registry gracefully", async () => {
      const ctx = makeCtx();
      ctx.payload.components = [
        { id: "rx-node-1", classes: ["rx-comp", "rx-button"] },
      ];
      // No CSS registry available

      await collectCssClasses({}, ctx);

      expect(ctx.payload.cssClasses).toEqual({});
      expect(ctx.payload.error).toContain("CSS registry not available");
    });

    it("should deduplicate CSS classes across components", async () => {
      const ctx = makeCtx();
      ctx.payload.components = [
        { id: "rx-node-1", classes: ["rx-comp", "rx-button"] },
        { id: "rx-node-2", classes: ["rx-comp", "rx-card"] },
        { id: "rx-node-3", classes: ["rx-button", "custom-style"] },
      ];

      ctx.io.cssRegistry = {
        getClass: async (className: string) => ({
          name: className,
          content: `.${className} { /* mock */ }`,
          isBuiltIn: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      };

      await collectCssClasses({}, ctx);

      // Should have unique classes only
      const classNames = Object.keys(ctx.payload.cssClasses);
      expect(classNames).toEqual([
        "rx-comp",
        "rx-button",
        "rx-card",
        "custom-style",
      ]);
      expect(classNames).toHaveLength(4); // No duplicates
    });
  });

  describe("downloadUiFile", () => {
    it("should create and trigger download of UI file", async () => {
      const ctx = makeCtx();
      ctx.payload.uiFileContent = {
        version: "1.0.0",
        components: [{ id: "test", type: "button" }],
      };

      // Mock DOM elements
      const mockAnchor = {
        href: "",
        download: "",
        click: vi.fn(),
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as any);

      await downloadUiFile({}, ctx);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toMatch(/canvas-design-.*\.ui/);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should handle missing uiFileContent", async () => {
      const ctx = makeCtx();
      // No uiFileContent in payload

      await downloadUiFile({}, ctx);

      expect(ctx.payload.error).toContain("No UI file content");
    });

    it("should handle browser environment check", async () => {
      const ctx = makeCtx();
      ctx.payload.uiFileContent = { version: "1.0.0", components: [] };

      // Mock non-browser environment
      const originalDocument = global.document;
      (global as any).document = undefined;

      await downloadUiFile({}, ctx);

      expect(ctx.payload.error).toContain("Browser environment required");

      // Restore
      global.document = originalDocument;
    });
  });
});
