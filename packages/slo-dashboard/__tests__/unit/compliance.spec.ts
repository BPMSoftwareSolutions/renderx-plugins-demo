import { describe, it, expect } from 'vitest';
import { computeCompliance } from '../../src/handlers/metrics';

describe('computeCompliance', () => {
  it('returns structure with overallCompliance', () => {
    const result = computeCompliance();
    expect(result).toHaveProperty('overallCompliance');
  });
});
