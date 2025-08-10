import path from "path";
import fs from "fs";

// Helper to load ESM-like plugin file by simple transform for unit testing
function loadPluginFromFile(absPath: string): any {
  const code = fs.readFileSync(absPath, "utf8");
  const transpiled = code
    .replace(/export const (\w+)\s*=\s*/g, "moduleExports.$1 = ")
    .replace(/export default\s+/g, "moduleExports.default = ");
  const moduleExports: any = {};
  const fn = new Function("moduleExports", "fetch", transpiled);
  fn(moduleExports, (global as any).fetch);
  return moduleExports;
}

describe("RenderX Component Library Plugin", () => {
  let plugin: any;

  beforeAll(async () => {
    const abs = path.resolve(
      __dirname,
      "../../../../RenderX/public/plugins/component-library-plugin/index.js"
    );
    plugin = loadPluginFromFile(abs);
  });

  test("exports sequence and handlers", () => {
    expect(plugin).toBeTruthy();
    expect(plugin.sequence).toBeTruthy();
    expect(plugin.handlers).toBeTruthy();
    expect(typeof plugin.handlers.fetchComponentDefinitions).toBe("function");
    expect(typeof plugin.handlers.validateComponents).toBe("function");
    expect(typeof plugin.handlers.prepareComponents).toBe("function");
    expect(typeof plugin.handlers.notifyComponentsLoaded).toBe("function");
  });

  test("sequence is acceptable to SequenceRegistry validation", async () => {
    const { SequenceRegistry } = await import(
      "../../../../modules/communication/sequences/core/SequenceRegistry"
    );
    const { EventBus } = await import(
      "../../../../modules/communication/EventBus"
    );

    const eventBus = new EventBus();
    const registry = new SequenceRegistry(eventBus);
    // The registry will throw if invalid; this should not throw
    expect(() => registry.register(plugin.sequence)).not.toThrow();
  });

  describe("handlers", () => {
    const makeContext = (overrides: any = {}) => {
      return {
        payload: {},
        sequence: plugin.sequence,
        logger: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        },
        onComponentsLoaded: jest.fn(),
        ...overrides,
      };
    };

    beforeEach(() => {
      jest.restoreAllMocks();
      // Mock fetch for tests
      (global as any).fetch = jest.fn();
    });

    test("fetchComponentDefinitions returns empty set gracefully when network fails", async () => {
      (global as any).fetch.mockResolvedValue({ ok: false, status: 500 });
      const ctx = makeContext();
      const result = await plugin.handlers.fetchComponentDefinitions({}, ctx);
      expect(result).toEqual({ components: [], loaded: true });
      expect(ctx.logger.warn).toHaveBeenCalled();
    });

    test("validateComponents filters by required fields and maxComponents", () => {
      const ctx = makeContext({
        payload: {
          components: [
            { metadata: { name: "Button", type: "basic" } },
            { metadata: { name: "Input" } },
            { metadata: { name: "Card", type: "layout" } },
          ],
        },
      });

      // Override config to cap maxComponents
      const seq = {
        ...plugin.sequence,
        configuration: {
          requiredFields: ["metadata.name", "metadata.type"],
          maxComponents: 1,
        },
      };
      ctx.sequence = seq;

      const res = plugin.handlers.validateComponents({}, ctx);
      expect(res.validationPassed).toBe(true);
      expect(res.filtered).toBe(2);
      expect(res.validComponents.length).toBe(1);
    });

    test("prepareComponents sorts by name", () => {
      const ctx = makeContext({
        payload: {
          validComponents: [
            { metadata: { name: "Zeta", type: "ui" } },
            { metadata: { name: "Alpha", type: "ui" } },
          ],
        },
      });
      ctx.sequence = {
        ...plugin.sequence,
        configuration: { ...plugin.sequence.configuration, sortBy: "name" },
      };
      const res = plugin.handlers.prepareComponents({}, ctx);
      expect(res.prepared).toBe(true);
      expect(res.preparedComponents.map((c: any) => c.metadata.name)).toEqual([
        "Alpha",
        "Zeta",
      ]);
    });

    test("notifyComponentsLoaded calls callback and returns count", () => {
      const onComponentsLoaded = jest.fn();
      const ctx = makeContext({
        onComponentsLoaded,
        payload: {
          preparedComponents: [{ id: 1 }, { id: 2 }],
        },
      });

      const res = plugin.handlers.notifyComponentsLoaded({}, ctx);
      expect(onComponentsLoaded).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
      expect(res).toEqual({ notified: true, count: 2 });
    });
  });
});
