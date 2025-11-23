interface TelemetryAnomaly {
  type: string;
  feature: string;
  correlationId: string;
  detail?: Record<string, any>;
  timestamp?: string;
}

declare global {
  var __bddTelemetryAnomalies: TelemetryAnomaly[] | undefined;
}

function store() {
  if (!globalThis.__bddTelemetryAnomalies) globalThis.__bddTelemetryAnomalies = [];
  return globalThis.__bddTelemetryAnomalies;
}

export function recordAnomaly(a: TelemetryAnomaly) {
  a.timestamp = new Date().toISOString();
  store().push(a);
}

export function getAnomalies(): TelemetryAnomaly[] {
  return [...store()];
}

export function clearAnomalies() {
  store().length = 0;
}

export type { TelemetryAnomaly };