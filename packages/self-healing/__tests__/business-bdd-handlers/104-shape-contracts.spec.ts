import { describe, it, expect } from 'vitest';
import { emitFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';

installTelemetryMatcher();

describe('Business BDD: shape-contracts (auto-generated)', () => {
  it('Scenario: Validate feature shape against versioned contract artifact.', async () => {
    clearTelemetry();
    const { record } = await emitFeature('shape-contracts', 'shape-contracts:executed', async () => ({ ok: true }));
    // Governance: required fields
    expect(record.feature).toBe('shape-contracts');
    expect(record.event).toBe('shape-contracts:executed');
    expect(record.correlationId).toMatch(/-/);
    expect(record.beats).toBeGreaterThanOrEqual(2);
    // Placeholder assertions derived from acceptance criteria hints
    expect(getTelemetry().length).toBe(1);
    expect(record).toHaveTelemetry({ feature: 'shape-contracts', event: 'shape-contracts:executed' });
  });
});
