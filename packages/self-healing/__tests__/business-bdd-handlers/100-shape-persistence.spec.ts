import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { emitFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';

installTelemetryMatcher();

describe('Business BDD: shape-persistence (auto-generated)', () => {
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

  it('Scenario: Persist telemetry records and verify rolling history maintenance.', async () => {
    clearTelemetry();
    const { record } = await emitFeature('shape-persistence', 'shape-persistence:executed', async () => ({ ok: true }));
    // Governance: required fields
    expect(record.feature).toBe('shape-persistence');
    expect(record.event).toBe('shape-persistence:executed');
    expect(record.correlationId).toMatch(/-/);
    expect(record.beats).toBeGreaterThanOrEqual(2);
    expect(getTelemetry().length).toBe(1);
    expect(record).toHaveTelemetry({ feature: 'shape-persistence', event: 'shape-persistence:executed' });
    const telemetryDir = path.join(process.cwd(), '.generated', 'telemetry', 'shape-persistence');
    const files = fs.existsSync(telemetryDir) ? fs.readdirSync(telemetryDir) : [];
    expect(files.some(f => /^run-\d+.json$/.test(f))).toBe(true);
    const indexPath = path.join(process.cwd(), '.generated', 'telemetry', 'index.json');
    expect(fs.existsSync(indexPath)).toBe(true);
    expect(record.shapeHash).toMatch(/[a-f0-9]{16,}/); // simplistic hash presence check
  });
});
