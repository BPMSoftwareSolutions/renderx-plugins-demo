export const updatePosition = (data: any, ctx: any) => {
  const { id, position } = data;
  
  if (!id || !position) {
    throw new Error("Missing required drag data: id and position");
  }

  // Find the element in the DOM
  const element = (typeof document !== "undefined") ? document.getElementById(id) : null;
  if (!element) {
    throw new Error(`Canvas component with id ${id} not found`);
  }

  // Update the element's position using absolute positioning
  element.style.position = "absolute";
  element.style.left = typeof position.x === "number" ? `${position.x}px` : String(position.x);
  element.style.top = typeof position.y === "number" ? `${position.y}px` : String(position.y);

  // Store the updated position in the context payload for potential use by other handlers
  ctx.payload.updatedPosition = position;
  ctx.payload.elementId = id;

  return {
    success: true,
    elementId: id,
    newPosition: position
  };
};
