import { initializeCommunicationSystem } from "musical-conductor";

export type ConductorClient = ReturnType<typeof initializeCommunicationSystem>["conductor"];

export async function initConductor(): Promise<ConductorClient> {
  const { conductor } = initializeCommunicationSystem();
  // expose globally for UIs that import via hook alternative
  (window as any).renderxCommunicationSystem = { conductor };
  return conductor as ConductorClient;
}

export async function registerAllSequences(conductor: ConductorClient) {
  const registrars = await Promise.all([
    import("../plugins/library").then((m) => m.register),
    import("../plugins/library-component").then((m) => m.register),
    import("../plugins/canvas-component").then((m) => m.register),
    import("../plugins/canvas").then((m) => m.register),
    import("../plugins/control-panel").then((m) => m.register),
  ]);
  for (const reg of registrars) await reg?.(conductor);
}

export function useConductor(): ConductorClient {
  const { conductor } = (window as any).renderxCommunicationSystem || {};
  return conductor as ConductorClient;
}

