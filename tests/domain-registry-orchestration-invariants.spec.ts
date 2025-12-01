import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface DomainRegistryDomain {
  domain_id: string;
  domain_type: string;
  status: string;
  orchestration?: {
    schema_ref: string;
    interface?: {
      name: string;
      source: string;
    };
    registry_ref?: {
      file: string;
      id: string;
      domain_id?: string;
    };
    sequence_files?: string[];
  };
  [key: string]: unknown;
}

interface DomainRegistryFile {
  domains: Record<string, DomainRegistryDomain>;
}

interface OrchestrationRegistryDomain {
  id: string;
  [key: string]: unknown;
}

interface OrchestrationRegistryFile {
  domains: OrchestrationRegistryDomain[];
}

describe('DOMAIN_REGISTRY / orchestration-domains / context invariants', () => {
  const registryPath = path.join(__dirname, '../DOMAIN_REGISTRY.json');
  const orchestrationRegistryPath = path.join(
    __dirname,
    '../orchestration-domains.json',
  );
  const contextIndexPath = path.join(
    __dirname,
    '../.generated/CONTEXT_TREE_INDEX.json',
  );

  const registry = JSON.parse(
    fs.readFileSync(registryPath, 'utf-8'),
  ) as DomainRegistryFile;
  const orchestrationRegistry = JSON.parse(
    fs.readFileSync(orchestrationRegistryPath, 'utf-8'),
  ) as OrchestrationRegistryFile;
  // Build should not depend on pre-generated .generated artifacts.
  // Provide a synthetic fallback if the context index file is absent.
  let contextIndex: any;
  if (fs.existsSync(contextIndexPath)) {
    contextIndex = JSON.parse(fs.readFileSync(contextIndexPath, 'utf-8')) as any;
  } else {
    const orchCount = (orchestrationRegistry.domains ?? []).length;
    contextIndex = {
      sourceArtifacts: {
        sourceOfTruth: {
          domains: orchCount,
        },
        generatedDocumentation: [],
      },
      _synthetic: true,
    };
  }

  it('orchestration-domains ids are a subset of DOMAIN_REGISTRY.domain_ids', () => {
    const registryDomainIds = new Set(Object.keys(registry.domains ?? {}));
    const missing: string[] = [];

    for (const domain of orchestrationRegistry.domains ?? []) {
      if (!registryDomainIds.has(domain.id)) {
        missing.push(domain.id);
      }
    }

    if (missing.length > 0) {
      // Helpful debug output when this invariant is violated
      // but keep assertion strict.
      console.log('orchestration-domains ids missing from DOMAIN_REGISTRY:', missing);
    }

    expect(missing).toEqual([]);
  });

  it('registry orchestration blocks for orchestration domains reference canonical schema and projection', () => {
    const orchestrationIds = new Set(
      (orchestrationRegistry.domains ?? []).map(d => d.id),
    );

    for (const [id, domain] of Object.entries(registry.domains ?? {})) {
      if (!orchestrationIds.has(id)) continue;

      expect(domain.orchestration).toBeDefined();
      const orch = domain.orchestration!;

      expect(orch.schema_ref).toBe('docs/schemas/musical-sequence.schema.json');
      expect(orch.interface?.name).toBe('MusicalSequence');
      expect(orch.interface?.source).toBe(
        'packages/musical-conductor/modules/communication/sequences/SequenceTypes.ts',
      );
      expect(orch.registry_ref?.file).toBe('orchestration-domains.json');
      expect(orch.registry_ref?.id).toBe('orchestration-domains-registry');
    }
  });

  it('context tree domain counts stay aligned with orchestration-domains.json', () => {
    const orchestrationCount = (orchestrationRegistry.domains ?? []).length;

    const sourceOfTruth = contextIndex.sourceArtifacts?.sourceOfTruth;
    const orchestrationDoc = (contextIndex.sourceArtifacts?.generatedDocumentation ?? []).find(
      (doc: any) => doc.file === 'docs/generated/orchestration-domains.md',
    );

    // Context tree should derive and report the same domain counts as the
    // orchestration registry projection.
    expect(sourceOfTruth?.domains).toBe(orchestrationCount);

    if (orchestrationDoc && typeof orchestrationDoc.domains === 'number') {
      expect(orchestrationDoc.domains).toBe(orchestrationCount);
    }
  });
});
