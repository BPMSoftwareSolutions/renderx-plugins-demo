// Thin façade re-exporting stable host APIs for plugins
export { useConductor } from "../../src/conductor";
export type { ConductorClient } from "musical-conductor"; // from external lib types
export { EventRouter } from "../../src/EventRouter";
export { resolveInteraction } from "../../src/interactionManifest";
export { isFlagEnabled, getFlagMeta } from "../../src/feature-flags/flags";

