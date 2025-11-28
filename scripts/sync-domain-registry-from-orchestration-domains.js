#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const registryPath = path.join(rootDir, 'DOMAIN_REGISTRY.json');
const orchestrationRegistryPath = path.join(rootDir, 'orchestration-domains.json');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJson(p, value) {
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function inferDomainType(category) {
  if (category === 'orchestration') return 'orchestration';
  // Infrastructure and plugin sequences are capability-style domains that still
  // expose orchestration via MusicalSequence.
  return 'capability';
}

function inferStatus(domain) {
  return domain.status || 'active';
}

function inferOwnership(domain) {
  if (domain.category === 'plugin' || String(domain.id || '').startsWith('renderx-web-')) {
    return 'RenderX-Web';
  }
  if (domain.category === 'infrastructure') {
    return 'Platform-Infrastructure';
  }
  return 'Platform-Orchestration';
}

function main() {
  const registry = loadJson(registryPath);
  const orchestrationRegistry = loadJson(orchestrationRegistryPath);

  registry.domains = registry.domains || {};
  const domains = registry.domains;

  const orchestrationDomains = orchestrationRegistry.domains || [];
  let added = 0;

  for (const orchestrationDomain of orchestrationDomains) {
    const id = orchestrationDomain.id;
    if (!id) continue;

    const existing = domains[id];
    if (existing) {
      // Preserve hand-authored orchestration blocks (e.g. renderx-web-orchestration).
      if (!existing.orchestration) {
        existing.orchestration = {
          schema_ref: 'docs/schemas/musical-sequence.schema.json',
          interface: {
            name: 'MusicalSequence',
            source:
              'packages/musical-conductor/modules/communication/sequences/SequenceTypes.ts',
          },
          registry_ref: {
            file: 'orchestration-domains.json',
            id: 'orchestration-domains-registry',
          },
        };
      }
      continue;
    }

    domains[id] = {
      domain_id: id,
      domain_type: inferDomainType(orchestrationDomain.category),
      status: inferStatus(orchestrationDomain),
      description: orchestrationDomain.description || orchestrationDomain.name,
      root_ref: 'docs/governance/UNIFIED_GOVERNANCE_AUTHORITY.json',
      parent_refs: orchestrationDomain.parent
        ? [orchestrationDomain.parent]
        : ['orchestration-core'],
      ownership: inferOwnership(orchestrationDomain),
      deprecated: false,
      supersedes: [],
      orchestration: {
        schema_ref: 'docs/schemas/musical-sequence.schema.json',
        interface: {
          name: 'MusicalSequence',
          source:
            'packages/musical-conductor/modules/communication/sequences/SequenceTypes.ts',
        },
        registry_ref: {
          file: 'orchestration-domains.json',
          id: 'orchestration-domains-registry',
        },
      },
    };

    added += 1;
  }

  // Recompute basic meta counts if present.
  if (registry.meta) {
    const allDomains = Object.values(domains);
    const active = allDomains.filter(
      d => d.status === 'active' && !d.deprecated,
    ).length;
    const deprecated = allDomains.filter(d => d.deprecated).length;

    registry.meta.active_count = active;
    registry.meta.deprecated_count = deprecated;
  }

  saveJson(registryPath, registry);

  console.log(
    `Synced DOMAIN_REGISTRY.json with orchestration-domains.json (added ${added} domains).`,
  );
}

main();

