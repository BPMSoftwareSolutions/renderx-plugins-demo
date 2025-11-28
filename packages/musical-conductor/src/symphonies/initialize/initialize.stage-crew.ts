/**
 * INITIALIZE Symphony - Stage Crew
 * Handlers for initializing the Musical Conductor communication system
 * 
 * Movement 1 (Setup): bootstrapLogging, validateEnvironment
 * Movement 2 (Core): createEventBus, createConductor, connectSystems
 * Movement 3 (Sequences): loadSequences, registerSequences, validateRegistrations
 * Movement 4 (Finalize): exposeFacade, notifyReady, publishStatus
 */

import { MusicalConductor } from "../../../modules/communication/sequences/MusicalConductor.js";
import { ConductorEventBus } from "../../../modules/communication/EventBus.js";
import { eventBus as internalEventBus } from "../../../modules/communication/EventBus.js";
import { initializeMusicalSequences } from "../../../modules/communication/sequences/index.js";
import { CallbackRegistry } from "../../../modules/communication/sequences/orchestration/CallbackRegistry.js";

// System state tracking
let communicationSystemInitialized = false;
let communicationSystemInstance: any = null;
let initializationCount = 0;

/** Movement 1, Beat 1: Bootstrap logging system with global shims */
export const bootstrapLogging = (data: any, ctx: any) => {
  try {
    const g: any = globalThis as any;
    if (g.__MC_LOG) {
      g.__MC_LOG("🎼 Logging already bootstrapped");
      ctx.payload.loggingBootstrapped = true;
      return;
    }
    // Logging bootstrap happens in bootstrap.ts module side-effect
    // This handler confirms it's ready
    ctx.payload.loggingBootstrapped = true;
    (globalThis as any).__MC_LOG("✅ Logging bootstrap confirmed");
  } catch (error) {
    ctx.payload.error = error;
    throw new Error(`Failed to bootstrap logging: ${error}`);
  }
};

/** Movement 1, Beat 2: Validate runtime environment */
export const validateEnvironment = (data: any, ctx: any) => {
  const isProduction = process?.env?.NODE_ENV === 'production' || 
                       (typeof window !== 'undefined' && (window as any)?.location?.hostname !== 'localhost');
  
  ctx.payload.environment = {
    isProduction,
    nodeEnv: process?.env?.NODE_ENV || 'unknown',
    platform: typeof window !== 'undefined' ? 'browser' : 'node',
  };
  
  (globalThis as any).__MC_LOG(`🔍 Environment validated: ${ctx.payload.environment.platform} (${ctx.payload.environment.nodeEnv})`);
};

/** Movement 2, Beat 1: Check for existing instance (React StrictMode protection) */
export const checkExistingInstance = (data: any, ctx: any) => {
  initializationCount++;
  
  if (initializationCount > 1) {
    console.warn(`🎼 Multiple communication system initializations detected: ${initializationCount}`);
  }
  
  if (communicationSystemInitialized && communicationSystemInstance) {
    (globalThis as any).__MC_LOG("🎼 Communication System already initialized, returning existing instance");
    ctx.payload.existingInstance = communicationSystemInstance;
    ctx.payload.skipInitialization = true;
    return;
  }
  
  ctx.payload.skipInitialization = false;
  (globalThis as any).__MC_LOG("🎼 Initializing new Communication System instance...");
};

/** Movement 2, Beat 2: Create Musical Conductor singleton */
export const createConductor = (data: any, ctx: any) => {
  if (ctx.payload.skipInitialization) return;
  
  try {
    const conductor = MusicalConductor.getInstance(internalEventBus);
    ctx.payload.conductor = conductor;
    (globalThis as any).__MC_LOG("✅ Musical Conductor instance created");
  } catch (error) {
    ctx.payload.error = error;
    throw new Error(`Failed to create conductor: ${error}`);
  }
};

/** Movement 2, Beat 3: Connect EventBus to Conductor */
export const connectSystems = (data: any, ctx: any) => {
  if (ctx.payload.skipInitialization) return;
  
  try {
    (internalEventBus as ConductorEventBus).connectToMainConductor(ctx.payload.conductor);
    ctx.payload.systemsConnected = true;
    (globalThis as any).__MC_LOG("✅ EventBus connected to Musical Conductor");
  } catch (error) {
    ctx.payload.error = error;
    throw new Error(`Failed to connect systems: ${error}`);
  }
};

