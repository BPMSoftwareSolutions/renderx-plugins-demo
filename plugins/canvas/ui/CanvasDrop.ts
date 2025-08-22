export const LIB_COMP_PLUGIN_ID = "LibraryComponentDropPlugin" as const;
export const LIB_COMP_DROP_SEQ_ID = "library-component-drop-symphony" as const;

export async function onDropForTest(
  e: any,
  conductor: any,
  onCreated?: (n: any) => void
) {
  e.preventDefault();
  const raw = e.dataTransfer.getData("application/rx-component");
  const payload = raw ? JSON.parse(raw) : {};
  const rect = e.currentTarget.getBoundingClientRect();
  const position = { x: e.clientX - rect.left, y: e.clientY - rect.top };

  // Define drag callbacks that use conductor.play
  const onDragStart = (dragData: any) => {
    // Optional: handle drag start (e.g., show visual feedback)
    console.log("Drag started:", dragData);
  };

  const onDragMove = (dragData: any) => {
    // Use conductor to update position
    conductor?.play?.(
      "CanvasComponentDragPlugin",
      "canvas-component-drag-symphony",
      {
        event: "canvas:component:drag:move",
        ...dragData,
      }
    );
  };

  const onDragEnd = (dragData: any) => {
    // Optional: handle drag end (e.g., cleanup, save state)
    console.log("Drag ended:", dragData);
  };

  const onSelected = (selectionData: any) => {
    // Use conductor to handle selection
    conductor?.play?.(
      "CanvasComponentSelectionPlugin",
      "canvas-component-select-symphony",
      {
        ...selectionData,
      }
    );
  };

  conductor?.play?.(LIB_COMP_PLUGIN_ID, LIB_COMP_DROP_SEQ_ID, {
    component: payload.component,
    position,
    onComponentCreated: onCreated,
    onDragStart,
    onDragMove,
    onDragEnd,
    onSelected,
  });
}
