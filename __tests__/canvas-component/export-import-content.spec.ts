/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as exportHandlers } from "../../plugins/canvas-component/symphonies/export/export.symphony";
import { handlers as importHandlers } from "../../plugins/canvas-component/symphonies/import/import.symphony";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";

function setupCanvas() {
  const root = document.createElement("div");
  root.innerHTML = `<div id="rx-canvas" style="position:absolute; left:0; top:0; width:1200px; height:800px;"></div>`;
  document.body.innerHTML = "";
  document.body.appendChild(root);
}

function makeExportCtx() {
  const ops: any[] = [];
  const kvStore = new Map();

  return {
    payload: {},
    io: {
      kv: {
        getAll: vi.fn(async () => Array.from(kvStore.values())),
        put: vi.fn(async (...a: any[]) => ops.push(["kv.put", ...a])),
      },
      cssRegistry: {
        getClass: vi.fn((name: string) => ({
          name,
          content: `.${name} { display: block; }`,
        })),
      },
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    _ops: ops,
    _kvStore: kvStore,
  } as any;
}

function makeImportCtx() {
  const ops: any[] = [];
  return {
    payload: {},
    io: {
      kv: {
        put: vi.fn(async (...a: any[]) => ops.push(["kv.put", ...a])),
      },
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    conductor: {
      play: vi.fn(async (pluginId: string, sequenceId: string, data: any) => {
        ops.push(["conductor.play", pluginId, sequenceId, data]);
        // Mock the canvas.component.create behavior for testing
        if (sequenceId === "canvas-component-create-symphony") {
          const createCtx = {
            payload: {},
            io: {
              kv: {
                put: vi.fn(async (...a: any[]) => ops.push(["kv.put", ...a])),
              },
            },
          };
          await createHandlers.resolveTemplate(data, createCtx);
          await createHandlers.registerInstance(data, createCtx);
          await createHandlers.createNode(data, createCtx);
          await createHandlers.notifyUi(data, createCtx);
        }
      }),
    },
    _ops: ops,
  } as any;
}

describe("canvas-component export/import content preservation", () => {
  beforeEach(() => {
    setupCanvas();
  });

  it("should export and import button content correctly", async () => {
    const exportCtx = makeExportCtx();

    // Create a button with custom text in the DOM
    document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 1200px; height: 800px;">
        <button id="btn-1" class="rx-comp rx-button" style="position: absolute; left: 100px; top: 150px; width: 120px; height: 40px;">Save Changes</button>
      </div>
    `;

    // Force DOM scan (no KV components)
    exportCtx.io.kv.getAll = vi.fn(async () => []);

    // Execute export flow
    await exportHandlers.queryAllComponents({}, exportCtx);
    await exportHandlers.collectCssClasses({}, exportCtx);
    exportHandlers.collectLayoutData({}, exportCtx);
    exportHandlers.buildUiFileContent({}, exportCtx);

    const uiFile = exportCtx.payload.uiFileContent;
    const buttonComponent = uiFile.components.find(
      (c: any) => c.id === "btn-1"
    );

    // Verify button content was captured
    expect(buttonComponent).toBeDefined();
    expect(buttonComponent.content).toBeDefined();
    expect(buttonComponent.content.content).toBe("Save Changes");
    expect(buttonComponent.content.text).toBe("Save Changes");

    // Now test import
    const importCtx = makeImportCtx();
    setupCanvas(); // Reset canvas for import

    // Provide the exported UI file content
    importCtx.payload.uiFileContent = uiFile;

    // Execute import flow
    await importHandlers.parseUiFile({}, importCtx);
    await importHandlers.injectCssClasses({}, importCtx);
    await importHandlers.createComponentsSequentially({}, importCtx);
    await importHandlers.applyHierarchyAndOrder({}, importCtx);

    // Verify button was recreated with correct content
    const importedButton = document.getElementById(
      "btn-1"
    ) as HTMLButtonElement;
    expect(importedButton).toBeTruthy();
    expect(importedButton.textContent).toBe("Save Changes");

    // Verify KV store contains content
    const kvCalls = importCtx._ops.filter((op: any) => op[0] === "kv.put");
    const buttonKvCall = kvCalls.find((call: any) => call[1] === "btn-1");
    expect(buttonKvCall).toBeDefined();
    expect(buttonKvCall[2].content).toBeDefined();
    expect(buttonKvCall[2].content.content).toBe("Save Changes");
  });

  it("should export and import input content correctly", async () => {
    const exportCtx = makeExportCtx();

    // Create an input with custom placeholder and value in the DOM
    document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 1200px; height: 800px;">
        <input id="input-1" class="rx-comp rx-input" type="email" placeholder="Enter your email address" value="user@example.com" style="position: absolute; left: 200px; top: 100px; width: 250px; height: 32px;" />
      </div>
    `;

    // Force DOM scan (no KV components)
    exportCtx.io.kv.getAll = vi.fn(async () => []);

    // Execute export flow
    await exportHandlers.queryAllComponents({}, exportCtx);
    await exportHandlers.collectCssClasses({}, exportCtx);
    exportHandlers.collectLayoutData({}, exportCtx);
    exportHandlers.buildUiFileContent({}, exportCtx);

    const uiFile = exportCtx.payload.uiFileContent;
    const inputComponent = uiFile.components.find(
      (c: any) => c.id === "input-1"
    );

    // Verify input content was captured
    expect(inputComponent).toBeDefined();
    expect(inputComponent.content).toBeDefined();
    expect(inputComponent.content.placeholder).toBe("Enter your email address");
    expect(inputComponent.content.value).toBe("user@example.com");
    expect(inputComponent.content.inputType).toBe("email");

    // Now test import
    const importCtx = makeImportCtx();
    setupCanvas(); // Reset canvas for import

    // Provide the exported UI file content
    importCtx.payload.uiFileContent = uiFile;

    // Execute import flow
    await importHandlers.parseUiFile({}, importCtx);
    await importHandlers.injectCssClasses({}, importCtx);
    await importHandlers.createComponentsSequentially({}, importCtx);
    await importHandlers.applyHierarchyAndOrder({}, importCtx);

    // Verify input was recreated with correct content
    const importedInput = document.getElementById(
      "input-1"
    ) as HTMLInputElement;
    expect(importedInput).toBeTruthy();
    expect(importedInput.placeholder).toBe("Enter your email address");
    expect(importedInput.value).toBe("user@example.com");
    expect(importedInput.type).toBe("email");

    // Verify KV store contains content
    const kvCalls = importCtx._ops.filter((op: any) => op[0] === "kv.put");
    const inputKvCall = kvCalls.find((call: any) => call[1] === "input-1");
    expect(inputKvCall).toBeDefined();
    expect(inputKvCall[2].content).toBeDefined();
    expect(inputKvCall[2].content.placeholder).toBe("Enter your email address");
    expect(inputKvCall[2].content.value).toBe("user@example.com");
    expect(inputKvCall[2].content.inputType).toBe("email");
  });

  it("should export and import disabled button state", async () => {
    const exportCtx = makeExportCtx();

    // Create a disabled button in the DOM
    document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 1200px; height: 800px;">
        <button id="btn-disabled" class="rx-comp rx-button" disabled style="position: absolute; left: 100px; top: 200px; width: 120px; height: 40px;">Disabled Button</button>
      </div>
    `;

    // Force DOM scan (no KV components)
    exportCtx.io.kv.getAll = vi.fn(async () => []);

    // Execute export flow
    await exportHandlers.queryAllComponents({}, exportCtx);
    await exportHandlers.collectCssClasses({}, exportCtx);
    exportHandlers.collectLayoutData({}, exportCtx);
    exportHandlers.buildUiFileContent({}, exportCtx);

    const uiFile = exportCtx.payload.uiFileContent;
    const buttonComponent = uiFile.components.find(
      (c: any) => c.id === "btn-disabled"
    );

    // Verify disabled state was captured
    expect(buttonComponent).toBeDefined();
    expect(buttonComponent.content).toBeDefined();
    expect(buttonComponent.content.disabled).toBe(true);
    expect(buttonComponent.content.content).toBe("Disabled Button");

    // Now test import
    const importCtx = makeImportCtx();
    setupCanvas(); // Reset canvas for import

    // Provide the exported UI file content
    importCtx.payload.uiFileContent = uiFile;

    // Execute import flow
    await importHandlers.parseUiFile({}, importCtx);
    await importHandlers.injectCssClasses({}, importCtx);
    await importHandlers.createComponentsSequentially({}, importCtx);
    await importHandlers.applyHierarchyAndOrder({}, importCtx);

    // Verify button was recreated with disabled state
    const importedButton = document.getElementById(
      "btn-disabled"
    ) as HTMLButtonElement;
    expect(importedButton).toBeTruthy();
    expect(importedButton.disabled).toBe(true);
    expect(importedButton.textContent).toBe("Disabled Button");
  });

  it("should export and import required input state", async () => {
    const exportCtx = makeExportCtx();

    // Create a required input in the DOM
    document.body.innerHTML = `
      <div id="rx-canvas" style="position: relative; width: 1200px; height: 800px;">
        <input id="input-required" class="rx-comp rx-input" type="text" placeholder="Required field" required style="position: absolute; left: 200px; top: 150px; width: 200px; height: 32px;" />
      </div>
    `;

    // Force DOM scan (no KV components)
    exportCtx.io.kv.getAll = vi.fn(async () => []);

    // Execute export flow
    await exportHandlers.queryAllComponents({}, exportCtx);
    await exportHandlers.collectCssClasses({}, exportCtx);
    exportHandlers.collectLayoutData({}, exportCtx);
    exportHandlers.buildUiFileContent({}, exportCtx);

    const uiFile = exportCtx.payload.uiFileContent;
    const inputComponent = uiFile.components.find(
      (c: any) => c.id === "input-required"
    );

    // Verify required state was captured
    expect(inputComponent).toBeDefined();
    expect(inputComponent.content).toBeDefined();
    expect(inputComponent.content.required).toBe(true);
    expect(inputComponent.content.placeholder).toBe("Required field");

    // Now test import
    const importCtx = makeImportCtx();
    setupCanvas(); // Reset canvas for import

    // Provide the exported UI file content
    importCtx.payload.uiFileContent = uiFile;

    // Execute import flow
    await importHandlers.parseUiFile({}, importCtx);
    await importHandlers.injectCssClasses({}, importCtx);
    await importHandlers.createComponentsSequentially({}, importCtx);
    await importHandlers.applyHierarchyAndOrder({}, importCtx);

    // Verify input was recreated with required state
    const importedInput = document.getElementById(
      "input-required"
    ) as HTMLInputElement;
    expect(importedInput).toBeTruthy();
    expect(importedInput.required).toBe(true);
    expect(importedInput.placeholder).toBe("Required field");
  });
});
