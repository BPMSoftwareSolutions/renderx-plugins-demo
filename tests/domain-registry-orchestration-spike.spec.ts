import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const domainRegistryPath = path.join(__dirname, '../DOMAIN_REGISTRY.json');
const orchestrationRegistryPath = path.join(
  __dirname,
  '../orchestration-domains.json',
);

function loadJson(p: string): any {
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

describe('[BEAT:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1] [[AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1]] DOMAIN_REGISTRY 4 orchestration-domains spike invariants', () => {
  const SPIKE_SEQUENCE_DOMAIN = 'renderx-web-orchestration';

  it('declares orchestration interface/schema linkage on orchestration-core', () => {
    const registry = loadJson(domainRegistryPath);
    const core = registry.domains?.['orchestration-core'];

    expect(core, 'orchestration-core domain must exist').toBeDefined();
    const orch = core.orchestration;
    expect(orch, 'orchestration-core.orchestration block must be defined').toBeDefined();

    // Interface & schema linkage
    expect(orch.schema_ref).toBe('docs/schemas/musical-sequence.schema.json');
    expect(orch.interface?.name).toBe('MusicalSequence');
    expect(orch.interface?.source).toContain(
      'packages/musical-conductor/modules/communication/sequences/SequenceTypes.ts',
    );

    // Registry projection linkage
    expect(orch.registry_ref?.file).toBe('orchestration-domains.json');
    expect(orch.registry_ref?.id).toBe('orchestration-domains-registry');
  });

  it('links a spike orchestration-sequence domain to orchestration-domains registry', () => {
    const registry = loadJson(domainRegistryPath);
    const orchestrationDomains = loadJson(orchestrationRegistryPath);

    const spikeDomain = registry.domains?.[SPIKE_SEQUENCE_DOMAIN];
    expect(spikeDomain, 'spike orchestration domain must exist').toBeDefined();
    expect(spikeDomain.domain_id).toBe(SPIKE_SEQUENCE_DOMAIN);
    expect(spikeDomain.status).toBe('active');

    const orch = spikeDomain.orchestration;
    expect(orch, 'spike domain must declare an orchestration block').toBeDefined();
    expect(orch.schema_ref).toBe('docs/schemas/musical-sequence.schema.json');

    const registryRef = orch.registry_ref;
    expect(registryRef?.file).toBe('orchestration-domains.json');
    expect(registryRef?.id).toBe('orchestration-domains-registry');
    expect(registryRef?.domain_id).toBe(SPIKE_SEQUENCE_DOMAIN);

    const seqFiles = orch.sequence_files;
    expect(Array.isArray(seqFiles)).toBe(true);
    expect(seqFiles.length).toBeGreaterThan(0);

    const orchDomain = orchestrationDomains.domains.find(
      (d: any) => d.id === SPIKE_SEQUENCE_DOMAIN,
    );
    expect(orchDomain, 'orchestration-domains entry must exist for spike domain').toBeDefined();

    const expectedSequence = orchDomain.sequenceFile;
    expect(expectedSequence, 'orchestration registry must define sequenceFile').toBeTruthy();
    expect(seqFiles).toContain(expectedSequence);

    // Sanity: the expected sequence path should be in the orchestration json-sequences folder
    expect(String(expectedSequence)).toContain(
      'packages/orchestration/json-sequences/',
    );
  });
});

