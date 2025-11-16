import type { DiagnosticEvent } from './types';

export type DiagnosticListener = (event: DiagnosticEvent) => void;

const listeners = new Set<DiagnosticListener>();
let enabled = false;

export function enableDiagnostics(): void {
  enabled = true;
}

export function disableDiagnostics(): void {
  enabled = false;
}

export function isDiagnosticsEnabled(): boolean {
  return enabled;
}

export function addDiagnosticListener(listener: DiagnosticListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Emit a diagnostic event to all registered listeners.
 * This is the canonical entry point used by the host and shims.
 */
export function emitDiagnostic(
  event: Omit<DiagnosticEvent, 'timestamp'> & { timestamp?: string }
): void {
  if (!enabled) {
    return;
  }

  const fullEvent: DiagnosticEvent = {
    timestamp: event.timestamp || new Date().toISOString(),
    level: event.level,
    source: event.source,
    message: event.message,
    data: event.data,
  };

  for (const listener of Array.from(listeners)) {
    try {
      listener(fullEvent);
    } catch {
      // Never let diagnostics break the app; swallow listener errors.
    }
  }
}

