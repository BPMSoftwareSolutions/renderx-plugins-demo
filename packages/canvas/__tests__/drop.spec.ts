/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
vi.mock("@renderx-plugins/host-sdk", async (orig) => {
  const actual = await (orig as any).importActual?.("@renderx-plugins/host-sdk");
  return {
    ...actual,
    EventRouter: {
      publish: (key: string, payload: any, conductor?: any) => {
        try {
          const routeKey = key === "library.container.drop.requested"
            ? "library.container.drop"
            : key === "library.component.drop.requested"
            ? "library.component.drop"
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

describe("canvas drop triggers library-component drop sequence", () => {
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
  it.skip("calls conductor.play with LibraryComponentPlugin and library-component-drop-symphony", async () => {
    const calls: any[] = [];
    const conductor = {
      play: vi.fn((pluginId: string, seqId: string) => calls.push([pluginId, seqId])),
    } as any;

    const fakeEvent: any = {
      preventDefault: vi.fn(),
      dataTransfer: { getData: vi.fn(() => JSON.stringify({ component: { id: "x" } })) },
      clientX: 10,
      clientY: 20,
      currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
    };

    await onDropForTest(fakeEvent, conductor);

    const found = calls.find((c) => c[0] === "LibraryComponentDropPlugin" && c[1] === "library-component-drop-symphony");
    expect(found).toBeTruthy();
  });
});

