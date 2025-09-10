/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

// For this suite, ensure resolveInteraction behaves like a thin bridge to window.RenderX
// so we can simulate resolver absence by deleting window.RenderX.resolveInteraction.
vi.mock("@renderx-plugins/host-sdk", async () => {
  const actual = (await vi.importActual<any>("@renderx-plugins/host-sdk"));
  return {
    ...actual,
    // Ensure warnings are not suppressed in this suite
    isFlagEnabled: () => true,
    resolveInteraction: (key: string) => {
      const g: any = globalThis as any;
      const fn = g?.window?.RenderX?.resolveInteraction;
      if (typeof fn !== "function") throw new Error("resolver missing");
      return fn(key);
    },
  };
});

import { EventRouter } from "@renderx-plugins/host-sdk";
import { LibraryPanel } from "../../plugins/library/ui/LibraryPanel";

function render(el: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(el);
  });
  return { container, root };
}

describe("Host EventRouter absence handling", () => {
  let warnSpy: any;
  let origRenderX: any;
  let origComm: any;

  beforeEach(() => {
    // Ensure window/global shapes exist
    if (typeof (globalThis as any).window === "undefined") (globalThis as any).window = {} as any;
    if (typeof (globalThis as any).document === "undefined") (globalThis as any).document = {} as any;

    // Save and preserve any host-provided functions from setup (like resolveInteraction)
    origRenderX = (window as any).RenderX;
    const prev = (window as any).RenderX || {};
    (window as any).RenderX = { ...prev };
    // Explicitly remove the EventRouter to simulate absence
    if ((window as any).RenderX && (window as any).RenderX.EventRouter) {
      delete (window as any).RenderX.EventRouter;
    }

    origComm = (window as any).renderxCommunicationSystem;
    (window as any).renderxCommunicationSystem = {
      conductor: { play: vi.fn() },
    } as any;

    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy?.mockRestore?.();
    (window as any).RenderX = origRenderX;
    (window as any).renderxCommunicationSystem = origComm;
    document.body.innerHTML = "";
  });

  it("warns and falls back to direct routing in LibraryPanel when host router is missing", async () => {
    const { root } = render(React.createElement(LibraryPanel));

    // Allow useEffect to run
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Expect fallback play() was invoked via resolveInteraction("library.load")
    const play = (window as any).renderxCommunicationSystem.conductor.play as ReturnType<typeof vi.fn>;
    expect(play).toHaveBeenCalled();

    // Cleanup
    act(() => {
      root.unmount();
    });
  });

  it("publishing control.panel.ui.render.requested warns when host router is missing", async () => {
    await EventRouter.publish("control.panel.ui.render.requested", { selectedElement: null }, (window as any).renderxCommunicationSystem.conductor);

    const warned = warnSpy.mock.calls.some(
      (args: any[]) => String(args[0]).includes("Host EventRouter not available") && String(args[1]).includes("control.panel.ui.render.requested")
    );
    expect(warned).toBe(true);
  });

  it("handles unknown interaction gracefully when both router and resolver are unavailable", async () => {
    // Simulate missing resolveInteraction (SDK internal defaults may not know the key)
    const prevResolve = (window as any).RenderX?.resolveInteraction;
    if ((window as any).RenderX) {
      delete (window as any).RenderX.resolveInteraction;
    }

    const { root } = render(React.createElement(LibraryPanel));

    // Allow useEffect to run
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Should not throw and should have warned about fallback being unavailable
    const warned = warnSpy.mock.calls.some((args: any[]) =>
      String(args[0]).includes("fallback routing unavailable") &&
      String(args[0]).includes("library.load")
    );
    expect(warned).toBe(true);

    // Cleanup and restore
    act(() => {
      root.unmount();
    });
    if ((window as any).RenderX && prevResolve) {
      (window as any).RenderX.resolveInteraction = prevResolve;
    }
  });

});