/** Movement 3, Beat 1: Initialize musical sequences */
export const loadSequences = (data: any, ctx: any) => {
  if (ctx.payload.skipInitialization) return;
  
  try {
    const sequenceResults = initializeMusicalSequences(ctx.payload.conductor);
    ctx.payload.sequenceResults = sequenceResults;
    (globalThis as any).__MC_LOG(`✅ Loaded ${sequenceResults.registeredSequences} musical sequences`);
  } catch (error) {
    ctx.payload.error = error;
    throw new Error(`Failed to load sequences: ${error}`);
  }
};

/** Movement 3, Beat 2: Validate sequence registrations */
export const validateRegistrations = (data: any, ctx: any) => {
  if (ctx.payload.skipInitialization) return;
  
  const { sequenceResults } = ctx.payload;
  
  if (sequenceResults.validationResults.invalid.length > 0) {
    (globalThis as any).__MC_WARN(
      "⚠️ Some sequences have validation issues:",
      sequenceResults.validationResults.invalid
    );
    ctx.payload.hasValidationWarnings = true;
  } else {
    ctx.payload.hasValidationWarnings = false;
  }
  
  (globalThis as any).__MC_LOG(`✅ Sequence validation complete`);
};

/** Movement 4, Beat 1: Expose CallbackRegistry on global */
export const exposeFacade = (data: any, ctx: any) => {
  if (ctx.payload.skipInitialization) return;
  
  try {
    const g: any = typeof globalThis !== "undefined" ? globalThis : 
                   (typeof window !== "undefined" ? window : null);
    
    if (g && g.MusicalConductor) {
      g.MusicalConductor.CallbackRegistry = CallbackRegistry;
      (globalThis as any).__MC_LOG("✅ CallbackRegistry exposed on global MusicalConductor");
    }
    
    ctx.payload.facadeExposed = true;
  } catch (error) {
    (globalThis as any).__MC_WARN("⚠️ Failed to expose facade:", error);
    ctx.payload.facadeExposed = false;
  }
};

/** Movement 4, Beat 2: Mark system as initialized and store instance */
export const markInitialized = (data: any, ctx: any) => {
  if (ctx.payload.skipInitialization) return;
  
  communicationSystemInstance = {
    eventBus: internalEventBus as ConductorEventBus,
    conductor: ctx.payload.conductor,
    sequenceResults: ctx.payload.sequenceResults,
  };
  
  communicationSystemInitialized = true;
  ctx.payload.systemInitialized = true;
  
  (globalThis as any).__MC_LOG("✅ Communication System initialized and cached");
};

/** Movement 4, Beat 3: Publish initialization complete event */
export const notifyReady = (data: any, ctx: any) => {
  const instance = ctx.payload.skipInitialization ? 
    ctx.payload.existingInstance : 
    communicationSystemInstance;
  
  ctx.payload.result = instance;
  
  (globalThis as any).__MC_LOG("✅✅✅ Communication System ready for use");
  (globalThis as any).__MC_LOG(`🎼 Registered ${instance.sequenceResults.registeredSequences} sequences`);
};

// Export handlers for JSON sequence mounting
export const handlers = {
  bootstrapLogging,
  validateEnvironment,
  checkExistingInstance,
  createConductor,
  connectSystems,
  loadSequences,
  validateRegistrations,
  exposeFacade,
  markInitialized,
  notifyReady,
};

// Export system state accessors for backward compatibility
export const getCommunicationSystemInstance = () => communicationSystemInstance;
export const isCommunicationSystemInitialized = () => communicationSystemInitialized;
export const resetCommunicationSystem = () => {
  const isProduction = process?.env?.NODE_ENV === 'production' || 
                       (typeof window !== 'undefined' && (window as any)?.location?.hostname !== 'localhost');
  
  if (isProduction) {
    console.warn('🎼 Communication system reset blocked in production mode');
    return;
  }
  
  communicationSystemInitialized = false;
  communicationSystemInstance = null;
  MusicalConductor.resetInstance();
  (globalThis as any).__MC_LOG("🔄 Communication system state reset");
};
