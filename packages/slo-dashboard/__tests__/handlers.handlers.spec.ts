/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
// Plugin: slo-dashboard
// Handlers in scope: loadBudgets, loadMetrics, computeCompliance, serializeDashboardState, triggerExportDownload
import { loadBudgets, loadMetrics, computeCompliance, serializeDashboardState, triggerExportDownload } from '../src/handlers/metrics';

// Sequence coverage mapping:
//  dashboard.load: loadBudgets -> loadMetrics -> computeCompliance
//  dashboard.refresh.metrics: loadMetrics -> computeCompliance
//  dashboard.export.report: serializeDashboardState -> triggerExportDownload

describe('slo-dashboard handlers handlers', () => {
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
  let budgets: any; let metrics: any; let compliance: any;

  beforeEach(async () => {
    budgets = await loadBudgets();
    metrics = await loadMetrics();
    compliance = computeCompliance();
  });

  it('loadBudgets - returns budgets array', () => {
    expect(budgets).toBeDefined();
    expect(Array.isArray(budgets.budgets)).toBe(true);
  });
  it('loadMetrics - returns metrics array', () => {
    expect(metrics).toBeDefined();
    expect(Array.isArray(metrics.metrics)).toBe(true);
  });
  it('computeCompliance - returns overallCompliance number', () => {
    expect(compliance).toBeDefined();
    expect(typeof compliance.overallCompliance).toBe('number');
  });
  it('serializeDashboardState - returns export payload object with hash & signature', () => {
    const payload = serializeDashboardState();
    expect(typeof payload).toBe('object');
    expect(payload).toHaveProperty('hash');
    expect(payload).toHaveProperty('signature');
    expect(payload.hash).toHaveLength(64); // sha256 hex
  });
  it('triggerExportDownload - returns download metadata from object payload', async () => {
    const payload = serializeDashboardState();
    const result = await triggerExportDownload(payload);
    expect(result).toBeDefined();
    expect(result.downloaded).toBeGreaterThan(0);
  });
});
