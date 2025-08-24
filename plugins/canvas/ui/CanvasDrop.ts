import { resolveInteraction } from "../../../src/interactionManifest";

export async function onDropForTest(
  e: any,
  conductor: any,
  onCreated?: (n: any) => void
) {
  e.preventDefault();
  const raw = e.dataTransfer.getData("application/rx-component");
  const payload = raw ? JSON.parse(raw) : {};
  const canvasRect = e.currentTarget.getBoundingClientRect();
  const targetEl: HTMLElement | null = e.target as any;
  const targetRect = targetEl?.getBoundingClientRect?.();
  const isContainer = !!(
    targetEl && (targetEl as any).dataset?.role === "container"
  );
  const containerId = isContainer ? targetEl!.id : undefined;
  const baseLeft = isContainer ? targetRect.left : canvasRect.left;
  const baseTop = isContainer ? targetRect.top : canvasRect.top;
  const position = { x: e.clientX - baseLeft, y: e.clientY - baseTop };

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
    const routeKey = isContainer
      ? "library.container.drop"
      : "library.component.drop";
    const r = resolveInteraction(routeKey);
    conductor?.play?.(r.pluginId, r.sequenceId, {
      component: payload.component,
      position,
      containerId,
      onComponentCreated: onCreated,
      onDragStart,
      onDragMove,
      onDragEnd,
      onSelected,
    });
  } catch {
    const routeKey = isContainer
      ? "library.container.drop"
      : "library.component.drop";
    const r = resolveInteraction(routeKey);
    conductor?.play?.(r.pluginId, r.sequenceId, {
      component: payload.component,
      position,
      containerId,
      onComponentCreated: onCreated,
      onDragStart,
      onDragMove,
      onDragEnd,
      onSelected,
    });
  }
}
