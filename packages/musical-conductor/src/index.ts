// Public entry point for the musical-conductor package
// Re-export the communication system public API
export * from "../modules/communication/index.js";

// Re-export handler symphonies following the standard orchestration pattern
export * from "./symphonies/initialize/initialize.symphony.js";
export * from "./symphonies/register-sequence/register-sequence.symphony.js";
export * from "./symphonies/execute-sequence/execute-sequence.symphony.js";
export * from "./symphonies/validate-plugin/validate-plugin.symphony.js";
export * from "./symphonies/monitor/monitor.symphony.js";

