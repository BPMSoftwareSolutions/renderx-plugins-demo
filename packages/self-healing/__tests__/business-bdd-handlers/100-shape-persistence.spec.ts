import { describe, it, expect } from 'vitest';
import { emitFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';

installTelemetryMatcher();

describe('Business BDD: shape-persistence (auto-generated)', () => {
  it('Scenario: Persist telemetry records and verify rolling history maintenance.', async () => {
    clearTelemetry();
    const { record } = await emitFeature('shape-persistence', 'shape-persistence:executed', async () => ({ ok: true }));
    // Governance: required fields
    expect(record.feature).toBe('shape-persistence');
    expect(record.event).toBe('shape-persistence:executed');
    expect(record.correlationId).toMatch(/-/);
    expect(record.beats).toBeGreaterThanOrEqual(2);
    // Placeholder assertions derived from acceptance criteria hints
    expect(getTelemetry().length).toBe(1);
    expect(record).toHaveTelemetry({ feature: 'shape-persistence', event: 'shape-persistence:executed' });
  });
});
