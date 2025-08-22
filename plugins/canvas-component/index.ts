import { sequence as createSeq, handlers as createHandlers } from "./symphonies/create.symphony";

export async function register(conductor: any) {
  await conductor?.mount?.(createSeq, createHandlers, "CanvasComponentPlugin");
}

