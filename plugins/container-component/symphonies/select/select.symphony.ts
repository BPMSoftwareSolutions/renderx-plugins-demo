import { getLocalPoint, getContainerInnerRect } from "../../utils/coordinates";
import { createContainerDataBaton, logDataBaton } from "../../utils/telemetry";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  selectComponent,
  clearSelection,
  updateSelectionOverlay,
};

function selectComponent(data: any, ctx: any) {
  const { nodeId, containerId } = data;
  const container = document.getElementById(containerId);
  const node = document.getElementById(nodeId);

  if (!container || !node) {
    throw new Error(
      `Container select: missing container(${containerId}) or node(${nodeId})`
    );
  }

  // Clear any existing selection
  clearExistingSelection();

  // Create selection overlay positioned relative to container
  const overlay = createSelectionOverlay(node, container);

  // Store selection state
  ctx.payload = ctx.payload || {};
  ctx.payload.selection = {
    nodeId,
    containerId,
    overlayId: overlay.id,
  };

  // Add selected class to node
  node.classList.add("rx-selected");

  // Log telemetry
  const baton = createContainerDataBaton(
    "container:component:select",
    nodeId,
    containerId,
    { overlayId: overlay.id }
  );
  logDataBaton(baton);

  return { ok: true, selectedNodeId: nodeId };
}

function clearSelection(data: any, ctx: any) {
  clearExistingSelection();

  if (ctx.payload?.selection) {
    ctx.payload.selection = null;
  }

  return { ok: true };
}

function updateSelectionOverlay(data: any, ctx: any) {
  const { nodeId, containerId } = data;
  const container = document.getElementById(containerId);
  const node = document.getElementById(nodeId);

  if (!container || !node) {
    console.warn(
      `Container select update: missing container(${containerId}) or node(${nodeId})`
    );
    return { ok: false };
  }

  // Find existing overlay
  const overlayId = ctx.payload?.selection?.overlayId;
  const overlay = overlayId ? document.getElementById(overlayId) : null;

  if (overlay) {
    // Update overlay position
    updateOverlayPosition(overlay, node, container);
  }

  return { ok: true };
}

// Helper functions

function clearExistingSelection() {
  // Remove selected class from all nodes
  document.querySelectorAll(".rx-selected").forEach((el) => {
    el.classList.remove("rx-selected");
  });

  // Remove existing selection overlays
  document.querySelectorAll(".rx-selection-overlay").forEach((el) => {
    el.remove();
  });
}

function createSelectionOverlay(
  node: HTMLElement,
  container: HTMLElement
): HTMLElement {
  const overlay = document.createElement("div");
  overlay.id = `selection-overlay-${Math.random().toString(36).slice(2, 8)}`;
  overlay.className = "rx-selection-overlay";

  // Style the overlay
  overlay.style.cssText = `
    position: absolute;
    pointer-events: none;
    border: 2px solid #007acc;
    background: rgba(0, 122, 204, 0.1);
    z-index: 999;
  `;

  // Position overlay relative to container
  updateOverlayPosition(overlay, node, container);

  // Append to container (not document body) for proper coordinate space
  container.appendChild(overlay);

  return overlay;
}

function updateOverlayPosition(
  overlay: HTMLElement,
  node: HTMLElement,
  container: HTMLElement
) {
  const nodeRect = node.getBoundingClientRect();
  const containerInnerRect = getContainerInnerRect(container);

  // Convert node position to container-local coordinates
  const localTopLeft = getLocalPoint(
    { x: nodeRect.left, y: nodeRect.top },
    container
  );

  // Set overlay position and size
  overlay.style.left = `${localTopLeft.x}px`;
  overlay.style.top = `${localTopLeft.y}px`;
  overlay.style.width = `${nodeRect.width}px`;
  overlay.style.height = `${nodeRect.height}px`;
}
