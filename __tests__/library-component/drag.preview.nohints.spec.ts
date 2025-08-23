/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlers } from "../../plugins/library-component/symphonies/drag.symphony";

/**
 * Additional failing spec: When no component.preview hints are provided, the drag ghost
 * should fall back to the size of the dragged DOM element (e.g., the Library list item),
 * so that the user still sees an accurate-sized preview while dragging.
 *
 * This intentionally fails with current implementation, which uses a static 120x40 default.
 */

describe("library-component drag preview without preview hints", () => {
  let li: HTMLLIElement;

  beforeEach(() => {
    document.body.innerHTML = "<ul id=lib></ul>";
    li = document.createElement("li");
    // Simulate a rendered size for the library item
    (li as any).getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 180,
      bottom: 36,
      width: 180,
      height: 36,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });
    document.getElementById("lib")!.appendChild(li);
  });

  it("uses the dragged element size for the ghost when preview hints are missing (FAILS until implemented)", () => {
    const setData = vi.fn();
    const setDragImage = vi.fn();
    const dataTransfer: any = { setData, setDragImage };

    const domEvent: any = {
      dataTransfer,
      target: li,
    };

    const component = { id: "comp-no-preview", name: "Button" } as any; // no preview

    handlers.onDragStart({ domEvent, component });

    expect(setData).toHaveBeenCalled();
    expect(setDragImage).toHaveBeenCalled();

    const [ghostEl] = (setDragImage as any).mock.calls[0];
    expect((ghostEl as HTMLElement).style.width).toBe("180px");
    expect((ghostEl as HTMLElement).style.height).toBe("36px");
  });
});

