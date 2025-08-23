/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library-component/symphonies/drag.symphony";

/**
 * Failing spec: The drag ghost should align to the mouse pointer.
 * Offsets passed to dataTransfer.setDragImage should reflect the mouse position
 * within the dragged element (clientX - rect.left, clientY - rect.top).
 */

describe("library-component drag preview alignment", () => {
  it("uses cursor-relative offsets for setDragImage so the ghost stays under the pointer (FAILS until implemented)", () => {
    const setData = vi.fn();
    const setDragImage = vi.fn();
    const dataTransfer: any = { setData, setDragImage };

    const li = document.createElement("li");
    (li as any).getBoundingClientRect = () => ({
      left: 100,
      top: 200,
      right: 300,
      bottom: 250,
      width: 200,
      height: 50,
      x: 100,
      y: 200,
      toJSON: () => ({})
    });
    document.body.appendChild(li);

    const domEvent: any = {
      dataTransfer,
      target: li,
      clientX: 110, // 10px from left edge
      clientY: 215, // 15px from top edge
    };

    const component = { id: "comp-align", name: "Button" } as any;

    handlers.onDragStart({ domEvent, component });

    expect(setData).toHaveBeenCalled();
    expect(setDragImage).toHaveBeenCalled();

    const [ghostEl, offsetX, offsetY] = (setDragImage as any).mock.calls[0];
    expect(ghostEl).toBeInstanceOf(HTMLElement);
    // Expect offsets to match cursor position within the element
    expect(offsetX).toBe(10);
    expect(offsetY).toBe(15);
  });
});

