import { addDiagnosticListener } from './eventTap';
import type { DiagnosticEvent } from './types';

let attached = false;

/**
 * Attach a console listener that prints all diagnostics events.
 * Safe to call multiple times; only the first call will attach a listener.
 */
export function attachConsoleDiagnostics(): void {
  if (attached) return;
  attached = true;

  addDiagnosticListener((event: DiagnosticEvent) => {
    const { timestamp, level, source, message, data } = event;
    const prefix = `[RX DIAG] ${timestamp} [${source}] (${level}) ${message}`;

    if (level === 'error') {
      console.error(prefix, data);
    } else if (level === 'warn') {
      console.warn(prefix, data);
    } else {
      console.log(prefix, data);
    }
  });
}

