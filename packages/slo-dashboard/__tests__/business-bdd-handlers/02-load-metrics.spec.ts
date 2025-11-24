// Plugin: slo-dashboard
import { describe, it, expect } from 'vitest';
import { loadMetrics } from '../../src/handlers/metrics';

// Sequence mapping: dashboard.load (beat 2), dashboard.refresh.metrics (beat 1)
describe('Business BDD Handler: loadMetrics', () => {
  it('Scenario: Retrieve latest SLI metrics for compliance calculation.', async () => {
    const result = await loadMetrics();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('metrics');
    expect(Array.isArray(result.metrics)).toBe(true);
  });
});
