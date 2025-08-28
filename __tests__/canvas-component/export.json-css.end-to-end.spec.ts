/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as _libraryHandlers } from "../../plugins/library/symphonies/load.symphony";
import { handlers as exportHandlers } from "../../plugins/canvas-component/symphonies/export/export.symphony";
import { cssRegistry } from "../../plugins/control-panel/state/css-registry.store";

function setupCanvas() {
  const canvas = document.createElement("div");
  canvas.id = "rx-canvas";
  canvas.style.cssText =
    "position: absolute; left: 0; top: 0; width: 1200px; height: 800px;";
  document.body.innerHTML = "";
  document.body.appendChild(canvas);
}

function makeExportCtx() {
  return {
    payload: {},
    io: {
      kv: {
        getAll: async () => [
          {
            id: "rx-node-1",
            type: "button",
            classes: ["rx-comp", "rx-button"],
            style: {},
            createdAt: Date.now(),
          },
        ],
      },
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
    },
  } as any;
}

describe("Export includes JSON component CSS end-to-end", () => {
  beforeEach(() => {
    setupCanvas();
  });

  it("exports CSS classes from registry in the UI file", async () => {
    // 1. Manually register JSON component CSS (simulating what library load should do)
    const jsonButtonCss =
      ".rx-button { background-color: var(--bg-color); color: var(--text-color); } .rx-button--primary { --bg-color: #007bff; --text-color: #ffffff; } .rx-button--secondary { --bg-color: #6c757d; --text-color: #ffffff; }";
    cssRegistry.updateClass("rx-button", jsonButtonCss);

    // 2. Verify CSS was registered
    const buttonClass = cssRegistry.getClass("rx-button");
    expect(buttonClass).toBeDefined();
    expect(buttonClass?.content || "").toContain(".rx-button--primary");

    // 3. Run export flow
    const exportCtx = makeExportCtx();

    // Query components
    await exportHandlers.queryAllComponents({}, exportCtx);
    expect(exportCtx.payload.components).toHaveLength(1);

    // Collect CSS classes (this reads from cssRegistry)
    exportHandlers.collectCssClasses({}, exportCtx);
    expect(exportCtx.payload.cssClasses).toBeDefined();
    expect(exportCtx.payload.cssClasses["rx-button"]).toBeDefined();

    // Collect layout data
    exportHandlers.collectLayoutData({}, exportCtx);

    // Build UI file content
    exportHandlers.buildUiFileContent({}, exportCtx);

    // 4. Verify the exported UI file includes JSON CSS
    const uiFile = exportCtx.payload.uiFileContent;
    expect(uiFile).toBeDefined();
    expect(uiFile.cssClasses).toBeDefined();
    expect(uiFile.cssClasses["rx-button"]).toBeDefined();

    // 5. Verify the CSS content includes JSON variant selectors
    const exportedButtonCss = uiFile.cssClasses["rx-button"];
    expect(exportedButtonCss.content).toContain(".rx-button--primary");
    expect(exportedButtonCss.content).toContain(".rx-button--secondary");
    expect(exportedButtonCss.name).toBe("rx-button");

    // 6. Verify the component references the class
    expect(uiFile.components).toHaveLength(1);
    expect(uiFile.components[0].template.classRefs).toContain("rx-button");
  });
});
