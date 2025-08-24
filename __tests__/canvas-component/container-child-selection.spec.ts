/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";

function makeContainerTemplate() {
  return {
    tag: "div",
    text: "",
    classes: ["rx-comp", "rx-container"],
    css: ".rx-container { background: #f0f0f0; border: 2px dashed #ccc; }",
    cssVariables: {},
    dimensions: { width: 200, height: 150 },
    attributes: { "data-role": "container" },
  };
}

function makeChildTemplate() {
  return {
    tag: "button",
    text: "Child Button",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { background: #007acc; color: #fff; }",
    cssVariables: {},
    dimensions: { width: 100, height: 40 },
  };
}

function dispatchClick(el: Element, opts: any = {}) {
  const ev = new MouseEvent("click", { bubbles: true, cancelable: true, ...opts });
  el.dispatchEvent(ev);
}

function dispatchMouseDown(el: Element, opts: any = {}) {
  const ev = new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, ...opts });
  el.dispatchEvent(ev);
}

describe("Container child selection and drag issues (FAILING TESTS)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("FAILS: clicking child component should select child, not container", () => {
    const containerSelectedSpy = vi.fn();
    const childSelectedSpy = vi.fn();

    // Create container
    const ctx1 = { payload: {} } as any;
    createHandlers.resolveTemplate({ component: { template: makeContainerTemplate() } }, ctx1);
    createHandlers.createNode({ 
      position: { x: 50, y: 50 }, 
      onSelected: containerSelectedSpy 
    }, ctx1);

    const containerId = ctx1.payload.nodeId as string;
    const containerEl = document.getElementById(containerId)! as HTMLElement;

    // Create child inside container
    const ctx2 = { payload: {} } as any;
    createHandlers.resolveTemplate({ component: { template: makeChildTemplate() } }, ctx2);
    createHandlers.createNode({ 
      position: { x: 25, y: 30 }, 
      containerId,
      onSelected: childSelectedSpy 
    }, ctx2);

    const childId = ctx2.payload.nodeId as string;
    const childEl = document.getElementById(childId)! as HTMLElement;

    // Verify setup: child is inside container
    expect(childEl.parentElement).toBe(containerEl);

    // Click on child element
    dispatchClick(childEl);

    // EXPECTED: Only child should be selected
    expect(childSelectedSpy).toHaveBeenCalledWith({ id: childId });
    expect(containerSelectedSpy).not.toHaveBeenCalled();

    // ACTUAL: Both child and container get selected due to event bubbling
    // This test will FAIL until we fix event bubbling
  });

  it("FAILS: dragging child component should drag child, not container", () => {
    const containerDragStartSpy = vi.fn();
    const childDragStartSpy = vi.fn();

    // Create container
    const ctx1 = { payload: {} } as any;
    createHandlers.resolveTemplate({ component: { template: makeContainerTemplate() } }, ctx1);
    createHandlers.createNode({ 
      position: { x: 50, y: 50 }, 
      onDragStart: containerDragStartSpy 
    }, ctx1);

    const containerId = ctx1.payload.nodeId as string;
    const containerEl = document.getElementById(containerId)! as HTMLElement;

    // Create child inside container
    const ctx2 = { payload: {} } as any;
    createHandlers.resolveTemplate({ component: { template: makeChildTemplate() } }, ctx2);
    createHandlers.createNode({ 
      position: { x: 25, y: 30 }, 
      containerId,
      onDragStart: childDragStartSpy 
    }, ctx2);

    const childId = ctx2.payload.nodeId as string;
    const childEl = document.getElementById(childId)! as HTMLElement;

    // Verify setup: child is inside container
    expect(childEl.parentElement).toBe(containerEl);

    // Start drag on child element
    dispatchMouseDown(childEl, { clientX: 100, clientY: 100 });

    // EXPECTED: Only child drag should start
    expect(childDragStartSpy).toHaveBeenCalledWith({
      id: childId,
      startPosition: expect.any(Object),
      mousePosition: expect.any(Object),
    });
    expect(containerDragStartSpy).not.toHaveBeenCalled();

    // ACTUAL: Both child and container drag handlers fire due to event bubbling
    // This test will FAIL until we fix event bubbling
  });

  it("FAILS: child element should be visually contained within container bounds", () => {
    // Create container
    const ctx1 = { payload: {} } as any;
    createHandlers.resolveTemplate({ component: { template: makeContainerTemplate() } }, ctx1);
    createHandlers.createNode({ position: { x: 50, y: 50 } }, ctx1);

    const containerId = ctx1.payload.nodeId as string;
    const containerEl = document.getElementById(containerId)! as HTMLElement;

    // Create child inside container
    const ctx2 = { payload: {} } as any;
    createHandlers.resolveTemplate({ component: { template: makeChildTemplate() } }, ctx2);
    createHandlers.createNode({ 
      position: { x: 25, y: 30 }, 
      containerId 
    }, ctx2);

    const childId = ctx2.payload.nodeId as string;
    const childEl = document.getElementById(childId)! as HTMLElement;

    // Verify child is positioned relative to container
    expect(childEl.style.position).toBe("absolute");
    expect(childEl.style.left).toBe("25px");
    expect(childEl.style.top).toBe("30px");

    // Verify child is actually inside container DOM-wise
    expect(childEl.parentElement).toBe(containerEl);

    // EXPECTED: Child should be visually contained within container
    const containerRect = containerEl.getBoundingClientRect();
    const childRect = childEl.getBoundingClientRect();
    
    expect(childRect.left).toBeGreaterThanOrEqual(containerRect.left);
    expect(childRect.top).toBeGreaterThanOrEqual(containerRect.top);
    expect(childRect.right).toBeLessThanOrEqual(containerRect.right);
    expect(childRect.bottom).toBeLessThanOrEqual(containerRect.bottom);

    // This test may PASS for positioning but helps verify the setup for the other failing tests
  });
});
