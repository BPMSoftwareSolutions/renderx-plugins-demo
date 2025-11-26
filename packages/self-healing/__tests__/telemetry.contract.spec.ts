import { describe, it, expect } from 'vitest';
import { clearTelemetry, getTelemetry } from '../src/telemetry/collector';
import { emitFeature } from '../src/telemetry/emitter';
import { installTelemetryMatcher } from '../src/telemetry/matcher';

installTelemetryMatcher();

describe('BDD Telemetry Contract', () => {
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
  it('emits telemetry with required fields via emitFeature wrapper', async () => {
    clearTelemetry();
    const { result, record } = await emitFeature('login', 'login:completed', () => ({ userId: 'u1' }), { sequenceSignature: 'abc123' });
    expect(result.userId).toBe('u1');
    expect(record.feature).toBe('login');
    expect(record.beats).toBeGreaterThanOrEqual(2);
    expect(record.correlationId).toMatch(/-/); // uuid contains dashes
    expect(record.status).toBe('ok');
    expect(record.sequenceSignature).toBe('abc123');
    expect(record.batonDiffCount).toBe(0);
    expect(getTelemetry().length).toBe(1);
    // matcher usage
    expect(record).toHaveTelemetry({ feature: 'login', event: 'login:completed' });
  });
});
