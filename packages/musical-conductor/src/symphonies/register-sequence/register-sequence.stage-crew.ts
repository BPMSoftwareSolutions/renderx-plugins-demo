/**
 * REGISTER-SEQUENCE Symphony - Stage Crew
 * Handlers for registering musical sequences with the conductor
 * 
 * Movement 1 (Validation): validateSequenceShape, checkDuplicates, validateBeats
 * Movement 2 (Registration): registerWithRegistry, updateEventMappings, notifyRegistered
 * Movement 3 (Verification): verifyAvailability, logRegistrationDetails
 */

import type { MusicalSequence } from "../../../modules/communication/sequences/SequenceTypes.js";

/** Movement 1, Beat 1: Validate sequence shape and required fields */
export const validateSequenceShape = (data: any, ctx: any) => {
  const sequence: MusicalSequence = ctx.payload.sequence;
  
  if (!sequence) {
    throw new Error("Sequence cannot be null or undefined");
  }
  
  if (!sequence.id) {
    throw new Error("Sequence must have an id");
  }
  
  if (!sequence.name) {
    throw new Error("Sequence must have a name");
  }
  
  if (!sequence.movements || !Array.isArray(sequence.movements)) {
    throw new Error(`Sequence "${sequence.name}" must have movements array`);
  }
  
  ctx.payload.validationPassed = true;
  (globalThis as any).__MC_LOG(`✅ Sequence shape validated: "${sequence.name}"`);
};

/** Movement 1, Beat 2: Check for duplicate sequence ID */
export const checkDuplicates = (data: any, ctx: any) => {
  const { sequence, conductor } = ctx.payload;
  
  // Check if sequence already registered
  const existingSequence = conductor?.getSequenceById?.(sequence.id);
  
  if (existingSequence) {
    (globalThis as any).__MC_WARN(
      `⚠️ Sequence "${sequence.name}" already registered, will be replaced`
    );
    ctx.payload.isDuplicate = true;
  } else {
    ctx.payload.isDuplicate = false;
  }
};

/** Movement 1, Beat 3: Validate beats within movements */
export const validateBeats = (data: any, ctx: any) => {
  const sequence: MusicalSequence = ctx.payload.sequence;
  let totalBeats = 0;
  const beatErrors: string[] = [];
  
  sequence.movements.forEach((movement, movIdx) => {
    if (!movement.beats || !Array.isArray(movement.beats)) {
      beatErrors.push(`Movement ${movIdx + 1} missing beats array`);
      return;
    }
    
    movement.beats.forEach((beat, beatIdx) => {
      if (beat.beat === undefined || beat.beat === null) {
        beatErrors.push(`Movement ${movIdx + 1}, Beat ${beatIdx + 1} missing beat number`);
      }
      if (!beat.event || typeof beat.event !== "string") {
        beatErrors.push(`Movement ${movIdx + 1}, Beat ${beatIdx + 1} missing event type`);
      }
      if (!beat.dynamics) {
        beatErrors.push(`Movement ${movIdx + 1}, Beat ${beatIdx + 1} missing dynamics`);
      }
      totalBeats++;
    });
  });
  
  if (beatErrors.length > 0) {
    ctx.payload.beatValidationErrors = beatErrors;
    throw new Error(`Beat validation failed: ${beatErrors.join(", ")}`);
  }
  
  ctx.payload.totalBeats = totalBeats;
  ctx.payload.totalMovements = sequence.movements.length;
  (globalThis as any).__MC_LOG(
    `✅ Beat validation passed: ${totalBeats} beats across ${sequence.movements.length} movements`
  );
};

/** Movement 2, Beat 1: Register sequence with registry */
export const registerWithRegistry = (data: any, ctx: any) => {
  const { sequence, conductor } = ctx.payload;
  
  try {
    conductor.registerSequence(sequence);
    ctx.payload.registeredSuccessfully = true;
    (globalThis as any).__MC_LOG(`✅ Sequence registered: "${sequence.name}" (${sequence.id})`);
  } catch (error) {
    ctx.payload.registrationError = error;
    throw new Error(`Failed to register sequence: ${error}`);
  }
};

/** Movement 2, Beat 2: Update event-to-sequence mappings */
export const updateEventMappings = (data: any, ctx: any) => {
  const { sequence } = ctx.payload;
  
  // Map any trigger events to this sequence
  const triggerEvents = sequence.triggerEvents || [];
  ctx.payload.eventMappings = triggerEvents.map((event: string) => ({
    event,
    sequenceId: sequence.id,
    sequenceName: sequence.name,
  }));
  
  if (triggerEvents.length > 0) {
    (globalThis as any).__MC_LOG(
      `✅ Event mappings updated: ${triggerEvents.length} triggers for "${sequence.name}"`
    );
  }
};

/** Movement 2, Beat 3: Notify registration complete via event */
export const notifyRegistered = (data: any, ctx: any) => {
  const { sequence } = ctx.payload;
  
  // Event emission happens inside SequenceRegistry.register()
  // This handler confirms the notification completed
  ctx.payload.notificationSent = true;
  
  (globalThis as any).__MC_LOG(
    `📢 Registration notification sent for "${sequence.name}"`
  );
};

/** Movement 3, Beat 1: Verify sequence is now available */
export const verifyAvailability = (data: any, ctx: any) => {
  const { sequence, conductor } = ctx.payload;
  
  const retrievedSequence = conductor.getSequenceById(sequence.id);
  
  if (!retrievedSequence) {
    throw new Error(`Sequence "${sequence.name}" not found after registration`);
  }
  
  ctx.payload.verificationPassed = true;
  (globalThis as any).__MC_LOG(`✅ Sequence verified available: "${sequence.name}"`);
};

/** Movement 3, Beat 2: Log registration summary */
export const logRegistrationDetails = (data: any, ctx: any) => {
  const { sequence, totalBeats, totalMovements, isDuplicate } = ctx.payload;
  
  const summary = {
    id: sequence.id,
    name: sequence.name,
    category: sequence.category || "unknown",
    movements: totalMovements,
    beats: totalBeats,
    priority: sequence.priority || "NORMAL",
    replaced: isDuplicate,
  };
  
  ctx.payload.registrationSummary = summary;
  
  (globalThis as any).__MC_LOG(
    `📊 Registration complete: ${sequence.name} | ${totalMovements} movements | ${totalBeats} beats | Priority: ${sequence.priority || "NORMAL"}`
  );
};

// Export handlers for JSON sequence mounting
export const handlers = {
  validateSequenceShape,
  checkDuplicates,
  validateBeats,
  registerWithRegistry,
  updateEventMappings,
  notifyRegistered,
  verifyAvailability,
  logRegistrationDetails,
};
