import {
  sequence as createSeq,
  handlers as createHandlers,
} from "./symphonies/create.symphony";
import {
  sequence as selectSeq,
  handlers as selectHandlers,
} from "./symphonies/select.symphony";
import {
  sequence as dragSeq,
  handlers as dragHandlers,
} from "./symphonies/drag.symphony";
import {
  sequence as resizeSeq,
  handlers as resizeHandlers,
} from "./symphonies/resize.symphony";

export async function register(conductor: any) {
  await conductor?.mount?.(createSeq, createHandlers, "CanvasComponentPlugin");
  // Mount selection as a separate plugin to avoid double-mount conflicts
  await conductor?.mount?.(
    selectSeq,
    selectHandlers,
    "CanvasComponentSelectionPlugin"
  );
  // Mount drag as a separate plugin to avoid double-mount conflicts
  await conductor?.mount?.(dragSeq, dragHandlers, "CanvasComponentDragPlugin");
  // Mount resize as a separate plugin to avoid double-mount conflicts
  await conductor?.mount?.(
    resizeSeq,
    resizeHandlers,
    "CanvasComponentResizePlugin"
  );
}
