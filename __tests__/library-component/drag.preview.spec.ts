/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library-component/symphonies/drag.symphony";

/**
 * Spec: While dragging a component from the Library onto the Canvas, a ghost image (drag preview)
 * should be displayed. That ghost image must be a slightly blurred image of the actual component
 * (same width and height) so the user can accurately place it on the canvas.
 *
 * Current behavior: handlers.onDragStart only sets dataTransfer payload; no drag image is set.
 * This test intentionally fails until the feature is implemented.
 */

describe("library-component drag preview (ghost image)", () => {
  it("sets a blurred drag image matching the component preview size", () => {
    const setData = vi.fn();
    const setDragImage = vi.fn();
    const dataTransfer: any = { setData, setDragImage };
    const domEvent: any = { dataTransfer };

    const component = {
      id: "comp-1",
      name: "Button",
      // Proposed shape: allow preview hints so drag.symphony can synthesize a DOM preview
      preview: { width: 120, height: 40, html: "<button>Button</button>" },
    } as any;

    // Act: start drag via handler (what LibraryPanel calls through conductor)
    handlers.onDragStart({ domEvent, component });

    // Sanity: payload still set as before
    expect(setData).toHaveBeenCalledWith(
      "application/rx-component",
      JSON.stringify({ component })
    );

    // Failing expectation: a custom drag image should be set
    expect(setDragImage).toHaveBeenCalled();

    // Additional expectations (will only run once the above passes)
    const call = (setDragImage as any).mock?.calls?.[0];
    if (call) {
      const [ghostEl, offsetX, offsetY] = call;
      expect(ghostEl).toBeInstanceOf(HTMLElement);
      // Slight blur to indicate a preview/ghost
      expect((ghostEl as HTMLElement).style.filter.toLowerCase()).toContain("blur");
      // Size should match the preview hints to assist precise placement
      expect((ghostEl as HTMLElement).style.width).toBe("120px");
      expect((ghostEl as HTMLElement).style.height).toBe("40px");
      // Reasonable offsets (implementation may center the image)
      expect(typeof offsetX).toBe("number");
      expect(typeof offsetY).toBe("number");
    }
  });
});

