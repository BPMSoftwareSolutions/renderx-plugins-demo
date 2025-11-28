const fs = require('fs');
const path = require('path');

function loadJson(relPath) {
  const absPath = path.join(__dirname, '..', relPath);
  const raw = fs.readFileSync(absPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Analyze fractal architecture properties using DOMAIN_REGISTRY.json and
 * orchestration-domains.json as the dual authorities.
 *
 * This intentionally mirrors the invariants in
 * tests/domain-registry-orchestration-invariants.spec.ts but surfaces them as
 * metrics for the symphonic code-analysis pipeline.
 */
function analyzeFractalArchitecture() {
  const registry = loadJson('DOMAIN_REGISTRY.json');
  const orchestrationRegistry = loadJson('orchestration-domains.json');

  const domains = registry.domains || {};
  const orchestrationDomains = orchestrationRegistry.domains || [];

  const orchestrationIds = new Set(orchestrationDomains.map(d => d.id));
  const totalOrchestrationDomains = orchestrationDomains.length;

  // Projection-only orchestration domains: present in orchestration-domains
  // but missing from DOMAIN_REGISTRY.
  const projectionOnly = [];
  for (const id of orchestrationIds) {
    if (!domains[id]) {
      projectionOnly.push(id);
    }
  }

  // Registry-only orchestration domains: have an orchestration block in the
  // registry but are missing from orchestration-domains.json.
  const registryOnly = [];
  for (const [id, domain] of Object.entries(domains)) {
    if (domain && domain.orchestration && !orchestrationIds.has(id)) {
      registryOnly.push(id);
    }
  }

  // Build a lightweight parent graph to see which orchestration domains are
  // used as parents (systems of systems).
  const parentRefCounts = {};
  for (const [, domain] of Object.entries(domains)) {
    const parents = Array.isArray(domain.parent_refs) ? domain.parent_refs : [];
    for (const parent of parents) {
      if (!parentRefCounts[parent]) parentRefCounts[parent] = 0;
      parentRefCounts[parent] += 1;
    }
  }

  const systemOfSystemsDomainIds = [];
  for (const id of orchestrationIds) {
    if (parentRefCounts[id]) {
      systemOfSystemsDomainIds.push(id);
    }
  }

  const fractalScore =
    totalOrchestrationDomains > 0
      ? Number(
          (systemOfSystemsDomainIds.length / totalOrchestrationDomains).toFixed(2),
        )
      : 0;

  // Special focus: the fractal orchestration domain itself should be a fully
  // governed orchestration domain and participate in the parent graph.
  const fractalDomainId = 'fractal-orchestration-domain-symphony';
  const fractalDomainProjection =
    orchestrationDomains.find(d => d.id === fractalDomainId) || null;
  const fractalDomainRegistry = domains[fractalDomainId] || null;

  const fractalDomainIssues = [];

  if (!fractalDomainProjection) {
    fractalDomainIssues.push(
      'Fractal orchestration domain is not present in orchestration-domains.json',
    );
  }

  if (!fractalDomainRegistry) {
    fractalDomainIssues.push(
      'Fractal orchestration domain is not present in DOMAIN_REGISTRY.json',
    );
  }

  if (fractalDomainRegistry && !fractalDomainRegistry.orchestration) {
    fractalDomainIssues.push(
      'Fractal orchestration domain is missing canonical "orchestration" block in DOMAIN_REGISTRY.json',
    );
  }

  if (
    fractalDomainRegistry &&
    (!Array.isArray(fractalDomainRegistry.parent_refs) ||
      fractalDomainRegistry.parent_refs.length === 0)
  ) {
    fractalDomainIssues.push(
      'Fractal orchestration domain should participate in parent_refs as part of the fractal system-of-systems graph',
    );
  }

  const fractalDomain = {
    id: fractalDomainId,
    inOrchestrationRegistry: !!fractalDomainProjection,
    inDomainRegistry: !!fractalDomainRegistry,
    status:
      (fractalDomainRegistry && fractalDomainRegistry.status) ||
      (fractalDomainProjection && fractalDomainProjection.status) ||
      null,
    hasOrchestrationBlock: !!(
      fractalDomainRegistry && fractalDomainRegistry.orchestration
    ),
    hasParentRefs: !!(
      fractalDomainRegistry &&
      Array.isArray(fractalDomainRegistry.parent_refs) &&
      fractalDomainRegistry.parent_refs.length > 0
    ),
    parentRefs:
      (fractalDomainRegistry && fractalDomainRegistry.parent_refs) || [],
    issues: fractalDomainIssues,
  };

  const summary = {
    totalOrchestrationDomains,
    projectionOnly,
    registryOnly,
    systemOfSystemsDomains: systemOfSystemsDomainIds.length,
    systemOfSystemsDomainIds,
    fractalScore,
  };

  const details = {
    orchestrationDomainIds: Array.from(orchestrationIds),
    parentRefCounts,
  };

  return {
    summary,
    fractalDomain,
    details,
  };
}

module.exports = {
  analyzeFractalArchitecture,
};

