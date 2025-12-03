/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock React and ReactDOM before importing modules
vi.mock("react", () => ({
  default: {
    createElement: vi.fn((type, props, ...children) => ({ type, props, children })),
  },
  startTransition: vi.fn((callback) => {
    // Execute callback immediately in tests for synchronous behavior
    callback();
  }),
}));

vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

vi.mock("@babel/standalone", () => ({
  // Return already-transformed, JSX-free code so compileReactCode can evaluate it
  // without hitting a SyntaxError on "<". We still assert on the original
  // source passed *into* transform in unit tests.
  transform: vi.fn((_code: string) => ({
    code: `export default function MockComponent(props) {
      return React.createElement("div", null, "Mock JSX");
    }`,
  })),
}));

import { handlers as createHandlers } from "../src/symphonies/create/create.symphony";
import { createRoot } from "react-dom/client";

// Get the mocked functions
const mockCreateRoot = vi.mocked(createRoot);
const mockRender = vi.fn();
const mockUnmount = vi.fn();

function makeReactComponentTemplate() {
  return {
    render: { strategy: "react" },
    content: {
      reactCode: "export default function Hello(){ return <div style={{padding:8}}>Hello React</div> }",
      props: {}
    },
    tag: "div",
    classes: ["rx-comp", "rx-react"],
    dimensions: { width: 240, height: 120 }
  };
}

function makeRegularComponentTemplate() {
  return {
    tag: "button",
    text: "Click Me",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { padding: 8px 16px; }",
    dimensions: { width: 120, height: 40 }
  };
}

