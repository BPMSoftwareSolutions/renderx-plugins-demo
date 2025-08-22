import { sequence as dragSeq, handlers as dragHandlers } from "./symphonies/drag.symphony";
import { sequence as dropSeq, handlers as dropHandlers } from "./symphonies/drop.symphony";

export async function register(conductor: any) {
  conductor?.registerSequence?.("LibraryComponentPlugin", dragSeq, dragHandlers);
  conductor?.registerSequence?.("LibraryComponentPlugin", dropSeq, dropHandlers);
}

