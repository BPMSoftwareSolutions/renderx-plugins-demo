import { resolveInteraction } from "../../../src/interactionManifest";

export async function onDropForTest(
  e: any,
  conductor: any,
  onCreated?: (n: any) => void
) {
  e.preventDefault();
  const raw = e.dataTransfer.getData("application/rx-component");
  const payload = raw ? JSON.parse(raw) : {};
  const targetEl: Element | null = (e.target as Element) || null;
  const containerEl: Element | null =
    targetEl?.closest?.('[data-role="container"]') || null;
  const originRect = (containerEl || e.currentTarget).getBoundingClientRect();
  const position = {
    x: e.clientX - originRect.left,
    y: e.clientY - originRect.top,
  };

  // Define drag callbacks that use conductor.play
  const onDragStart = (dragData: any) => {
    // Optional: handle drag start (e.g., show visual feedback)
    console.log("Drag started:", dragData);
  };

  const onDragMove = (dragData: any) => {
    // Use conductor to update position
    try {
      const r = resolveInteraction("canvas.component.drag.move");
      conductor?.play?.(r.pluginId, r.sequenceId, {
        event: "canvas:component:drag:move",
        ...dragData,
      });
    } catch {
      // If resolver throws (unknown key), surface the error instead of hard-coding
      throw new Error("Unknown interaction key: canvas.component.drag.move");
    }
  };

  const onDragEnd = (dragData: any) => {
    // Optional: handle drag end (e.g., cleanup, save state)
    console.log("Drag ended:", dragData);
  };

  const onSelected = (selectionData: any) => {
    // Use conductor to handle selection
    const r = resolveInteraction("canvas.component.select");
    conductor?.play?.(r.pluginId, r.sequenceId, {
      ...selectionData,
    });
  };

  try {
    const { resolveInteraction } = require("../../../src/interactionManifest");
    const dropKey = containerEl
      ? "library.container.drop"
      : "library.component.drop";
    const r = resolveInteraction(dropKey);
    conductor?.play?.(r.pluginId, r.sequenceId, {
      component: payload.component,
      position,
      containerId: (containerEl as HTMLElement | null)?.id,
      onComponentCreated: onCreated,
      onDragStart,
      onDragMove,
      onDragEnd,
      onSelected,
    });
  } catch {
    const dropKey = containerEl
      ? "library.container.drop"
      : "library.component.drop";
    const r = resolveInteraction(dropKey);
    conductor?.play?.(r.pluginId, r.sequenceId, {
      component: payload.component,
      position,
      containerId: (containerEl as HTMLElement | null)?.id,
      onComponentCreated: onCreated,
      onDragStart,
      onDragMove,
      onDragEnd,
      onSelected,
    });
  }
}
