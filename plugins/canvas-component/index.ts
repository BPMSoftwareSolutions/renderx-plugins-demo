import { sequence as createSeq, handlers as createHandlers } from "./symphonies/create.symphony";

export async function register(conductor: any) {
  conductor?.registerSequence?.("CanvasComponentPlugin", createSeq, createHandlers);
}

