import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(__dirname, '../../orchestration-domains.json');

describe('Orchestration Registry - Domain Completeness', () => {
  let registry: any;

  beforeEach(() => {
    const content = fs.readFileSync(registryPath, 'utf-8');
    registry = JSON.parse(content);
  });

  describe('Required Pipelines Must Be Registered', () => {
    it('should have SAFe Continuous Delivery Pipeline registered', () => {
      const domain = registry.domains.find((d: any) => d.id === 'safe-continuous-delivery-pipeline');
      expect(domain).toBeDefined();
      expect(domain).toMatchObject({
        id: 'safe-continuous-delivery-pipeline',
        name: 'SAFe Continuous Delivery Pipeline',
        category: 'orchestration',
      });
    });

    it('should have renderx-web orchestration registered', () => {
      const domain = registry.domains.find((d: any) => d.id === 'renderx-web-orchestration');
      expect(domain).toBeDefined();
      expect(domain).toMatchObject({
        id: 'renderx-web-orchestration',
        name: 'RenderX Web Orchestration',
        category: 'orchestration',
      });
    });

    it('should have fractal orchestration domain symphony registered', () => {
      const domain = registry.domains.find(
        (d: any) => d.id === 'fractal-orchestration-domain-symphony',
      );

      expect(domain).toBeDefined();
      expect(domain).toMatchObject({
        id: 'fractal-orchestration-domain-symphony',
        category: 'orchestration',
        status: 'experimental',
      });
      expect(domain.sequenceFile).toBe(
        'packages/orchestration/json-sequences/fractal-orchestration-domain-symphony.json',
      );
    });
  });

  describe('All Registered Domains Must Conform to MusicalSequence', () => {
    it('all domains should have MusicalSequence fields', () => {
      const requiredFields = ['id', 'name', 'category'];

      registry.domains.forEach((domain: any) => {
        requiredFields.forEach(field => {
          expect(domain).toHaveProperty(field);
        });
      });
    });

    it('domains should have movements structure', () => {
      registry.domains.forEach((domain: any) => {
        if (domain.movements) {
          expect(typeof domain.movements).toBe('number');
          expect(domain.movements).toBeGreaterThan(0);
        }
      });
    });

    it('domains should have tempo defined', () => {
      registry.domains.forEach((domain: any) => {
        if (domain.tempo) {
          expect(typeof domain.tempo).toBe('number');
          expect(domain.tempo).toBeGreaterThan(0);
          expect(domain.tempo).toBeLessThan(500);
        }
      });
    });

    it('domains should have status field', () => {
      registry.domains.forEach((domain: any) => {
        expect(domain).toHaveProperty('status');
        expect(['active', 'planned', 'deprecated', 'experimental']).toContain(domain.status);
      });
    });
  });
});

