/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library-component/symphonies/drag.symphony";

/**
 * Failing spec: Library items provided by library-load-symphony are mapped into
 * component.template.{css, cssVariables, tag, text, classes}. The drag preview should
 * use these to style the ghost and show theming/colors.
 */

describe("library-component drag preview from component.template shape", () => {
  it("applies template.css + template.cssVariables and renders a child with template.classes (FAILS until implemented)", () => {
    const setData = vi.fn();
    const setDragImage = vi.fn();
    const dataTransfer: any = { setData, setDragImage };

    const domEvent: any = { dataTransfer };

    const component = {
      id: "json-button",
      name: "Button",
      template: {
        tag: "button",
        text: "Click me",
        classes: ["rx-comp", "rx-button"],
        css: ".rx-button { background: var(--bg-color); color: var(--text-color); }",
        cssVariables: { "bg-color": "rgb(17,34,51)", "text-color": "white" },
      },
    } as any;

    handlers.onDragStart({ domEvent, component });

    expect(setData).toHaveBeenCalled();
    expect(setDragImage).toHaveBeenCalled();

    const [ghostEl] = (setDragImage as any).mock.calls[0];
    const ghost = ghostEl as HTMLElement;

    // Child element with rx-button class exists
    const child = ghost.querySelector(".rx-button");
    expect(child).toBeTruthy();

    // Style tag contains CSS
    const styleEl = ghost.querySelector("style");
    expect(styleEl).toBeTruthy();
    expect(styleEl!.textContent || "").toContain(".rx-button");

    // Variables mapped to CSS custom properties on the ghost
    expect(getComputedStyle(ghost).getPropertyValue("--bg-color").trim()).toBe("rgb(17,34,51)");
    expect(getComputedStyle(ghost).getPropertyValue("--text-color").trim()).toBe("white");
  });
});

