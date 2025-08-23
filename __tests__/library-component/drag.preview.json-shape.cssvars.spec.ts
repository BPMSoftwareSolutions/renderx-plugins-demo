/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library-component/symphonies/drag.symphony";

/**
 * Failing spec: Real library items come from JSON with ui.styles.css and ui.styles.variables
 * (no preview.cssVariables). The drag handler should map those variables to CSS custom
 * properties on the ghost so theming is visible during drag.
 */

describe("library-component drag preview using JSON ui.styles.variables (no preview field)", () => {
  it("applies ui.styles.variables as CSS custom properties on the ghost (FAILS until implemented)", () => {
    const setData = vi.fn();
    const setDragImage = vi.fn();
    const dataTransfer: any = { setData, setDragImage };

    const domEvent: any = { dataTransfer };

    const component = {
      id: "json-button",
      name: "Button",
      ui: {
        // keep template simple & already-resolved to avoid templating in handler
        templateResolved: '<button class="rx-button rx-button--primary rx-button--medium">Button</button>',
        styles: {
          css: ".rx-button { background-color: var(--bg-color); color: var(--text-color); }",
          variables: {
            "bg-color": "rgb(17,34,51)",
            "text-color": "white"
          }
        }
      }
    } as any;

    handlers.onDragStart({ domEvent, component });

    expect(setData).toHaveBeenCalled();
    expect(setDragImage).toHaveBeenCalled();

    const [ghostEl] = (setDragImage as any).mock.calls[0];
    const ghost = ghostEl as HTMLElement;

    // Should inject style tag with ui.styles.css
    const styleEl = ghost.querySelector("style");
    expect(styleEl).toBeTruthy();
    expect(styleEl!.textContent || "").toContain(".rx-button");

    // Should map ui.styles.variables → CSS custom properties (with "--" prefix)
    expect(getComputedStyle(ghost).getPropertyValue("--bg-color").trim()).toBe("rgb(17,34,51)");
    expect(getComputedStyle(ghost).getPropertyValue("--text-color").trim()).toBe("white");
  });
});

