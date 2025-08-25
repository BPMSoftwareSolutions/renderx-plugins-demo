import { resolveInteraction } from "../../../src/interactionManifest";

// Lazily cached route for drag move to avoid resolving on every pointer move
let __dragMoveRoute: { pluginId: string; sequenceId: string } | null = null;

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
    (window as any).__cpDragInProgress = true;

    // Debug logs gated for perf
    if ((window as any).__cpPerf?.debug) {
      console.log("Drag started:", dragData);
    }

    // Pre-warm caches and style hints for faster first-frame move
    try {
      const id: string | undefined = dragData?.id;
      if (id) {
        const el = document.getElementById(id) as HTMLElement | null;
        if (el) {
          if (!el.style.position) el.style.position = "absolute";
          if (!el.style.willChange) el.style.willChange = "left, top";
        }
      }
    } catch {}
  };

  const onDragMove = (dragData: any) => {
    // Use conductor to update position (cache route to avoid repeated resolve calls)
    try {
      if (!__dragMoveRoute) {
        __dragMoveRoute = resolveInteraction("canvas.component.drag.move");
      }
      const r = __dragMoveRoute;
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
    (window as any).__cpDragInProgress = false;

    // Debug logs gated for perf
    if ((window as any).__cpPerf?.debug) {
      console.log("Drag ended:", dragData);
    }

    // Optionally trigger a deferred Control Panel render after drag ends
    const perf = (window as any).__cpPerf || {};
    const deferMs =
      typeof perf.postDragRenderDelayMs === "number"
        ? perf.postDragRenderDelayMs
        : 0;
    if (deferMs > 0 && (window as any).__cpTriggerRender) {
      setTimeout(() => {
        try {
          (window as any).__cpTriggerRender();
        } catch (e) {
          console.warn("Deferred post-drag render failed:", e);
        }
      }, deferMs);
    }
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
