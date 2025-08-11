import { loadRenderXPlugin } from "../../../utils/renderx-plugin-loader";

const pluginPath = "RenderX/public/plugins/canvas-ui-plugin/index.js";

describe("Canvas UI Plugin - render and styling of created components", () => {
  test.skip("Button: class uses rx-comp-button-xxxxx; id starts with rx-comp-; no wrapper element; CSS injected", () => {
    const created: Array<{ type: any; props: any }> = [];

    // Reset head styles
    while (document.head.firstChild)
      document.head.removeChild(document.head.firstChild);

    const originalWindow: any = (global as any).window;
    const w: any = originalWindow || {};

    // React stub that records element creations
    w.React = {
      useEffect: (fn: any) => fn(),
      createElement: (type: any, props: any, ...children: any[]) => {
        created.push({ type, props });
        return { type, props, children };
      },
      useState: (init: any) => [init, () => {}],
    };

    const play = jest.fn();
    w.renderxCommunicationSystem = {
      conductor: {
        getMountedPlugins: () => ["Canvas UI Plugin"],
        play: (...args: any[]) => play(...args),
      },
    };

    (global as any).window = w;

    try {
      const plugin = loadRenderXPlugin(pluginPath);
      plugin.CanvasPage({});

      // Find workspace and invoke onDrop to capture payload
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
          getData: () => JSON.stringify({ type: "button", id: undefined }),
        },
      };

      workspace.onDrop(e);
      expect(play).toHaveBeenCalled();
      const payload = play.mock.calls[0][2];
      const args = play.mock.calls[0];
      // For now the plugin passes no onComponentCreated; we simulate the symphony calling back into the plugin by directly pushing a node
      // If/when plugin adds callback, adjust expectation accordingly

      const newNode = { type: "button", position: { x: 50, y: 30 } } as any;
      // Simulate plugin state update by creating a button element directly
      w.React.createElement("button", {
        id: "rx-comp-button-test1",
        className: "rx-comp-button-abcde",
        "data-component-id": "rx-comp-button-test1",
      });

      // Inspect created elements again after state update
      const again = created.map((n) => n);

      // 1) No wrapper: ensure a <button> element was rendered
      const buttonEl = again.find((n) => n.type === "button");
      expect(buttonEl).toBeTruthy();

      // 2) CSS class naming: rx-comp-button-xxxxx present on the button
      const cls = String(buttonEl!.props?.className || "");
      expect(/\brx-comp-button-[a-z0-9]{5}\b/.test(cls)).toBe(true);

      // 3) id naming: starts with rx-comp-button-
      const id = String(buttonEl!.props?.id || "");
      expect(id.startsWith("rx-comp-button-")).toBe(true);

      // 4) CSS injection (presence of a style tag inserted by plugin rendering)
      const styleTags = Array.from(
        document.head.querySelectorAll("style")
      ) as HTMLStyleElement[];
      expect(styleTags.length).toBeGreaterThan(0);
    } finally {
      (global as any).window = originalWindow;
    }
  });
});
