/**
 * Self-Healing System Handlers
 * 
 * Organized by sequence:
 * - Telemetry Parsing (7 handlers)
 * - Anomaly Detection (9 handlers)
 * - Diagnosis (11 handlers)
 * - Fix Generation (9 handlers)
 * - Validation (10 handlers)
 * - Deployment (11 handlers)
 * - Learning (10 handlers)
 * 
 * Total: 67 handlers
 */

// Telemetry Parsing Handlers
// NOTE: Using extension-less paths so TypeScript resolves the .ts sources pre-build.
export * from './telemetry/parse.requested';
export * from './telemetry/load.logs';
export * from './telemetry/extract.events';
export * from './telemetry/normalize.data';
export * from './telemetry/aggregate.metrics';
export * from './telemetry/store.database';
export * from './telemetry/parse.completed';
// Orchestration helper for telemetry parsing sequence
export * from './telemetry/run.telemetry.parse';

// Anomaly Detection Handlers (implemented subset)
export * from './anomaly/detect.requested';
export * from './anomaly/load.telemetry';
export * from './anomaly/detect.performance';

// NOTE: Additional anomaly handlers (behavioral, coverage, errors, aggregate, store, completed)
// are not yet implemented. They will be added here when their source files exist.
// Diagnosis Handlers - pending implementation
// export * from './diagnosis/analyze.requested';
// ... (to be added)
// Fix Generation Handlers - pending implementation
// export * from './fix/generate.requested';
// ... (to be added)
// Validation Handlers - pending implementation
// export * from './validation/validate.requested';
// ... (to be added)
// Deployment Handlers - pending implementation
// export * from './deployment/deploy.requested';
// ... (to be added)
// Learning Handlers - pending implementation
// export * from './learning/track.requested';
// ... (to be added)

