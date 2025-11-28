import { describe, it, expect } from 'vitest';
import handlers from '../architecture-governance-handlers.js';

// Regression coverage for movement 2, beat 3 (indexBeatsFromJSON)
// Some symphonies summarize beats as a number per movement rather
// than an explicit beats[] array. This test ensures the handler
// can safely index beats across all symphony JSON files without
// throwing when it encounters those numeric summaries.
describe('architecture-governance-handlers: indexBeatsFromJSON', () => {
  it('indexes beats from symphony JSON without throwing on numeric beat summaries', async () => {
    const result: any = await (handlers as any).indexBeatsFromJSON();

    expect(result).toBeDefined();
    expect(Array.isArray(result.beatIndex)).toBe(true);
    expect(typeof result.totalBeats).toBe('number');
    expect(result.totalBeats).toBeGreaterThanOrEqual(result.beatIndex.length);
  });
});

