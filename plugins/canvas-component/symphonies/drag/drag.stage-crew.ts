// Cache element references to avoid repeated DOM lookups during drag
const elCache: Record<string, HTMLElement> = {};

export const updatePosition = (data: any, ctx: any) => {
  const { id, position } = data;

  if (!id || !position) {
    throw new Error("Missing required drag data: id and position");
  }

  // Find the element in the DOM (cached)
  let element = elCache[id as string] as HTMLElement | undefined;
  if (!element) {
    element =
      typeof document !== "undefined"
        ? (document.getElementById(id) as HTMLElement | null) || undefined
        : undefined;
    if (element) elCache[id as string] = element;
  }
  if (!element) {
    throw new Error(`Canvas component with id ${id} not found`);
  }

  // Update the element's position using absolute positioning (relative to its parent)
  if (!element.style.position) element.style.position = "absolute";
  if (!element.style.willChange) element.style.willChange = "left, top";

  const newLeft =
    typeof position.x === "number" ? `${position.x}px` : String(position.x);
  const newTop =
    typeof position.y === "number" ? `${position.y}px` : String(position.y);

  // Only write when value actually changes to avoid style churn
  if (element.style.left !== newLeft) element.style.left = newLeft;
  if (element.style.top !== newTop) element.style.top = newTop;

  // Store the updated position in the context payload for potential use by other handlers
  ctx.payload.updatedPosition = position;
  ctx.payload.elementId = id;

  return {
    success: true,
    elementId: id,
    newPosition: position,
  };
};
