import flagsJson from "../../data/feature-flags.json" assert { type: "json" };
const FLAGS = flagsJson;
// Optional test overrides for enablement decisions
let enableOverrides = new Map();
// Simple usage log collector for tests and local debugging
const usageLog = [];
export function isFlagEnabled(id) {
    if (enableOverrides.has(id)) {
        const v = enableOverrides.get(id);
        usageLog.push({ id, when: Date.now() });
        return v;
    }
    const meta = FLAGS[id];
    usageLog.push({ id, when: Date.now() });
    if (!meta)
        return false;
    return meta.status === "on" || meta.status === "experiment";
}
export function getFlagMeta(id) {
    return FLAGS[id];
}
export function getAllFlags() {
    return { ...FLAGS };
}
export function getUsageLog() {
    return [...usageLog];
}
// Test-only helpers (no side effects in production code paths)
export function setFlagOverride(id, enabled) {
    enableOverrides.set(id, enabled);
}
export function clearFlagOverrides() {
    enableOverrides.clear();
}
//# sourceMappingURL=flags.js.map