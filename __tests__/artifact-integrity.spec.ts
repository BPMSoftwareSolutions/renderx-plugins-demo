import { describe, it, expect } from 'vitest';
import { verifyArtifactsIntegrity } from '../src/core/startup/startupValidation';

// Basic smoke tests; network fetch paths won't exist in node so function should no-op safely

describe('verifyArtifactsIntegrity', () => {
  it('returns null when integrity file not present', async () => {
    const result = await verifyArtifactsIntegrity(false);
    expect(result).toBeNull();
  });
});
