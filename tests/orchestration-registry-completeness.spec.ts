import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(__dirname, '../orchestration-domains.json');
const orchestrationSequencesPath = path.join(__dirname, '../packages/orchestration/json-sequences');

interface RegistryDomain {
  id: string;
  name: string;
  category: string;
  status?: string;
  movements?: number;
  tempo?: number;
  relatedDomains?: string[];
  [key: string]: unknown;
}

interface DiscoveredSequence extends RegistryDomain {
  file: string;
}

interface Registry {
  metadata: {
    version: string;
    generated: string;
  };
  domains: RegistryDomain[];
}

describe('[BEAT:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1] [[AC:renderx-web-orchestration:renderx-web-ac-alignment-workflow-v2:1.1:1]] Orchestration Registry - Domain Completeness', () => {
  let registry: Registry;
  let discoveredSequences: DiscoveredSequence[];

  beforeEach(() => {
    const content = fs.readFileSync(registryPath, 'utf-8');
    registry = JSON.parse(content) as Registry;

    // Discover all JSON sequence files that should be registered
    discoveredSequences = [];
    if (fs.existsSync(orchestrationSequencesPath)) {
      const files = fs.readdirSync(orchestrationSequencesPath);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(orchestrationSequencesPath, file);
          try {
            const seq = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as RegistryDomain;
            if (seq.id && seq.category === 'orchestration') {
              discoveredSequences.push({
                ...seq,
                file: file
              } as DiscoveredSequence);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      });
    }
  });

  describe('All Orchestration Sequences Must Be Registered', () => {
    it('should discover orchestration sequences from filesystem', () => {
      expect(discoveredSequences.length).toBeGreaterThan(0);
    });

    it('each discovered sequence should have a registry entry', () => {
      const notRegistered: string[] = [];
      discoveredSequences.forEach(seq => {
        const registered = registry.domains.find(d => d.id === seq.id);
        if (!registered) {
          notRegistered.push(seq.id);
        }
      });
      if (notRegistered.length > 0) {
        console.log('Not registered:', notRegistered);
      }
      expect(notRegistered.length).toBe(0);
    });

    it('each discovered sequence should match its registry entry', () => {
      discoveredSequences.forEach(seq => {
        const registered = registry.domains.find(d => d.id === seq.id);
        if (registered) {
          expect(registered.name).toBe(seq.name);
          expect(registered.category).toBe('orchestration');
        }
      });
    });
  });

  describe('All Registered Domains Must Conform to MusicalSequence', () => {
    it('all domains should have required MusicalSequence fields', () => {
      const requiredFields = ['id', 'name', 'category'];
      
      registry.domains.forEach(domain => {
        requiredFields.forEach(field => {
          expect(domain).toHaveProperty(field);
        });
      });
    });

    it('domains should have status field with valid value', () => {
      registry.domains.forEach(domain => {
        expect(domain).toHaveProperty('status');
        expect(['active', 'planned', 'deprecated', 'experimental']).toContain(domain.status);
      });
    });
  });

  describe('Registry Integrity', () => {
    it('should not have duplicate domain IDs', () => {
      const ids = registry.domains.map(d => d.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have metadata with version and generated timestamp', () => {
      expect(registry.metadata).toBeDefined();
      expect(registry.metadata.version).toBeTruthy();
      expect(registry.metadata.generated).toBeTruthy();
    });

    it('orchestration sequences in registry >= discovered sequences', () => {
      const orchestrationInRegistry = registry.domains.filter(d => d.category === 'orchestration').length;
      const orchestrationDiscovered = discoveredSequences.length;
      expect(orchestrationInRegistry).toBeGreaterThanOrEqual(orchestrationDiscovered);
    });
  });

  describe('Category Distribution', () => {
    it('should have both plugin and orchestration categories', () => {
      const categories = new Set(registry.domains.map(d => d.category));
      expect(categories.has('plugin')).toBe(true);
      expect(categories.has('orchestration')).toBe(true);
    });
  });

  describe('Domain Relationships', () => {
    it('domains can only reference existing domains', () => {
      const allIds = new Set(registry.domains.map(d => d.id));
      registry.domains.forEach(domain => {
        if (domain.relatedDomains && Array.isArray(domain.relatedDomains)) {
          domain.relatedDomains.forEach(relatedId => {
            expect(allIds.has(relatedId)).toBe(true);
          });
        }
      });
    });
  });
});
