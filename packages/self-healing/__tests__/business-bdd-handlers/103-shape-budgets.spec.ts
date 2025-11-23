import { describe, it, expect } from 'vitest';
import { startFeature, beat, endFeature, registerDomainMutation } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';
import { getAnomalies, clearAnomalies } from '../../src/telemetry/anomalies';

installTelemetryMatcher();

describe('Business BDD: shape-budgets (auto-generated GREEN)', () => {
  it('Scenario: Detect budget breach emits degradation anomaly and captures domain mutations.', async () => {
    clearTelemetry();
    clearAnomalies();
    // Manually exceed beatsMax (3) by emitting >3 beats
    const correlationId = startFeature('shape-budgets', 'shape-budgets:executed');
    // Register domain mutations in two domains
    registerDomainMutation(correlationId, 'cache');
    registerDomainMutation(correlationId, 'db');
    for (let i = 0; i < 5; i++) beat(correlationId); // produce 5 beats (breach)
    const record = endFeature(correlationId, 'ok', { ok: true })!;
    // Governance: required fields
    expect(record.feature).toBe('shape-budgets');
    expect(record.event).toBe('shape-budgets:executed');
    expect(record.correlationId).toMatch(/-/);
    expect(record.beats).toBeGreaterThan(3); // breach condition
    expect(record.budgetStatus).toBe('breach');
    // Domain mutations captured
    expect(record.domainMutations).toBeDefined();
    expect(record.domainMutations!.cache).toBe(1);
    expect(record.domainMutations!.db).toBe(1);
    // Telemetry persisted
    expect(getTelemetry().length).toBe(1);
    expect(record).toHaveTelemetry({ feature: 'shape-budgets', event: 'shape-budgets:executed' });
    // Anomaly emitted
    const anomalies = getAnomalies();
    expect(anomalies.some(a => a.feature === 'shape-budgets' && a.type === 'shape.degradation')).toBe(true);
  });
});
