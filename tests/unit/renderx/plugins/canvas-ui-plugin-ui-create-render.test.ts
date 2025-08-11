import { loadRenderXPlugin } from "../../../utils/renderx-plugin-loader";

const pluginPath = "RenderX/public/plugins/canvas-ui-plugin/index.js";

describe("Canvas UI Plugin - render created component after drop", () => {
  test.skip("After onDrop -> symphony calls onComponentCreated, CanvasPage renders the component", () => {
    const created: Array<{ type: any; props: any }> = [];

    const originalWindow: any = (global as any).window;
    const w: any = originalWindow || {};

    // Minimal React stub with state hooks would be ideal; start with createElement/useEffect only
    w.React = {
      useEffect: (fn: any) => fn(),
      createElement: (type: any, props: any, ...children: any[]) => {
        created.push({ type, props });
        return { type, props, children };
      },
    };

    const play = jest.fn();
    w.renderxCommunicationSystem = {
      conductor: {
        play: (...args: any[]) => play(...args),
      },
    };

    (global as any).window = w;

    try {
      const plugin = loadRenderXPlugin(pluginPath);
      plugin.CanvasPage({});

      // Locate workspace props and trigger onDrop
      const propsList = created.map((n) => n.props);
      const workspace = propsList.find(
        (p) =>
          p &&
          typeof p.className === "string" &&
          p.className.includes("canvas-workspace")
      );
      expect(workspace).toBeTruthy();
      expect(typeof workspace.onDrop).toBe("function");

      const e: any = {
        preventDefault: jest.fn(),
        clientX: 150,
        clientY: 80,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 100, top: 50 }),
        },
        dataTransfer: {
          getData: () => JSON.stringify({ type: "TestWidget", id: "widget-1" }),
        },
      };

      workspace.onDrop(e);

      // Simulate the drop symphony calling back to onComponentCreated
      expect(play).toHaveBeenCalled();
      const payload = play.mock.calls[0][2];
      expect(typeof payload.onComponentCreated).toBe("function");

      const newNode = {
        id: "widget-1",
        type: "TestWidget",
        props: { text: "Hello" },
      };
      payload.onComponentCreated(newNode);

      // Expect CanvasPage to reflect the created node in its render tree
      // For example by rendering a node with data-component-id
      const createdAgain = created.map((n) => n.props);
      const renderedComponent = createdAgain.find(
        (p) => p && p["data-component-id"] === "widget-1"
      );
      expect(renderedComponent).toBeTruthy();
    } finally {
      (global as any).window = originalWindow;
    }
  });
});
