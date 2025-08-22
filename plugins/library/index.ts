import { sequence as loadSeq, handlers as loadHandlers } from "./symphonies/load.symphony";
export { LibraryPanel } from "./ui/LibraryPanel";

export async function register(conductor: any) {
  // CIA-compliant mount (sequence must have id/name/movements with named movement ids)
  await conductor?.mount?.(loadSeq, loadHandlers, "LibraryPlugin");
}

