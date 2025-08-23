/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library-component/symphonies/drag.symphony";

/**
 * Failing spec: The drag ghost styling should honor preview-provided CSS variables.
 * We inject CSS variables onto the ghost root (style.setProperty) or via a scoped style block.
 */

describe("library-component drag preview CSS variables", () => {
  it("applies preview.cssVariables to the ghost so color and theming are visible during drag (FAILS until implemented)", () => {
    const setData = vi.fn();
    const setDragImage = vi.fn();
    const dataTransfer: any = { setData, setDragImage };

    const domEvent: any = { dataTransfer };

    const component = {
      id: "comp-vars",
      name: "Button",
      preview: {
        width: 100,
        height: 32,
        html: '<button class="rx-button">Button</button>',
        className: "rx-button",
        css: ".rx-button { background: var(--bg); color: var(--fg); }",
        cssVariables: { "--bg": "rgb(17,34,51)", "--fg": "white" },
      },
    } as any;

    handlers.onDragStart({ domEvent, component });

    expect(setData).toHaveBeenCalled();
    expect(setDragImage).toHaveBeenCalled();

    const [ghostEl] = (setDragImage as any).mock.calls[0];
    const ghost = ghostEl as HTMLElement;
    // CSS variables applied on the ghost root
    expect(getComputedStyle(ghost).getPropertyValue("--bg").trim()).toBe("rgb(17,34,51)");
    expect(getComputedStyle(ghost).getPropertyValue("--fg").trim()).toBe("white");
  });
});

