/**
 * Diagnostics Event Types
 *
 * Shared type definitions for live diagnostics event tap and consumers.
 */

export type DiagnosticLevel = 'debug' | 'info' | 'warn' | 'error';

export type DiagnosticSource =
  | 'EventBus'
  | 'EventRouter'
  | 'Sequence'
  | 'Plugin'
  | 'System';

export interface DiagnosticEvent {
  timestamp: string;
  level: DiagnosticLevel;
  source: DiagnosticSource;
  message: string;
  // Optional structured payload associated with the event (topic, payload, timing, etc.)
  data?: any;
}

