import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { startFeature, beat, endFeature } from '../../src/telemetry/emitter';
import { installTelemetryMatcher } from '../../src/telemetry/matcher';
import { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';
// Use CommonJS require for ESM script compatibility under Vitest transpilation
const { buildComposite } = require('../../../../scripts/build-composite-shapes.js');

installTelemetryMatcher();

describe('Business BDD: multi-feature-correlation (auto-generated GREEN)', () => {
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
  it('Scenario: Build composite from two feature telemetry records aggregating beats.', async () => {
    clearTelemetry();
    // Emit first feature with manual beats
    const c1 = startFeature('multi-feature-correlation', 'multi-feature-correlation:executed');
    for (let i = 0; i < 4; i++) beat(c1);
    const r1 = endFeature(c1, 'ok', { ok: true })!;
    // Emit second existing feature to correlate (reuse shape-persistence)
    const c2 = startFeature('shape-persistence', 'shape-persistence:executed');
    for (let i = 0; i < 3; i++) beat(c2);
    const r2 = endFeature(c2, 'ok', { ok: true })!;
    expect(getTelemetry().length).toBe(2);
    // Persist run artifacts so buildComposite sees current beats instead of previous cached runs
    const telemetryRoot = path.join(process.cwd(), '.generated', 'telemetry');
    function writeRun(feature, beats) {
      const dir = path.join(telemetryRoot, feature);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file = `run-${Date.now()}-${Math.random().toString(36).slice(2,8)}.json`; // ensure uniqueness
      const payload = { beats, batonDiffCount: 0, shapeHash: `${feature}-temp-hash` };
      fs.writeFileSync(path.join(dir, file), JSON.stringify(payload, null, 2));
    }
    writeRun('multi-feature-correlation', r1.beats);
    writeRun('shape-persistence', r2.beats);
    // Build composite
    const chainId = `chain-${Date.now()}`;
    const compositePath = buildComposite(chainId, ['multi-feature-correlation', 'shape-persistence']);
    expect(compositePath).toMatch(/composites/);
    const composite = JSON.parse(require('fs').readFileSync(compositePath, 'utf-8'));
    expect(composite.chainId).toBe(chainId);
    expect(composite.features).toContain('multi-feature-correlation');
    expect(composite.features).toContain('shape-persistence');
    const summedBeats = r1.beats + r2.beats;
    expect(composite.aggregated.beats).toBe(summedBeats);
  });
});
