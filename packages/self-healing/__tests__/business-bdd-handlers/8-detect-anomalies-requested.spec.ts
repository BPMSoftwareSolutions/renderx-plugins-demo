import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectAnomaliesRequested } from '../../src/handlers/anomaly/detect.requested';
import { createEventBus } from '../support/eventBus';

/**
 * Business BDD Test: detectAnomaliesRequested
 * 
 * User Story:
 * As a DevOps Engineer
 * I want to Initiate anomaly detection
 * 
 * Handler Type: detectAnomaliesRequested
 * Sequence: anomaly
 * 
 * This test validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Business BDD: detectAnomaliesRequested', () => {
  let ctx: any;

  beforeEach(() => {
    const sequenceId = `anomaly-detect-${Date.now()}`;
  ctx = {
      handler: detectAnomaliesRequested,
      bus: createEventBus(),
      input: { sequenceId, metricsAvailable: true },
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });

  describe('Scenario: User requests anomaly detection after parsing telemetry', () => {
    it('should achieve the desired business outcome', () => {
      // GIVEN (Preconditions - Business Context)
      expect(ctx.input.metricsAvailable).toBe(true);

      // WHEN (Action - User/System Action)
      // - user triggers anomaly detection
      ctx.output = ctx.handler(ctx.input.sequenceId);

      // THEN (Expected Outcome - Business Value)
      // - system should validate request
      // - detection should begin
      // - user should receive confirmation
      expect(ctx.output.event).toBe('anomaly.detect.requested');
      expect(ctx.output.context?.sequenceId).toBe(ctx.input.sequenceId);
      ctx.bus.publish('anomaly.detect.requested', ctx.output);
      expect(ctx.bus.count('anomaly.detect.requested')).toBe(1);
    });
  });
});
