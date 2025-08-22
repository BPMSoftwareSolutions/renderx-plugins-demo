import { sequence as dragSeq, handlers as dragHandlers } from "./symphonies/drag.symphony";
import { sequence as dropSeq, handlers as dropHandlers } from "./symphonies/drop.symphony";

export async function register(conductor: any) {
  await conductor?.mount?.(dragSeq, dragHandlers, "LibraryComponentPlugin");
  // Mount drop under a distinct plugin id to satisfy PluginManager's single-plugin constraint
  await conductor?.mount?.(dropSeq, dropHandlers, "LibraryComponentDropPlugin");
}

