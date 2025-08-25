// Stage-crew handler for updating Control Panel with current element state during live operations

export function updateFromElement(data: any, ctx: any) {
  const { id, source } = data || {};
  if (!id) {
    ctx.payload.selectionModel = null;
    return;
  }

  const element = document.getElementById(String(id)) as HTMLElement | null;
  if (!element) {
    ctx.payload.selectionModel = null;
    return;
  }

  // Extract type from rx-<type> class
  const rxClasses = Array.from(element.classList).filter(
    (cls) => cls.startsWith("rx-") && cls !== "rx-comp"
  );
  const typeClass = rxClasses[0]; // e.g., "rx-button"
  const type = typeClass ? typeClass.replace("rx-", "") : "unknown";

  // Get current position and dimensions from inline styles (preferred) or computed styles
  const style = element.style;
  const computed = getComputedStyle(element);

  const x = parseFloat(style.left || computed.left || "0");
  const y = parseFloat(style.top || computed.top || "0");
  const width = parseFloat(style.width || computed.width || "0");
  const height = parseFloat(style.height || computed.height || "0");

  // During drag/resize, send a slim model (layout-only) to avoid heavy recompute
  if (source === "drag" || source === "resize") {
    ctx.payload.selectionModel = {
      header: { type, id },
      layout: { x, y, width, height },
    };
    ctx.payload._source = source;
    return;
  }

  // Build full selection model with current DOM state for non-drag cases
  const selectionModel = {
    header: { type, id },
    content: {
      content: element.textContent || "",
      variant: "primary", // Default - could be enhanced with JSON data
      size: "medium", // Default - could be enhanced with JSON data
      disabled: element.hasAttribute("disabled"),
    },
    layout: { x, y, width, height },
    styling: {
      "bg-color": computed.backgroundColor || "#007acc",
      "text-color": computed.color || "#ffffff",
      "border-radius": computed.borderRadius || "4px",
      "font-size": computed.fontSize || "14px",
    },
    classes: Array.from(element.classList),
  };

  ctx.payload.selectionModel = selectionModel;
  ctx.payload._source = source;
}
