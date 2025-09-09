// Standalone public surface for @renderx/host-sdk
export { useConductor } from "./conductor.js";
export type { ConductorClient } from "./conductor.js";
export { EventRouter } from "./EventRouter.js";
export { resolveInteraction } from "./interactionManifest.js";
export { isFlagEnabled, getFlagMeta, getAllFlags, getUsageLog, setFlagOverride, clearFlagOverrides } from "./feature-flags.js";
export { getTagForType, computeTagFromJson } from "./component-mapper.js";
export { mapJsonComponentToTemplate } from "./jsonComponent.mapper.js";
export { getPluginManifest, getCachedPluginManifest } from "./pluginManifest.js";