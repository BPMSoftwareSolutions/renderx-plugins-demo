import {
  getLocalPoint,
  clampToContainer,
  getContainerOf,
} from "../../utils/coordinates";
import { createContainerDataBaton, logDataBaton } from "../../utils/telemetry";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  startDrag,
  updatePosition,
  endDrag,
};

function startDrag(data: any, ctx: any) {
  const { nodeId, containerId } = data;
  const container = document.getElementById(containerId);
  const node = document.getElementById(nodeId);

  if (!container || !node) {
    throw new Error(
      `Container drag start: missing container(${containerId}) or node(${nodeId})`
    );
  }

  // Store initial state
  ctx.payload = ctx.payload || {};
  ctx.payload.dragState = {
    nodeId,
    containerId,
    startPosition: data.position,
    isDragging: true,
  };

  // Add visual feedback
  node.style.zIndex = "1000";
  node.classList.add("rx-dragging");

  // Log telemetry
  const baton = createContainerDataBaton(
    "container:component:drag:start",
    nodeId,
    containerId,
    { startPosition: data.position }
  );
  logDataBaton(baton);

  return { ok: true };
}

function updatePosition(data: any, ctx: any) {
  const { nodeId, position, containerId } = data;
  const container = document.getElementById(containerId);
  const node = document.getElementById(nodeId);

  if (!container || !node) {
    console.warn(
      `Container drag move: missing container(${containerId}) or node(${nodeId})`
    );
    return { ok: false };
  }

  // Clamp position to container bounds
  const clampedPosition = clampToContainer(position, container);

  // Apply position
  node.style.left = `${clampedPosition.x}px`;
  node.style.top = `${clampedPosition.y}px`;
  node.style.position = "absolute";

  // Update drag state
  if (ctx.payload?.dragState) {
    ctx.payload.dragState.currentPosition = clampedPosition;
  }

  // Log telemetry for move events (throttled)
  if (
    !ctx.payload._lastTelemetryTime ||
    Date.now() - ctx.payload._lastTelemetryTime > 100
  ) {
    const baton = createContainerDataBaton(
      "container:component:drag:move",
      nodeId,
      containerId,
      { position: clampedPosition, originalPosition: position }
    );
    logDataBaton(baton);
    ctx.payload._lastTelemetryTime = Date.now();
  }

  return { ok: true, position: clampedPosition };
}

function endDrag(data: any, ctx: any) {
  const { nodeId } = data;
  const node = document.getElementById(nodeId);

  if (!node) {
    console.warn(`Container drag end: missing node(${nodeId})`);
    return { ok: false };
  }

  // Remove visual feedback
  node.style.zIndex = "";
  node.classList.remove("rx-dragging");

  // Clear drag state
  if (ctx.payload?.dragState) {
    ctx.payload.dragState.isDragging = false;
  }

  // Log telemetry
  const containerId = ctx.payload?.dragState?.containerId;
  if (containerId) {
    const baton = createContainerDataBaton(
      "container:component:drag:end",
      nodeId,
      containerId,
      { finalPosition: ctx.payload?.dragState?.currentPosition }
    );
    logDataBaton(baton);
  }

  return { ok: true };
}
