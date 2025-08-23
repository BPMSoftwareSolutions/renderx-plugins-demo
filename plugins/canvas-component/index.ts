import {
  sequence as createSeq,
  handlers as createHandlers,
} from "./symphonies/create/create.symphony";
import {
  sequence as selectSeq,
  handlers as selectHandlers,
} from "./symphonies/select/select.symphony";
import {
  sequence as dragSeq,
  handlers as dragHandlers,
} from "./symphonies/drag/drag.symphony";
import {
  sequence as resizeStartSeq,
  handlers as resizeStartHandlers,
} from "./symphonies/resize/resize.start.symphony";
import {
  sequence as resizeMoveSeq,
  handlers as resizeMoveHandlers,
} from "./symphonies/resize/resize.move.symphony";
import {
  sequence as resizeEndSeq,
  handlers as resizeEndHandlers,
} from "./symphonies/resize/resize.end.symphony";

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
  // Mount resize as separate plugins (start/move/end) to avoid double-mount conflicts
  await conductor?.mount?.(
    resizeStartSeq,
    resizeStartHandlers,
    "CanvasComponentResizeStartPlugin"
  );
  await conductor?.mount?.(
    resizeMoveSeq,
    resizeMoveHandlers,
    "CanvasComponentResizeMovePlugin"
  );
  await conductor?.mount?.(
    resizeEndSeq,
    resizeEndHandlers,
    "CanvasComponentResizeEndPlugin"
  );
}
