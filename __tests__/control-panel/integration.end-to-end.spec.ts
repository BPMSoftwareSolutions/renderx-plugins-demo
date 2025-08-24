/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { handlers as selectHandlers } from "../../plugins/canvas-component/symphonies/select/select.symphony";
import { handlers as controlPanelHandlers } from "../../plugins/control-panel/symphonies/selection/selection.symphony";
import { handlers as classHandlers } from "../../plugins/control-panel/symphonies/classes/classes.symphony";
import { setSelectionObserver, setClassesObserver } from "../../plugins/control-panel/state/observer.store";

function makeButtonTemplate() {
  return {
    tag: "button",
    text: "Click me",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { background: var(--bg-color); color: var(--text-color); }",
    cssVariables: { "bg-color": "#007acc", "text-color": "#ffffff" },
    dimensions: { width: 120, height: 40 },
  };
}

describe("Control Panel Integration - End to End", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
    vi.clearAllMocks();
  });

  it("complete flow: create element → select → control panel updates → add class → UI updates", () => {
    // Mock observers
    const selectionObserver = vi.fn();
    const classesObserver = vi.fn();
    
    setSelectionObserver(selectionObserver);
    setClassesObserver(classesObserver);

    // Step 1: Create a canvas element
    const createCtx: any = { payload: {} };
    const template = makeButtonTemplate();
    
    createHandlers.resolveTemplate({ component: { template } }, createCtx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, createCtx);
    
    const nodeId = createCtx.payload.nodeId as string;
    const element = document.getElementById(nodeId)!;
    
    expect(element).toBeTruthy();
    expect(element.classList.contains("rx-button")).toBe(true);

    // Step 2: Select the element (this should forward to Control Panel)
    const selectCtx = {
      conductor: {
        play: vi.fn((pluginId: string, sequenceId: string, data: any) => {
          // Mock the conductor.play call to Control Panel
          if (pluginId === "ControlPanelPlugin" && sequenceId === "control-panel-selection-show-symphony") {
            // Simulate the Control Panel selection sequence
            const controlCtx = { payload: {} };
            controlPanelHandlers.deriveSelectionModel(data, controlCtx);
            controlPanelHandlers.notifyUi({}, controlCtx);
          }
        })
      }
    };

    selectHandlers.notifyUi({ id: nodeId }, selectCtx);

    // Verify selection forwarding happened
    expect(selectCtx.conductor.play).toHaveBeenCalledWith(
      "ControlPanelPlugin",
      "control-panel-selection-show-symphony",
      { id: nodeId }
    );

    // Verify Control Panel observer was called with selection model
    expect(selectionObserver).toHaveBeenCalledWith(
      expect.objectContaining({
        header: { type: "button", id: nodeId },
        content: expect.objectContaining({ content: "Click me" }),
        layout: { x: 50, y: 30, width: 120, height: 40 },
        classes: expect.arrayContaining(["rx-comp", "rx-button"])
      })
    );

    // Step 3: Add a CSS class via Control Panel
    const classCtx = { payload: {} };
    classHandlers.addClass({ id: nodeId, className: "rx-button--primary" }, classCtx);
    classHandlers.notifyUi({}, classCtx);

    // Verify class was added to DOM
    expect(element.classList.contains("rx-button--primary")).toBe(true);

    // Verify classes observer was called
    expect(classesObserver).toHaveBeenCalledWith({
      id: nodeId,
      classes: expect.arrayContaining(["rx-comp", "rx-button", "rx-button--primary"])
    });

    // Step 4: Remove a CSS class via Control Panel
    const removeClassCtx = { payload: {} };
    classHandlers.removeClass({ id: nodeId, className: "rx-button--primary" }, removeClassCtx);
    classHandlers.notifyUi({}, removeClassCtx);

    // Verify class was removed from DOM
    expect(element.classList.contains("rx-button--primary")).toBe(false);

    // Verify classes observer was called again
    expect(classesObserver).toHaveBeenCalledWith({
      id: nodeId,
      classes: expect.not.arrayContaining(["rx-button--primary"])
    });

    // Cleanup
    setSelectionObserver(null);
    setClassesObserver(null);
  });
});
