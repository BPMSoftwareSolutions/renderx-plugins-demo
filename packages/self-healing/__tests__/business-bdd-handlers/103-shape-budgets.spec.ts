import { describe, it, expect } from 'vitest';
import { emitFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';

installTelemetryMatcher();

describe('Business BDD: shape-budgets (auto-generated)', () => {
  it('Scenario: Detect budget breaches and emit degradation anomaly.', async () => {
    clearTelemetry();
    const { record } = await emitFeature('shape-budgets', 'shape-budgets:executed', async () => ({ ok: true }));
    // Governance: required fields
    expect(record.feature).toBe('shape-budgets');
    expect(record.event).toBe('shape-budgets:executed');
    expect(record.correlationId).toMatch(/-/);
    expect(record.beats).toBeGreaterThanOrEqual(2);
    // Placeholder assertions derived from acceptance criteria hints
    expect(getTelemetry().length).toBe(1);
    expect(record).toHaveTelemetry({ feature: 'shape-budgets', event: 'shape-budgets:executed' });
  });
});
