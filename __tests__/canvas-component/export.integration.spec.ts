/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers } from "../../plugins/canvas-component/symphonies/export/export.symphony";

function makeIntegrationCtx() {
  const ops: any[] = [];
  const kvStore = new Map();

  // Pre-populate with test data
  kvStore.set("rx-node-1", {
    type: "button",
    classes: ["rx-comp", "rx-button"],
    style: { padding: "8px 12px", borderRadius: "8px" },
    createdAt: 1724668200000,
  });
  kvStore.set("rx-node-2", {
    type: "div",
    classes: ["rx-comp", "rx-card"],
    style: { padding: "12px", boxShadow: "0 2px 8px rgba(0,0,0,.1)" },
    createdAt: 1724668300000,
  });

  return {
    payload: {},
    io: {
      kv: {
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

describe("canvas-component export integration", () => {
  beforeEach(() => {
    // Set up canvas with test components
    document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 1200px; height: 800px;">
        <button id="rx-node-1" style="position: absolute; left: 100px; top: 150px; width: 120px; height: 40px;">Click Me</button>
        <div id="rx-node-2" style="position: absolute; left: 200px; top: 250px; width: 200px; height: 100px;">Card</div>
      </div>
    `;

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("should complete full export flow successfully", async () => {
    const ctx = makeIntegrationCtx();

    // Mock DOM createElement for download
    const mockAnchor = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as any);

    // Mock CSS registry for integration test
    ctx.io.cssRegistry = {
      getClass: async (className: string) => ({
        name: className,
        content: `.${className} { /* mock CSS */ }`,
        isBuiltIn: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    };

    // Execute the complete export flow
    await handlers.queryAllComponents({}, ctx);
    expect(ctx.payload.components).toHaveLength(2);

    await handlers.collectCssClasses({}, ctx);
    expect(ctx.payload.cssClasses).toBeDefined();
    expect(Object.keys(ctx.payload.cssClasses).length).toBeGreaterThan(0);

    handlers.collectLayoutData({}, ctx);
    expect(ctx.payload.layoutData).toHaveLength(2);
    expect(ctx.payload.canvasMetadata).toMatchObject({
      width: 1200,
      height: 800,
    });

    handlers.buildUiFileContent({}, ctx);
    expect(ctx.payload.uiFileContent).toBeDefined();
    expect(ctx.payload.uiFileContent.components).toHaveLength(2);
    expect(ctx.payload.uiFileContent.cssClasses).toBeDefined();

    await handlers.downloadUiFile({}, ctx);
    expect(ctx.payload.downloadTriggered).toBe(true);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.download).toMatch(/canvas-design-.*\.ui/);
  });

  it("should handle missing components gracefully", async () => {
    const ctx = makeIntegrationCtx();
    // Override to return empty components
    ctx.io.kv.getAll = async () => [];

    await handlers.queryAllComponents({}, ctx);
    await handlers.collectCssClasses({}, ctx);
    handlers.collectLayoutData({}, ctx);
    handlers.buildUiFileContent({}, ctx);

    expect(ctx.payload.uiFileContent.components).toEqual([]);
    expect(ctx.payload.uiFileContent.metadata.componentCount).toBe(0);
    expect(ctx.payload.uiFileContent.cssClasses).toEqual({});
  });

  it("should produce valid UI file structure", async () => {
    const ctx = makeIntegrationCtx();

    // Mock CSS registry
    ctx.io.cssRegistry = {
      getClass: async (className: string) => ({
        name: className,
        content: `.${className} { /* mock CSS */ }`,
        isBuiltIn: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    };

    await handlers.queryAllComponents({}, ctx);
    await handlers.collectCssClasses({}, ctx);
    handlers.collectLayoutData({}, ctx);
    handlers.buildUiFileContent({}, ctx);

    const uiFile = ctx.payload.uiFileContent;

    // Validate structure
    expect(uiFile).toMatchObject({
      version: "1.0.0",
      metadata: {
        createdAt: expect.any(String),
        canvasSize: { width: 1200, height: 800 },
        componentCount: 2,
      },
      cssClasses: expect.any(Object),
      components: expect.arrayContaining([
        expect.objectContaining({
          id: "rx-node-1",
          type: "button",
          template: expect.objectContaining({
            tag: "button",
            classRefs: ["rx-comp", "rx-button"],
            style: expect.any(Object),
          }),
          layout: expect.objectContaining({
            x: 100,
            y: 150,
            width: 120,
            height: 40,
          }),
          createdAt: expect.any(Number),
        }),
      ]),
    });

    // Validate JSON serialization
    expect(() => JSON.stringify(uiFile)).not.toThrow();
  });

  it("should handle DOM errors gracefully", async () => {
    const ctx = makeIntegrationCtx();

    // Mock CSS registry
    ctx.io.cssRegistry = {
      getClass: async (className: string) => ({
        name: className,
        content: `.${className} { /* mock CSS */ }`,
        isBuiltIn: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    };

    // Remove canvas to simulate error
    document.body.innerHTML = "";

    await handlers.queryAllComponents({}, ctx);
    await handlers.collectCssClasses({}, ctx);
    handlers.collectLayoutData({}, ctx);
    handlers.buildUiFileContent({}, ctx);

    expect(ctx.payload.error).toContain("Canvas container not found");
    expect(ctx.payload.uiFileContent.components).toHaveLength(2); // Components still exist from KV
    expect(ctx.payload.uiFileContent.components[0].layout).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    expect(ctx.payload.uiFileContent.cssClasses).toBeDefined();
  });

  it("should fallback to DOM scanning when KV store is empty but components exist in DOM", async () => {
    const ctx = makeIntegrationCtx();

    // Override KV store to return empty (simulating the real scenario)
    ctx.io.kv.getAll = async () => [];

    // Set up DOM with components that exist visually but not in KV
    document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 833px; height: 629px;">
        <button id="rx-node-btn-1" class="rx-comp rx-button" style="position: absolute; left: 116px; top: 77px; width: 120px; height: 40px; padding: 8px 12px; border-radius: 8px; background: #0ea5e9; color: white;">Save Document</button>
        <div id="rx-node-container-1" class="rx-comp rx-container" style="position: absolute; left: 168px; top: 270px; width: 354px; height: 237px; border: 2px dashed #3b82f6;">
          <button id="rx-node-btn-2" class="rx-comp rx-button" style="position: absolute; left: 197px; top: 298px; width: 120px; height: 40px; padding: 8px 12px; border-radius: 8px; background: #0ea5e9; color: white;">Click me</button>
          <input id="rx-node-input-1" class="rx-comp rx-input" type="email" value="user@test.com" style="position: absolute; left: 199px; top: 362px; width: 220px; height: 32px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" placeholder="Enter your email address">
        </div>
      </div>
    `;

    // Execute export flow
    await handlers.queryAllComponents({}, ctx);
    handlers.collectLayoutData({}, ctx);
    handlers.buildUiFileContent({}, ctx);

    // Should find components from DOM scanning
    expect(ctx.payload.components).toHaveLength(4); // Should find all 4 components
    expect(ctx.payload.uiFileContent.components).toHaveLength(4);

    // Verify component data was extracted from DOM
    const buttonComponent = ctx.payload.uiFileContent.components.find(
      (c: any) => c.id === "rx-node-btn-1"
    );
    expect(buttonComponent).toMatchObject({
      id: "rx-node-btn-1",
      type: "button",
      template: {
        tag: "button",
        classRefs: ["rx-comp", "rx-button"],
      },
      layout: {
        x: 116,
        y: 77,
        width: 120,
        height: 40,
      },
    });

    // Verify content was captured
    expect(buttonComponent.content).toBeDefined();
    expect(buttonComponent.content.content).toBe("Save Document");
    expect(buttonComponent.content.text).toBe("Save Document");

    // Verify input content was captured
    const inputComponent = ctx.payload.uiFileContent.components.find(
      (c: any) => c.id === "rx-node-input-1"
    );
    expect(inputComponent).toBeDefined();
    expect(inputComponent.content).toBeDefined();
    expect(inputComponent.content.placeholder).toBe("Enter your email address");
    expect(inputComponent.content.value).toBe("user@test.com");
    expect(inputComponent.content.inputType).toBe("email");
  });
});

it("exports a component inside a container", async () => {
  const ctx = makeIntegrationCtx();
  delete (ctx.io as any).cssRegistry;
  // Force DOM scan primary
  ctx.io.kv.getAll = async () => [];

  document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 800px; height: 600px;">
        <div id="container-1" class="rx-comp rx-container" style="position: absolute; left: 200px; top: 150px; width: 300px; height: 200px;">
          <button id="btn-1" class="rx-comp rx-button" style="position: absolute; left: 40px; top: 30px; width: 120px; height: 40px;">Click</button>
        </div>
      </div>
    `;

  await handlers.queryAllComponents({}, ctx);
  await handlers.collectCssClasses({}, ctx);
  handlers.collectLayoutData({}, ctx);
  handlers.buildUiFileContent({}, ctx);

  const ui = ctx.payload.uiFileContent;
  const ids = ui.components.map((c: any) => c.id);
  expect(ids).toEqual(expect.arrayContaining(["container-1", "btn-1"]));

  const btn = ui.components.find((c: any) => c.id === "btn-1");
  expect(btn.template.tag).toBe("button");
  expect(btn.template.classRefs).toEqual(["rx-comp", "rx-button"]);
  expect(btn.layout).toMatchObject({ x: 40, y: 30, width: 120, height: 40 });
  expect(btn.parentId).toBe("container-1");
});

it("exports a container inside a container", async () => {
  const ctx = makeIntegrationCtx();
  delete (ctx.io as any).cssRegistry;
  // Force DOM scan primary
  ctx.io.kv.getAll = async () => [];

  document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 800px; height: 600px;">
        <div id="container-outer" class="rx-comp rx-container" style="position: absolute; left: 100px; top: 100px; width: 500px; height: 350px;">
          <div id="container-inner" class="rx-comp rx-container" style="position: absolute; left: 60px; top: 50px; width: 300px; height: 200px;"></div>
        </div>
      </div>
    `;

  await handlers.queryAllComponents({}, ctx);
  await handlers.collectCssClasses({}, ctx);
  handlers.collectLayoutData({}, ctx);
  handlers.buildUiFileContent({}, ctx);

  const ui = ctx.payload.uiFileContent;
  const ids = ui.components.map((c: any) => c.id);
  expect(ids).toEqual(
    expect.arrayContaining(["container-outer", "container-inner"])
  );

  const inner = ui.components.find((c: any) => c.id === "container-inner");
  expect(inner.template.tag).toBe("div");
  expect(inner.template.classRefs).toEqual(["rx-comp", "rx-container"]);
  expect(inner.layout).toMatchObject({ x: 60, y: 50, width: 300, height: 200 });
  expect(inner.parentId).toBe("container-outer");
});

it("exports a container with components inside a container", async () => {
  const ctx = makeIntegrationCtx();
  delete (ctx.io as any).cssRegistry;

  // Force DOM scan primary
  ctx.io.kv.getAll = async () => [];

  document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 800px; height: 600px;">
        <div id="outer" class="rx-comp rx-container" style="position: absolute; left: 80px; top: 80px; width: 560px; height: 400px;">
          <div id="inner" class="rx-comp rx-container" style="position: absolute; left: 40px; top: 40px; width: 400px; height: 300px;">
            <button id="btn-2" class="rx-comp rx-button" style="position: absolute; left: 24px; top: 20px; width: 120px; height: 40px;">Click</button>
            <input id="input-1" class="rx-comp rx-input" style="position: absolute; left: 24px; top: 80px; width: 220px; height: 32px;" />
          </div>
        </div>
      </div>
    `;

  await handlers.queryAllComponents({}, ctx);
  await handlers.collectCssClasses({}, ctx);
  handlers.collectLayoutData({}, ctx);
  handlers.buildUiFileContent({}, ctx);

  const ui = ctx.payload.uiFileContent;
  const ids = ui.components.map((c: any) => c.id);
  expect(ids).toEqual(
    expect.arrayContaining(["outer", "inner", "btn-2", "input-1"])
  );

  const inner = ui.components.find((c: any) => c.id === "inner");
  expect(inner.template.classRefs).toEqual(["rx-comp", "rx-container"]);
  expect(inner.parentId).toBe("outer");

  const button = ui.components.find((c: any) => c.id === "btn-2");
  expect(button.template.classRefs).toEqual(["rx-comp", "rx-button"]);
  expect(button.layout).toMatchObject({ x: 24, y: 20, width: 120, height: 40 });
  expect(button.parentId).toBe("inner");

  const input = ui.components.find((c: any) => c.id === "input-1");
  expect(input.template.tag).toBe("input");
  expect(input.layout).toMatchObject({ x: 24, y: 80, width: 220, height: 32 });
  expect(input.parentId).toBe("inner");
});
