import { describe, it, expect } from 'vitest';
import { emitFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';

installTelemetryMatcher();

describe('Business BDD: shape-hash-annotation (auto-generated)', () => {
  it('Scenario: Emit telemetry with stable hash and permit annotated evolution.', async () => {
    clearTelemetry();
    const { record } = await emitFeature('shape-hash-annotation', 'shape-hash-annotation:executed', async () => ({ ok: true }));
    // Governance: required fields
    expect(record.feature).toBe('shape-hash-annotation');
    expect(record.event).toBe('shape-hash-annotation:executed');
    expect(record.correlationId).toMatch(/-/);
    expect(record.beats).toBeGreaterThanOrEqual(2);
    // Placeholder assertions derived from acceptance criteria hints
    expect(getTelemetry().length).toBe(1);
    expect(record).toHaveTelemetry({ feature: 'shape-hash-annotation', event: 'shape-hash-annotation:executed' });
  });
});
