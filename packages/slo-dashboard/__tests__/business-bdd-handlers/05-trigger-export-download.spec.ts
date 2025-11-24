// Plugin: slo-dashboard
import { describe, it, expect } from 'vitest';
import { serializeDashboardState, triggerExportDownload } from '../../src/handlers/metrics';

// Sequence mapping: dashboard.export.report (beat 2)
describe('Business BDD Handler: triggerExportDownload', () => {
  it('Scenario: Initiate download of signed export artifacts.', async () => {
    const payload = serializeDashboardState();
    const result = await triggerExportDownload(payload);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('downloaded');
    expect(result.downloaded).toBeGreaterThan(0);
  });
});
