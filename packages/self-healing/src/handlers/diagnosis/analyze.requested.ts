import { TelemetryEvent } from '../../types/index';

/**
 * Initiates diagnosis (root cause analysis) sequence. Produces an event envelope
 * allowing downstream load + analysis handlers to chain consistently.
 */
export function analyzeRequested(sequenceId: string = 'diagnosis-analyze'): TelemetryEvent {
  if (!sequenceId || typeof sequenceId !== 'string') {
    throw new Error('sequenceId is required');
  }
  return {
    timestamp: new Date().toISOString(),
    handler: 'analyzeRequested',
    event: 'diagnosis.analyze.requested',
    context: { sequenceId }
  };
}

export default analyzeRequested;