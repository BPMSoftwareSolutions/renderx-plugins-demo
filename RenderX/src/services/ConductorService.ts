import { initializeCommunicationSystem, MusicalConductor } from "musical-conductor";

export class ConductorService {
  private static instance: ConductorService;
  private communicationSystem: ReturnType<typeof initializeCommunicationSystem> | null = null;

  private constructor() {}

  static getInstance(): ConductorService {
    if (!ConductorService.instance) {
      ConductorService.instance = new ConductorService();
    }
    return ConductorService.instance;
  }

  /** Initialize the communication system and register CIA plugins */
  async initialize(): Promise<void> {
    if (!this.communicationSystem) {
      const system = initializeCommunicationSystem();
      this.communicationSystem = system;
      try {
        await system.conductor.registerCIAPlugins();
      } catch (err) {
        console.warn("⚠️ CIA plugins registration skipped/failed:", err);
      }
      // Expose only conductor globally
      (window as any).renderxCommunicationSystem = {
        conductor: system.conductor,
      };
    }
  }

  getConductor(): MusicalConductor {
    if (!this.communicationSystem) {
      // Lazy init for convenience
      const system = initializeCommunicationSystem();
      this.communicationSystem = system;
      (window as any).renderxCommunicationSystem = { conductor: system.conductor };
    }
    return this.communicationSystem!.conductor;
  }
}

