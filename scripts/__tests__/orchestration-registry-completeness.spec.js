import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(__dirname, '../orchestration-domains.json');

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
      expect(domain).toMatchObject({
        id: 'safe-continuous-delivery-pipeline',
        name: 'SAFe Continuous Delivery Pipeline',
        category: 'orchestration'
      });
    });

    it('should have renderx-web orchestration registered', () => {
      const domain = registry.domains.find(d => d.id === 'renderx-web-orchestration');
      expect(domain).toBeDefined();
      expect(domain).toMatchObject({
        id: 'renderx-web-orchestration',
        name: 'RenderX Web Orchestration',
        category: 'orchestration'
      });
    });

    it('should have SLO Dashboard orchestration registered', () => {
      const domain = registry.domains.find(d => d.id === 'slo-dashboard-orchestration');
      expect(domain).toBeDefined();
      expect(domain).toMatchObject({
        id: 'slo-dashboard-orchestration',
        category: 'orchestration'
      });
    });

    it('should have build pipeline orchestration registered', () => {
      const domain = registry.domains.find(d => d.id === 'build-pipeline-orchestration');
      expect(domain).toBeDefined();
      expect(domain).toMatchObject({
        id: 'build-pipeline-orchestration',
        category: 'orchestration'
      });
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
    it('should have correct total count', () => {
      // Currently 61, should be at least 65 with required pipelines
      expect(registry.domains.length).toBeGreaterThanOrEqual(65);
    });

    it('should not have duplicate domain IDs', () => {
      const ids = registry.domains.map(d => d.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all domains should reference valid sequence files if specified', () => {
      registry.domains.forEach(domain => {
        if (domain.sequenceFile) {
          const sequencePath = path.join(__dirname, '../', domain.sequenceFile);
          // File should exist or be referenced as a valid path
          expect(domain.sequenceFile).toBeTruthy();
          expect(domain.sequenceFile).toContain('.json');
        }
      });
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

    it('should have reasonable distribution (more plugins than orchestration)', () => {
      const plugins = registry.domains.filter(d => d.category === 'plugin').length;
      const orchestrations = registry.domains.filter(d => d.category === 'orchestration').length;
      expect(plugins).toBeGreaterThan(orchestrations);
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
