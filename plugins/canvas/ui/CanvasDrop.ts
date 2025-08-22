export const LIB_COMP_PLUGIN_ID = "LibraryComponentDropPlugin" as const;
export const LIB_COMP_DROP_SEQ_ID = "library-component-drop-symphony" as const;

export async function onDropForTest(e: any, conductor: any, onCreated?: (n: any) => void) {
  e.preventDefault();
  const raw = e.dataTransfer.getData("application/rx-component");
  const payload = raw ? JSON.parse(raw) : {};
  const rect = e.currentTarget.getBoundingClientRect();
  const position = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  conductor?.play?.(LIB_COMP_PLUGIN_ID, LIB_COMP_DROP_SEQ_ID, {
    component: payload.component,
    position,
    onComponentCreated: onCreated,
  });
}

