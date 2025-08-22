import { initializeCommunicationSystem } from "musical-conductor";

export type ConductorClient = ReturnType<typeof initializeCommunicationSystem>["conductor"];

export async function initConductor(): Promise<ConductorClient> {
  const { conductor } = initializeCommunicationSystem();
  // expose globally for UIs that import via hook alternative
  (window as any).renderxCommunicationSystem = { conductor };
  return conductor as ConductorClient;
}

export async function registerAllSequences(conductor: ConductorClient) {
  // Import and register plugins sequentially for clearer errors and reliable ordering
  const modules = [
    await import("../plugins/library"),
    await import("../plugins/library-component"),
    await import("../plugins/canvas-component"),
    await import("../plugins/canvas"),
    await import("../plugins/control-panel"),
  ];
  for (const mod of modules) {
    const reg = (mod as any).register;
    const nameGuess = (mod as any).LibraryPanel
      ? "LibraryPlugin"
      : (mod as any).CanvasPage
      ? "CanvasPlugin"
      : (mod as any).ControlPanel
      ? "ControlPanelPlugin"
      : "(unknown)";
    if (typeof reg === "function") {
      try {
        await reg(conductor);
        console.log(`🔌 Registered plugin module: ${nameGuess}`);
      } catch (e) {
        console.error("❌ Failed to register plugin module", nameGuess, e);
      }
    }
  }
  try {
    const ids = (conductor as any).getMountedPluginIds?.() || [];
    console.log("🔎 Mounted plugin IDs after registration:", ids);
  } catch {}
}

export function useConductor(): ConductorClient {
  const { conductor } = (window as any).renderxCommunicationSystem || {};
  return conductor as ConductorClient;
}

