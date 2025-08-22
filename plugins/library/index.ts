import { sequence as loadSeq, handlers as loadHandlers } from "./symphonies/load.symphony";
export { LibraryPanel } from "./ui/LibraryPanel";

export async function register(conductor: any) {
  conductor?.registerSequence?.("LibraryPlugin", loadSeq, loadHandlers);
}

