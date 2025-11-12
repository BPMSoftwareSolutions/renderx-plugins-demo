/**
 * ConductorCore - Core singleton management and initialization
 * Handles the fundamental lifecycle of the MusicalConductor
 */

import { EventBus } from "../../EventBus.js";
import { SPAValidator } from "../../SPAValidator.js";
import { isDevEnv } from "../environment/ConductorEnv.js";

export class ConductorCore {
  private static instance: ConductorCore | null = null;
  private eventBus: EventBus;
  private spaValidator: SPAValidator;
  private eventSubscriptions: Array<() => void> = [];
  private beatLoggingInitialized: boolean = false;

  private constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.spaValidator = SPAValidator.getInstance();
    void this.initialize();
  }

  /**
   * Get singleton instance of ConductorCore
   * @param eventBus - Required for first initialization
   * @returns ConductorCore instance
   */
  public static getInstance(eventBus?: EventBus): ConductorCore {
    if (!ConductorCore.instance) {
      if (!eventBus) {
        throw new Error("EventBus is required for first initialization");
      }
      ConductorCore.instance = new ConductorCore(eventBus);
    }
    return ConductorCore.instance;
  }

  /**
   * Reset the singleton instance (primarily for testing)
   */
  public static resetInstance(): void {
    if (ConductorCore.instance) {
      ConductorCore.instance.cleanup();
      ConductorCore.instance = null;
    }
  }

  /**
   * Get the EventBus instance
   */
  public getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get the SPAValidator instance
   */
  public getSPAValidator(): SPAValidator {
    return this.spaValidator;
  }

  /**
   * Initialize core functionality
   */
  private async initialize(): Promise<void> {
    this.setupBeatExecutionLogging();
    // Initialize nested logger in dev by default
    try {
      // Initialize logger only in development environments (safe across TS/Jest)
      const isDev = isDevEnv();
      // Allow override via global/env flag MC_LOG_TS to force timestamps outside dev
      const forceTs = (() => {
        try {
          const g: any = (globalThis as any);
          if (g && (g.MC_LOG_TS === true || g.MC_LOG_TS === '1')) return true;
        } catch {}
        try {
          const env = (typeof process !== 'undefined' && (process as any).env) || {};
          if (env.MC_LOG_TS === '1' || env.MC_LOG_TS === 'true') return true;
        } catch {}
        return false;
      })();

      if (isDev || forceTs) {
        const { ConductorLogger } = await import(
          "../monitoring/ConductorLogger.js"
        );
        const logger = new ConductorLogger(this.eventBus, true);
        logger.init();
      }
    } catch (e) {
      (globalThis as any).__MC_WARN(
        "⚠️ ConductorLogger initialization skipped:",
        (e as Error)?.message || e
      );
    }

    (globalThis as any).__MC_LOG("🎼 ConductorCore: Initialized successfully");
  }

  /**
   * Setup beat execution logging with hierarchical support
   */
  private setupBeatExecutionLogging(): void {
    if (this.beatLoggingInitialized) {
      (globalThis as any).__MC_LOG("🎼 Beat execution logging already initialized, skipping...");
      return;
    }

    (globalThis as any).__MC_LOG("🎼 ConductorCore: Setting up beat execution logging...");

    // Subscribe to beat started events for hierarchical logging
    const beatStartedUnsubscribe = this.eventBus.subscribe(
      "musical-conductor:beat:started",
      (data: any) => {
        if (this.shouldEnableHierarchicalLogging()) {
          this.logBeatStartedHierarchical(data);
        }
      }
    );

    // Subscribe to beat completed events for hierarchical logging
    const beatCompletedUnsubscribe = this.eventBus.subscribe(
      "musical-conductor:beat:completed",
      (data: any) => {
        if (this.shouldEnableHierarchicalLogging()) {
          this.logBeatCompletedHierarchical(data);
        }
      }
    );

    // Subscribe to beat error events for non-hierarchical logging
    const beatErrorUnsubscribe = this.eventBus.subscribe(
      "musical-conductor:beat:error",
      (data: any) => {
        if (!this.shouldEnableHierarchicalLogging()) {
          (globalThis as any).__MC_ERROR("🎼 Beat execution error:", data);
        }
      }
    );

    // Store unsubscribe functions for cleanup
    this.eventSubscriptions.push(
      beatStartedUnsubscribe,
      beatCompletedUnsubscribe,
      beatErrorUnsubscribe
    );

    this.beatLoggingInitialized = true;
    (globalThis as any).__MC_LOG("✅ Beat execution logging initialized");
  }

  /**
   * Log beat started event in hierarchical format
   */
  private logBeatStartedHierarchical(data: any): void {
    const { sequenceName, movementName, beatNumber, eventType, timing } = data;

  (globalThis as any).__MC_LOG(`🎼 ┌─ Beat ${beatNumber} Started`);
  (globalThis as any).__MC_LOG(`🎼 │  Sequence: ${sequenceName}`);
  (globalThis as any).__MC_LOG(`🎼 │  Movement: ${movementName}`);
  (globalThis as any).__MC_LOG(`🎼 │  Event: ${eventType}`);
  (globalThis as any).__MC_LOG(`🎼 │  Timing: ${timing}`);

    // Log the Data Baton - show payload contents at each beat
    if (data.payload) {
      (globalThis as any).__MC_LOG(`🎽 │  Data Baton:`, data.payload);
    }
  }

  /**
   * Log beat completed event in hierarchical format
   */
  private logBeatCompletedHierarchical(data: any): void {
    const { sequenceName, movementName, beatNumber, duration } = data;

    (globalThis as any).__MC_LOG(`🎼 └─ Beat ${beatNumber} Completed`);
    (globalThis as any).__MC_LOG(`🎼    Duration: ${duration}ms`);
    (globalThis as any).__MC_LOG(`🎼    Sequence: ${sequenceName}`);
    (globalThis as any).__MC_LOG(`🎼    Movement: ${movementName}`);
  }

  /**
   * Determine if hierarchical logging should be enabled
   * This can be configured based on environment or settings
   */
  private shouldEnableHierarchicalLogging(): boolean {
    // For now, return true. This can be made configurable later
    return true;
  }

  /**
   * Cleanup resources and event subscriptions
   */
  public cleanup(): void {
  (globalThis as any).__MC_LOG("🎼 ConductorCore: Cleaning up...");

    // Unsubscribe from all events
    this.eventSubscriptions.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        (globalThis as any).__MC_WARN("🎼 Error during event unsubscription:", error);
      }
    });

    this.eventSubscriptions = [];
    this.beatLoggingInitialized = false;

    (globalThis as any).__MC_LOG("✅ ConductorCore: Cleanup completed");
  }

  /**
   * Check if the core is properly initialized
   */
  public isInitialized(): boolean {
    return (
      this.beatLoggingInitialized && !!this.eventBus && !!this.spaValidator
    );
  }
}
