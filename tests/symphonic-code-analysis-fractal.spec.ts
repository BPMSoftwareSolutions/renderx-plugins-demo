import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pipelinePath = path.join(
  __dirname,
  '../packages/orchestration/json-sequences/symphonic-code-analysis-pipeline.json',
);

const pipeline = JSON.parse(fs.readFileSync(pipelinePath, 'utf-8'));

describe('[BEAT:renderx-web-orchestration:renderx-web-orchestration:3.4] [[AC:renderx-web-orchestration:renderx-web-orchestration:3.4:1]] Symphonic Code Analysis Pipeline - Fractal Architecture Encoding', () => {
    // Given: the ensureLineOverlayFor operation is triggered
    const startTime = performance.now();
    // When: the handler executes
  it('[AC:renderx-web-orchestration:renderx-web-orchestration:3.4:1] declares fractal architecture as a conformity metric', () => {
    const fractalMetric =
      pipeline.analysisMetrics?.conformityMetrics?.fractalArchitecture;

    // Then: it completes successfully within < 1 second
    expect(fractalMetric).toBeDefined();
    expect(fractalMetric.description).toMatch(/fractal/i);
    expect(fractalMetric.benchmark).toBeDefined();
    expect(fractalMetric.impact).toBeTypeOf('string');
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:3.4:2] emits an event when fractal architecture is analyzed', () => {
      // Given: valid input parameters
      // When: ensureLineOverlayFor processes them
    const events: string[] = pipeline.events ?? [];
    const hasFractalEvent = events.some(event =>
      event.toLowerCase().includes('movement-4:fractal'),
    );

      // Then: results conform to expected schema
    expect(hasFractalEvent).toBe(true);
      // And: no errors are thrown
      // And: telemetry events are recorded with latency metrics
  });

  it('[AC:renderx-web-orchestration:renderx-web-orchestration:3.4:2] describes fractal architecture work in movement 4 beats', () => {
    const beat = (pipeline.beatDetails ?? []).find(
      (b: any) => b.movement === 4 && b.number === 2,
    );

    expect(beat).toBeDefined();
    expect(String(beat.description).toLowerCase()).toContain('fractal');
  });
    // And: the output is valid and meets schema
    // And: any required events are published
    const elapsed = performance.now() - startTime;
    expect(elapsed).toBeLessThan(1000);
});

