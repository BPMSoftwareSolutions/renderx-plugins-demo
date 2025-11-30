// Public entry point for the musical-conductor package
// Re-export the communication system public API
export * from "../modules/communication/index.js";

// Re-export handler symphonies following the standard orchestration pattern
export { handlers as initializeHandlers } from "./symphonies/initialize/initialize.symphony.js";
export { handlers as registerSequenceHandlers } from "./symphonies/register-sequence/register-sequence.symphony.js";
export { handlers as executeSequenceHandlers } from "./symphonies/execute-sequence/execute-sequence.symphony.js";
export { handlers as validatePluginHandlers } from "./symphonies/validate-plugin/validate-plugin.symphony.js";
export { handlers as monitorHandlers } from "./symphonies/monitor/monitor.symphony.js";

