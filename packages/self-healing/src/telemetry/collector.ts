import { BddTelemetryRecord } from './contract';

declare global {
  // Using var to allow global augmentation in Node ESM context (Vitest environment).
  var __bddTelemetryRecords: BddTelemetryRecord[] | undefined; // NOSONAR global state acceptable for test telemetry
}

function ensureGlobal() {
  if (!globalThis.__bddTelemetryRecords) {
    globalThis.__bddTelemetryRecords = [];
  }
  return globalThis.__bddTelemetryRecords;
}

export function recordTelemetry(rec: BddTelemetryRecord) {
  ensureGlobal().push(rec);
}

export function getTelemetry(): BddTelemetryRecord[] {
  return [...ensureGlobal()];
}

export function clearTelemetry() {
  ensureGlobal().length = 0;
}
