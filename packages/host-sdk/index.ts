// Thin façade re-exporting stable host APIs for plugins
export { useConductor } from "../../src/conductor";
export type { ConductorClient } from "musical-conductor"; // from external lib types
export { EventRouter } from "../../src/EventRouter";
export { resolveInteraction } from "../../src/interactionManifest";
export { isFlagEnabled, getFlagMeta } from "../../src/feature-flags/flags";
export {
  getTagForType,
  computeTagFromJson,
} from "../../src/component-mapper/mapper";
export { mapJsonComponentToTemplate } from "../../src/jsonComponent.mapper";
// Extended flag helpers (read-only + test-only mutators marked clearly)
export { getAllFlags, getUsageLog, setFlagOverride, clearFlagOverrides } from "../../src/feature-flags/flags";
// Plugin manifest helpers
export { getPluginManifest, getCachedPluginManifest } from "./pluginManifest";
