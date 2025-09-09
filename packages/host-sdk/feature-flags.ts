// Standalone feature flags for @renderx/host-sdk
// Simplified version that delegates to host or provides defaults

import "./types.js"; // Load global declarations

export type FlagStatus = "on" | "off" | "experiment";

export interface FlagMeta {
  status: FlagStatus;
  created: string;
  verified?: string;
  description?: string;
  owner?: string;
}

// Built-in flags for common features (fallback when host not available)
const DEFAULT_FLAGS: Record<string, FlagMeta> = {
  "lint.topics.runtime-validate": {
    status: "off",
    created: "2024-01-01",
    description: "Runtime validation of topic payloads",
  },
};

// Test overrides
let enableOverrides = new Map<string, boolean>();

// Usage log for diagnostics
const usageLog: Array<{ id: string; when: number }> = [];



export function isFlagEnabled(id: string): boolean {
  usageLog.push({ id, when: Date.now() });

  // Check test overrides first
  if (enableOverrides.has(id)) {
    return enableOverrides.get(id)!;
  }

  // Delegate to host if available
  if (typeof window !== "undefined") {
    const hostFlags = window.RenderX?.featureFlags;
    if (hostFlags) {
      try {
        return hostFlags.isFlagEnabled(id);
      } catch {
        // Fall through to defaults
      }
    }
  }

  // Use built-in defaults
  const meta = DEFAULT_FLAGS[id];
  if (!meta) return false;
  return meta.status === "on" || meta.status === "experiment";
}

export function getFlagMeta(id: string): FlagMeta | undefined {
  // Delegate to host if available
  if (typeof window !== "undefined") {
    const hostFlags = window.RenderX?.featureFlags;
    if (hostFlags) {
      try {
        return hostFlags.getFlagMeta(id);
      } catch {
        // Fall through to defaults
      }
    }
  }

  return DEFAULT_FLAGS[id];
}

export function getAllFlags(): Record<string, FlagMeta> {
  // Delegate to host if available
  if (typeof window !== "undefined") {
    const hostFlags = window.RenderX?.featureFlags;
    if (hostFlags) {
      try {
        return hostFlags.getAllFlags();
      } catch {
        // Fall through to defaults
      }
    }
  }

  return { ...DEFAULT_FLAGS };
}

export function getUsageLog(): Array<{ id: string; when: number }> {
  return [...usageLog];
}

// Test-only functions
export function setFlagOverride(id: string, enabled: boolean): void {
  enableOverrides.set(id, enabled);
}

export function clearFlagOverrides(): void {
  enableOverrides.clear();
}
