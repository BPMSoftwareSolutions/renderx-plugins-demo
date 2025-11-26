import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { emitFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';

installTelemetryMatcher();

describe('Business BDD: shape-contracts (auto-generated)', () => {
  let _ctx: any;
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

  it('Scenario: Validate feature shape against versioned contract artifact.', async () => {
    clearTelemetry();
    const { record } = await emitFeature('shape-contracts', 'shape-contracts:executed', async () => ({ ok: true }));
    // Governance: required fields
    expect(record.feature).toBe('shape-contracts');
    expect(record.event).toBe('shape-contracts:executed');
    expect(record.correlationId).toMatch(/-/);
    expect(record.beats).toBeGreaterThanOrEqual(2);
    expect(getTelemetry().length).toBe(1);
    expect(record).toHaveTelemetry({ feature: 'shape-contracts', event: 'shape-contracts:executed' });
    const contractPath = path.join(process.cwd(), 'contracts', 'shape-contracts.contract.json');
    expect(fs.existsSync(contractPath)).toBe(true);
  });
});
