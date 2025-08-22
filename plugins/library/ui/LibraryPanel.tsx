import React from "react";
import { useConductor } from "../../../src/conductor";

export function LibraryPanel() {
  const conductor = useConductor();
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    conductor?.play?.("LibraryPlugin", "library-load-symphony", {
      onComponentsLoaded: (list: any[]) => setItems(list),
    });
  }, [conductor]);

  return (
    <div className="p-3 h-full" style={{ borderRight: "1px solid #eee", overflow: "auto" }}>
      <h3>Library</h3>
      <ul style={{ display: "grid", gap: 8 }}>
        {items.map((c) => (
          <li
            key={c.id}
            style={{ cursor: "grab" }}
            draggable
            onDragStart={(e) => {
              conductor?.play?.("LibraryComponentPlugin", "library-component-drag-symphony", {
                event: "library:component:drag:start",
                domEvent: e,
                component: c,
              });
            }}
          >
            {c.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

