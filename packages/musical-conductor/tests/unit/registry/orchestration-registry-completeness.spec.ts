import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(__dirname, '../../../../orchestration-domains.json');

describe('Orchestration Registry - Domain Completeness', () => {
  let registry;

  beforeEach(() => {
    const content = fs.readFileSync(registryPath, 'utf-8');
    registry = JSON.parse(content);
  });

  describe('Required Pipelines Must Be Registered', () => {
    it('should have SAFe Continuous Delivery Pipeline registered', () => {
      const domain = registry.domains.find(d => d.id === 'safe-continuous-delivery-pipeline');
      expect(domain).toBeDefined();
      if (domain) {
        expect(domain.name).toBeDefined();
        expect(domain.category).toBe('orchestration');
      }
    });

    it('should have renderx-web orchestration registered', () => {
      const domain = registry.domains.find(d => d.id === 'renderx-web-orchestration');
      expect(domain).toBeDefined();
      if (domain) {
        expect(domain.category).toBe('orchestration');
      }
    });

    it('should have SLO Dashboard orchestration registered', () => {
      const domain = registry.domains.find(d => d.id === 'slo-dashboard-orchestration');
      expect(domain).toBeDefined();
      if (domain) {
        expect(domain.category).toBe('orchestration');
      }
    });

    it('should have build pipeline orchestration registered', () => {
      const domain = registry.domains.find(d => d.id === 'build-pipeline-orchestration');
      expect(domain).toBeDefined();
      if (domain) {
        expect(domain.category).toBe('orchestration');
      }
    });
  });

  describe('All Registered Domains Must Conform to MusicalSequence', () => {
    it('all domains should have MusicalSequence fields', () => {
      const requiredFields = ['id', 'name', 'category'];
      
      registry.domains.forEach(domain => {
        requiredFields.forEach(field => {
          expect(domain).toHaveProperty(field);
        });
      });
    });

    it('domains should have movements structure', () => {
      registry.domains.forEach(domain => {
        if (domain.movements) {
          expect(typeof domain.movements).toBe('number');
          expect(domain.movements).toBeGreaterThan(0);
        }
      });
    });

    it('domains should have tempo defined', () => {
      registry.domains.forEach(domain => {
        if (domain.tempo) {
          expect(typeof domain.tempo).toBe('number');
          expect(domain.tempo).toBeGreaterThan(0);
          expect(domain.tempo).toBeLessThan(500);
        }
      });
    });

    it('domains should have status field', () => {
      registry.domains.forEach(domain => {
        expect(domain).toHaveProperty('status');
        expect(['active', 'planned', 'deprecated']).toContain(domain.status);
      });
    });
  });

  describe('Registry Integrity', () => {
    it('should have at least 65 domains (currently 61, need 4 more)', () => {
      expect(registry.domains.length).toBeGreaterThanOrEqual(65);
    });

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
  });

  describe('Category Distribution', () => {
    it('should have both plugin and orchestration categories', () => {
      const categories = new Set(registry.domains.map(d => d.category));
      expect(categories.has('plugin')).toBe(true);
      expect(categories.has('orchestration')).toBe(true);
    });
  });

  describe('Domain Relationships', () => {
    it('domains can reference related domains', () => {
      registry.domains.forEach(domain => {
        if (domain.relatedDomains) {
          expect(Array.isArray(domain.relatedDomains)).toBe(true);
          domain.relatedDomains.forEach(relatedId => {
            const relatedDomain = registry.domains.find(d => d.id === relatedId);
            expect(relatedDomain).toBeDefined();
          });
        }
      });
    });
  });
});
