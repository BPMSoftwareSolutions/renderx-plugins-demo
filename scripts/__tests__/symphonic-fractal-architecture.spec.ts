import { describe, it, expect } from 'vitest';

// Fractal architecture metrics should be computed from DOMAIN_REGISTRY.json
// and orchestration-domains.json and then wired into the symphonic metrics
// envelope used by the code-analysis pipeline.

describe('Symphonic Fractal Architecture Metrics', () => {
  it('computes registry-aligned fractal metrics for the fractal orchestration domain', async () => {
    const mod: any = await import('../analyze-fractal-architecture.cjs');
    const analyze =
      mod.analyzeFractalArchitecture ||
      mod.default?.analyzeFractalArchitecture ||
      mod.default;

    const result = analyze();

    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.fractalDomain).toBeDefined();

    // Registry invariants for orchestration domains
	    expect(result.summary.totalOrchestrationDomains).toBeGreaterThan(0);
	    // All orchestration domains that appear only in the projection should be
	    // treated as hard governance drift (and there should be none).
	    expect(result.summary.projectionOnly).toEqual([]);
	    // Domains that appear only in the registry are still useful to surface as
	    // part of the fractal architecture analysis (for example orchestration-core).
	    // The metric should always be an array, but we don't require it to be empty.
	    expect(Array.isArray(result.summary.registryOnly)).toBe(true);

    // Fractal orchestration domain must be registered as a real orchestration domain
    expect(result.fractalDomain.id).toBe('fractal-orchestration-domain-symphony');
    expect(result.fractalDomain.inOrchestrationRegistry).toBe(true);
    expect(result.fractalDomain.inDomainRegistry).toBe(true);
    expect(result.fractalDomain.hasOrchestrationBlock).toBe(true);
    expect(result.fractalDomain.hasParentRefs).toBe(true);
    expect(result.fractalDomain.issues).toEqual([]);

    // Fractal score should be normalized between 0 and 1
    expect(result.summary.fractalScore).toBeGreaterThanOrEqual(0);
    expect(result.summary.fractalScore).toBeLessThanOrEqual(1);
  });

  it('wires fractal architecture summary into the symphonic metrics envelope when present', async () => {
    const envelopeMod: any = await import('../symphonic-metrics-envelope.cjs');
    const fractalMod: any = await import('../analyze-fractal-architecture.cjs');

    const { createMetricsEnvelope } = envelopeMod;
    const analyze =
      fractalMod.analyzeFractalArchitecture ||
      fractalMod.default?.analyzeFractalArchitecture ||
      fractalMod.default;

    const fractal = analyze();

    const baseMetrics: any = {
      coverage: { statements: '80', branches: '80', functions: '80', lines: '80' },
      maintainability: { maintainability: '70' },
      duplication: {
        totalUniqueBlocks: 0,
        estimatedMetrics: { estimatedDuplicateLines: 0, estimatedDuplicationRate: '0%' },
      },
      conformity: {
        conformityScore: '90',
        conformingBeats: 16,
        totalBeats: 16,
        violations: 0,
      },
      discoveredCount: 0,
      handlersToBeatMapping: {},
      fractalArchitecture: fractal,
    };

    const envelope = createMetricsEnvelope(baseMetrics);

    expect(envelope.fractal).toBeDefined();
    expect(envelope.fractal.totalOrchestrationDomains).toBe(
      fractal.summary.totalOrchestrationDomains,
    );
    expect(envelope.fractal.score).toBe(fractal.summary.fractalScore);
    expect(envelope.fractal.source).toBe('measured');
  });
});

