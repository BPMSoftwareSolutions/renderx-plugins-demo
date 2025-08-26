import { resolveInteraction } from "../../../src/interactionManifest";
import { isFlagEnabled } from "../../../src/feature-flags/flags";

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
    (globalThis as any).__cpDragInProgress = true;

    // Debug logs gated for perf
    if (isFlagEnabled("perf.cp.debug")) {
      console.log("Drag started:", dragData);
    }

    // Pre-warm caches and style hints moved to stage-crew handlers
    // This will be handled via canvas.component.drag.start sequence
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
    (globalThis as any).__cpDragInProgress = false;

    // Debug logs gated for perf
    if (isFlagEnabled("perf.cp.debug")) {
      console.log("Drag ended:", dragData);
    }

    // Optionally trigger a deferred Control Panel render after drag ends
    const perf = (globalThis as any).__cpPerf || {};
    let deferMs = 0;
    try {
      // Prefer centralized flag
      if (isFlagEnabled("perf.cp.render.dedupe")) {
        // Still using global numeric until JSON carries values, to avoid schema change
        const ms = Number(perf.postDragRenderDelayMs);
        if (Number.isFinite(ms) && ms > 0) deferMs = ms;
      }
    } catch {}

    if (deferMs > 0 && (globalThis as any).__cpTriggerRender) {
      setTimeout(() => {
        try {
          (globalThis as any).__cpTriggerRender();
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
