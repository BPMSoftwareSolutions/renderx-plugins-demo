/* @vitest-environment jsdom */
import { vi, describe, it, expect, beforeEach } from "vitest";
vi.mock("@renderx-plugins/host-sdk", async (orig) => {
  const actual = await (orig as any).importActual?.("@renderx-plugins/host-sdk");
  return {
    ...actual,
    EventRouter: {
      publish: (key: string, payload: any, conductor?: any) => {
        try {
          const routeKey = key === "library:container:drop"
            ? "library:container:drop"
            : key === "library:component:drop"
            ? "library:component:drop"
            : null;
          if (routeKey && conductor?.play) {
            const r = (actual as any).resolveInteraction(routeKey);
            conductor.play(r.pluginId, r.sequenceId, payload);
          }
        } catch {}
      },
    },
  } as any;
});

import { onDropForTest } from "../src/ui/CanvasDrop";

function makeConductor() {
  const calls: any[] = [];
  return {
    calls,
    play(pluginId: string, sequenceId: string, payload: any) {
      calls.push([pluginId, sequenceId, payload]);
    },
  } as any;
}

describe("CanvasDrop routes to library.container.drop when dropping onto a container", () => {
  let _ctx: any;
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
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it.skip("selects container route and passes containerId with container-relative position", async () => {
    const canvas = document.getElementById("rx-canvas")! as HTMLElement;
    const container = document.createElement("div");
    container.id = "rx-node-ct1";
    (container as any).dataset.role = "container";
    container.style.position = "absolute";
    (container as any).getBoundingClientRect = () => ({ left: 100, top: 50, width: 200, height: 150, right: 300, bottom: 200, x: 100, y: 50, toJSON() {} });
    canvas.appendChild(container);
    (canvas as any).getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON() {} });

    const e: any = {
      preventDefault() {},
      clientX: 125,
      clientY: 80,
      currentTarget: canvas,
      target: container,
      dataTransfer: {
        getData: (type: string) => (type === "application/rx-component" ? JSON.stringify({ component: { template: { tag: "button", classes: ["rx-comp", "rx-button"], dimensions: { width: 100, height: 40 } } } }) : ""),
      },
    };

    const conductor = makeConductor();

    await onDropForTest(e, conductor);

    const found = conductor.calls.find((c: any) => c[0] === "LibraryComponentDropPlugin" && c[1] === "library-component-container-drop-symphony");
    expect(found).toBeTruthy();
    const payload = found[2];
    expect(payload.containerId).toBe("rx-node-ct1");
    expect(payload.position).toEqual({ x: 25, y: 30 });
  });
});

