import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseTelemetryRequested } from '../../src/handlers/telemetry/parse.requested';

/**
 * Business BDD Test: parseTelemetryRequested
 * 
 * User Story:
 * As a DevOps Engineer
 * I want to Initiate production log analysis
 * 
 * Handler Type: parseTelemetryRequested
 * Sequence: telemetry
 * 
 * This test validates business value and user outcomes,
 * not just technical implementation details.
 */

describe('Business BDD: parseTelemetryRequested', () => {
  let _ctx: any;

  beforeEach(() => {
    // GIVEN realistic production investigation context
    // Outage suspected: elevated latency on service 'api-gateway'
    const now = new Date();
    const sequenceId = `telemetry-parse-${now.toISOString()}`;
  ctx = {
      handler: parseTelemetryRequested,
      mocks: {
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {
        outageSuspected: true,
        service: 'api-gateway',
        logPaths: [
          '/var/log/app/app-2025-11-21-23.log',
          '/var/log/app/app-2025-11-22-00.log'
        ],
        sequenceId
      },
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  ctx = null;
  });

  describe('Scenario: User requests telemetry parsing to investigate recent outage', () => {
    it('should achieve the desired business outcome', () => {
      // GIVEN production logs available & outage suspected (preconditions already in beforeEach)
  expect(ctx.input.outageSuspected).toBe(true);
  expect(ctx.input.logPaths.length).toBeGreaterThan(0);

      // WHEN user triggers telemetry parsing
      ctx.output = ctx.handler(ctx.input.sequenceId);

      // THEN system validates request & returns confirmation event
      expect(ctx.output).toBeDefined();
      expect(ctx.output.event).toBe('telemetry.parse.requested');
      expect(ctx.output.context?.sequenceId).toBe(ctx.input.sequenceId);
      // Timestamp present & ISO format recognizable
      expect(typeof ctx.output.timestamp).toBe('string');
      // Business value: user can see parsing initiated (simulate event bus publish in future)
      // For now ensure we can wrap event for bus dispatch later
      const busEnvelope = { topic: 'telemetry.parse.requested', payload: ctx.output };
      expect(busEnvelope.payload.context?.sequenceId).toBe(ctx.input.sequenceId);
    });
  });
});
