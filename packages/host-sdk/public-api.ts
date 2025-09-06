// Explicit public surface for @renderx/host-sdk (Phase 2)
export { useConductor } from "../../src/conductor";
export type { ConductorClient } from "musical-conductor";
export { EventRouter } from "../../src/EventRouter";
export { resolveInteraction } from "../../src/interactionManifest";
export { isFlagEnabled, getFlagMeta, getAllFlags, getUsageLog } from "../../src/feature-flags/flags";
export { getTagForType, computeTagFromJson } from "../../src/component-mapper/mapper";
export { mapJsonComponentToTemplate } from "../../src/jsonComponent.mapper";
export { getPluginManifest, getCachedPluginManifest } from "./pluginManifest";
// Test-only / caution exports (subject to removal in stricter semver)
export { setFlagOverride, clearFlagOverrides } from "../../src/feature-flags/flags";