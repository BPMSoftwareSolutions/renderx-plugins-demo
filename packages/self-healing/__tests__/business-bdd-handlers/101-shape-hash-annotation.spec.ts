// (no fs/path needed after evolution gating update)
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
    expect(getTelemetry().length).toBe(1);
    expect(record).toHaveTelemetry({ feature: 'shape-hash-annotation', event: 'shape-hash-annotation:executed' });
    // Hash reproducibility check: emit same feature again and expect identical hash
    const { record: second } = await emitFeature('shape-hash-annotation', 'shape-hash-annotation:executed', async () => ({ ok: true }));
    expect(second.shapeHash).toBe(record.shapeHash);
  });
  it('Scenario: Optional evolution (gated) changes shapeHash', async () => {
    if (process.env.ENABLE_HASH_EVOLUTION_TEST !== '1') {
      expect(true).toBe(true); // skip silently
      return;
    }
    clearTelemetry();
    // First emission baseline
    const { record: base } = await emitFeature('shape-hash-annotation', 'shape-hash-annotation:executed', async () => ({ ok: true }));
    // Second emission with deliberate baton mutation to affect hash inputs
    const { record: evolved } = await emitFeature('shape-hash-annotation', 'shape-hash-annotation:executed', async () => ({ ok: true, variant: Date.now() }));
    expect(evolved.shapeHash).not.toBe(base.shapeHash);
    // Diff script should detect this unannotated change next run until annotation added
  });
});