function makeCtx() {
  return {
    payload: {},
    io: { kv: { put: vi.fn() } },
    logger: {
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
}

describe("React Component Integration Tests", () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    // Set up DOM environment with canvas
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';

    // Reset mocks and set up fresh mock implementations
    vi.clearAllMocks();
    mockCreateRoot.mockReturnValue({
      render: mockRender,
      unmount: mockUnmount,
    });
  });

  /**
   * @ac canvas-component-create-symphony:canvas-component-create-symphony:1.4:1
   *
   * Given: context.payload.kind is 'react' with valid reactCode
   * When: renderReact executes
   * Then: React code is validated before compilation
   *       JSX is transformed to JavaScript using Babel
   *       React component is compiled and mounted using createRoot
   *       rendering uses startTransition for non-blocking UI
   *       react.component.mounted event is published
   * And: operation completes within 200ms P95
   *      validation, compile, and render metrics are emitted
   *      context.payload.reactRendered is set to true
   */
  it("[AC:canvas-component-create-symphony:canvas-component-create-symphony:1.4:1] creates a React component through the complete create sequence", async () => {
    // Given: context.payload.kind is 'react' with valid reactCode
    const ctx = makeCtx();
    const template = makeReactComponentTemplate();
    const data = {
      component: { template },
      position: { x: 50, y: 80 }
    };

    // When: renderReact executes (via complete create sequence)
    await createHandlers.resolveTemplate(data, ctx);
    await createHandlers.registerInstance(data, ctx);
    await createHandlers.createNode(data, ctx);
    await createHandlers.renderReact(data, ctx);
    await createHandlers.notifyUi(data, ctx);

    // Then: React code is validated before compilation (mocked in this test)
    // Then: JSX is transformed to JavaScript using Babel (mocked in this test)
    expect(ctx.payload.kind).toBe("react");
    expect(ctx.payload.template.render.strategy).toBe("react");

    // Then: React component is compiled and mounted using createRoot
    const nodeId = ctx.payload.nodeId;
    expect(nodeId).toMatch(/^rx-node-/);

    const container = document.getElementById(nodeId);
    expect(container).toBeTruthy();
    expect(container?.classList.contains("rx-react")).toBe(true);

    expect(mockCreateRoot).toHaveBeenCalledWith(container);
    expect(mockRender).toHaveBeenCalled();

    // And: context.payload.reactRendered is set to true
    expect(ctx.payload.reactRendered).toBe(true);
  });

  /**
   * @ac canvas-component-create-symphony:canvas-component-create-symphony:1.4:5
   *
   * Given: context.payload.kind is not 'react'
   * When: renderReact is invoked
   * Then: handler returns early without processing
   * And: non-React components are not affected
   */
  it("[AC:canvas-component-create-symphony:canvas-component-create-symphony:1.4:5] handles regular (non-React) components without React rendering", async () => {
    // Given: context.payload.kind is not 'react'
    const ctx = makeCtx();
    const template = makeRegularComponentTemplate();
    const data = {
      component: { template },
      position: { x: 50, y: 80 }
    };

    // When: renderReact is invoked (via complete create sequence)
    await createHandlers.resolveTemplate(data, ctx);
    await createHandlers.registerInstance(data, ctx);
    await createHandlers.createNode(data, ctx);
    await createHandlers.renderReact(data, ctx);
    await createHandlers.notifyUi(data, ctx);

    // Then: handler returns early without processing
    expect(ctx.payload.kind).toBeUndefined();

    // And: non-React components are not affected
    const nodeId = ctx.payload.nodeId;
    const element = document.getElementById(nodeId);
    expect(element).toBeTruthy();
    expect(element?.tagName.toLowerCase()).toBe("button");
    expect(element?.textContent).toBe("Click Me");

    // Then: React rendering was skipped
    expect(mockCreateRoot).not.toHaveBeenCalled();
    expect(mockRender).not.toHaveBeenCalled();
    expect(ctx.payload.reactRendered).toBeUndefined();
  });

  it("handles React component with complex JSX", async () => {
    const ctx = makeCtx();
    const template = {
      render: { strategy: "react" },
      content: {
        reactCode: `
          export default function ComplexComponent() {
            return (
              <div style={{padding: '16px', border: '1px solid #ccc'}}>
                <h2>Complex React Component</h2>
                <p>This has multiple elements</p>
                <button onClick={() => alert('clicked')}>Click me</button>
              </div>
            );
          }
        `,
        props: {}
      },
      tag: "div",
      classes: ["rx-comp", "rx-react"],
      style: { width: 300, height: 200 }
    };

    const data = {
      component: { template },
      position: { x: 100, y: 100 }
    };

    // Execute the complete create sequence
    await createHandlers.resolveTemplate(data, ctx);
    await createHandlers.registerInstance(data, ctx);
    await createHandlers.createNode(data, ctx);
    await createHandlers.renderReact(data, ctx);
    await createHandlers.notifyUi(data, ctx);

    // Verify React component was processed
    expect(ctx.payload.kind).toBe("react");
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();
    expect(ctx.payload.reactRendered).toBe(true);
  });

  it("handles React component with syntax errors gracefully", async () => {
    // Mock createRoot to throw an error for this test
    mockCreateRoot.mockImplementationOnce(() => {
      throw new Error("React createRoot failed");
    });

    const ctx = makeCtx();
    const template = {
      render: { strategy: "react" },
      content: {
        reactCode: "export default function Hello() { return <div>Hello</div>; }",
        props: {}
      },
      tag: "div",
      classes: ["rx-comp", "rx-react"],
      style: { width: 240, height: 120 }
    };

    const data = {
      component: { template },
      position: { x: 50, y: 80 }
    };

    // Execute the complete create sequence
    await createHandlers.resolveTemplate(data, ctx);
    await createHandlers.registerInstance(data, ctx);
    await createHandlers.createNode(data, ctx);
    await createHandlers.renderReact(data, ctx);
    await createHandlers.notifyUi(data, ctx);

    // Verify error was handled
    expect(ctx.payload.kind).toBe("react");
    expect(ctx.payload.reactError).toBeDefined();
    expect(ctx.logger.error).toHaveBeenCalled();

    // Verify error message was displayed in container
    const nodeId = ctx.payload.nodeId;
    const container = document.getElementById(nodeId);
    expect(container?.innerHTML).toContain("React Error:");
  });

  it("creates React component with custom positioning and styling", async () => {
    const ctx = makeCtx();
    const template = makeReactComponentTemplate();
    const data = {
      component: { template },
      position: { x: 200, y: 150 }
    };

    // Execute the complete create sequence
    await createHandlers.resolveTemplate(data, ctx);
    await createHandlers.registerInstance(data, ctx);
    await createHandlers.createNode(data, ctx);
    await createHandlers.renderReact(data, ctx);
    await createHandlers.notifyUi(data, ctx);

    // Verify positioning was applied
    const nodeId = ctx.payload.nodeId;
    const container = document.getElementById(nodeId);
    expect(container?.style.left).toBe("200px");
    expect(container?.style.top).toBe("150px");
    expect(container?.style.width).toBe("240px");
    expect(container?.style.height).toBe("120px");

    // Verify React rendering
    expect(ctx.payload.reactRendered).toBe(true);
  });

  it("supports React component in container hierarchy", async () => {
    // First create a container
    const containerCtx = makeCtx();
    const containerTemplate = {
      tag: "div",
      classes: ["rx-comp", "rx-container"],
      attributes: { "data-role": "container" },
      dimensions: { width: 400, height: 300 }
    };

    await createHandlers.resolveTemplate({ component: { template: containerTemplate } }, containerCtx);
    await createHandlers.createNode({ position: { x: 50, y: 50 } }, containerCtx);

    const containerId = containerCtx.payload.nodeId;

    // Then create a React component inside the container
    const reactCtx = makeCtx();
    const reactTemplate = makeReactComponentTemplate();
    const reactData = {
      component: { template: reactTemplate },
      position: { x: 25, y: 30 },
      containerId
    };

    await createHandlers.resolveTemplate(reactData, reactCtx);
    await createHandlers.registerInstance(reactData, reactCtx);
    await createHandlers.createNode(reactData, reactCtx);
    await createHandlers.renderReact(reactData, reactCtx);
    await createHandlers.notifyUi(reactData, reactCtx);

    // Verify React component was created inside container
    const reactNodeId = reactCtx.payload.nodeId;
    const reactElement = document.getElementById(reactNodeId);
    const containerElement = document.getElementById(containerId);
    
    expect(reactElement?.parentElement).toBe(containerElement);
    expect(reactCtx.payload.reactRendered).toBe(true);
  });
});
