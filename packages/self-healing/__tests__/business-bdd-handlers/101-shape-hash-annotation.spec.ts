import { describe, it, expect } from 'vitest';
import { emitFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';

installTelemetryMatcher();

describe('Business BDD: shape-hash-annotation (auto-generated)', () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });

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
});
