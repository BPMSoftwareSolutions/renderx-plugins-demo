/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library-component/symphonies/drag.symphony";

/**
 * Spec: Drag ghost styling should be driven by component JSON preview fields.
 * - preview.html: HTML markup of the component
 * - preview.className: class to apply to the ghost root (or ensure present)
 * - preview.css: CSS rules to style the ghost (scoped by className or selectors in html)
 */

describe("library-component drag preview CSS (data-driven)", () => {
  it("injects className and CSS into the ghost so preview rendering is data-driven", () => {
    const setData = vi.fn();
    const setDragImage = vi.fn();
    const dataTransfer: any = { setData, setDragImage };

    const domEvent: any = { dataTransfer };

    const component = {
      id: "comp-css",
      name: "Button",
      preview: {
        width: 100,
        height: 32,
        html: '<button class="rx-button">Button</button>',
        className: "rx-button",
        css: ".rx-button { background: rgb(17, 34, 51); color: white; padding: 8px 12px; }",
      },
    } as any;

    handlers.onDragStart({ domEvent, component });

    expect(setData).toHaveBeenCalled();
    expect(setDragImage).toHaveBeenCalled();

    const [ghostEl] = (setDragImage as any).mock.calls[0];
    const ghost = ghostEl as HTMLElement;
    // Expect inner element with the provided class
    const btn = ghost.querySelector(".rx-button") as HTMLElement | null;
    expect(btn).toBeTruthy();

    // Expect a style tag containing the provided CSS rules
    const styleEl = ghost.querySelector("style");
    expect(styleEl).toBeTruthy();
    expect(styleEl!.textContent || "").toContain(".rx-button");
  });
});

