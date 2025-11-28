/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';

// We'll need to use dynamic import or require since this is a .cjs file
const { generateDiagram } = require('../generate-architecture-diagram.cjs');

describe('generateDiagram - Data-Driven Architecture Diagram', () => {
  describe('RED: Failing tests first', () => {
    it('should generate diagram with actual build-pipeline-symphony metrics', () => {
      const metrics = {
        totalFiles: 17,
        totalLoc: 1164,
        totalHandlers: 38,
        avgLocPerHandler: 30.63,
        overallCoverage: 84.3,
        domainId: 'build-pipeline-symphony',
        handlerSummary: null,
        duplicateBlocks: 141,
        duplicationPercent: 14.1,
        godHandlers: []
      };

      const diagram = generateDiagram(metrics);

      // Assert: Domain title should be data-driven
      expect(diagram).toContain('BUILD PIPELINE SYMPHONY');
      expect(diagram).not.toContain('RENDERX');
      expect(diagram).not.toContain('CANVAS COMPONENT');

      // Assert: Metrics should be from actual data
      expect(diagram).toContain('Total Files: 17');
      expect(diagram).toContain('Total LOC: 1164');
      expect(diagram).toContain('Handlers: 38');
      expect(diagram).toContain('Avg LOC/Handler: 30.63');
      expect(diagram).toContain('Coverage: 84.3%');
      expect(diagram).toContain('Duplication: 14.1%');

      // Assert: Should show correct summary section
      expect(diagram).toContain('BUILD PIPELINE SYMPHONY STRUCTURE');
      expect(diagram).toContain('(Analyzed: 38 handlers)');
      expect(diagram).toContain('✓  No God Handlers');

      // Assert: Should NOT contain hardcoded handler names
      expect(diagram).not.toContain('serializeComponent');
      expect(diagram).not.toContain('createNode');
      expect(diagram).not.toContain('copyToClipboard');
      expect(diagram).not.toContain('Copy Symphony');
      expect(diagram).not.toContain('Drag Symphony');
    });

    it('should handle renderx-web domain with different metrics', () => {
      const metrics = {
        totalFiles: 769,
        totalLoc: 4320,
        totalHandlers: 147,
        avgLocPerHandler: 29.33,
        overallCoverage: 79.29,
        domainId: 'renderx-web',
        handlerSummary: null,
        duplicateBlocks: 561,
        duplicationPercent: 78.3,
        godHandlers: [{ name: 'createNode', loc: 156 }]
      };

      const diagram = generateDiagram(metrics);

      // Assert: Domain title should match input
      expect(diagram).toContain('RENDERX WEB');
      expect(diagram).not.toContain('BUILD PIPELINE');

      // Assert: Metrics should match input
      expect(diagram).toContain('Total Files: 769');
      expect(diagram).toContain('Total LOC: 4320');
      expect(diagram).toContain('Handlers: 147');
      expect(diagram).toContain('Avg LOC/Handler: 29.33');
      expect(diagram).toContain('Coverage: 79.3%');
      expect(diagram).toContain('Duplication: 78.3%');

      // Assert: Should show god handler warning
      expect(diagram).toContain('⚠️  God Handlers: 1');
      expect(diagram).toContain('(Analyzed: 147 handlers)');
    });

    it('should handle zero handlers gracefully', () => {
      const metrics = {
        totalFiles: 0,
        totalLoc: 0,
        totalHandlers: 0,
        avgLocPerHandler: 0,
        overallCoverage: 0,
        domainId: 'empty-project',
        handlerSummary: null,
        duplicateBlocks: 0,
        duplicationPercent: 0,
        godHandlers: []
      };

      const diagram = generateDiagram(metrics);

      // Assert: Should handle zeros without errors
      expect(diagram).toContain('EMPTY PROJECT');
      expect(diagram).toContain('Total Files: 0');
      expect(diagram).toContain('Handlers: 0');
      expect(diagram).toContain('Avg LOC/Handler: 0.00');
      expect(diagram).toContain('Coverage: 0.0%');
      expect(diagram).toContain('Duplication: 0.0%');
    });

    it('should handle string values for numeric metrics', () => {
      const metrics = {
        totalFiles: 17,
        totalLoc: 1164,
        totalHandlers: 38,
        avgLocPerHandler: '30.63', // String instead of number
        overallCoverage: '84.3',  // String instead of number
        domainId: 'string-test',
        handlerSummary: null,
        duplicateBlocks: 141,
        duplicationPercent: '14.1', // String instead of number
        godHandlers: []
      };

      const diagram = generateDiagram(metrics);

      // Assert: Should convert strings to numbers and format correctly
      expect(diagram).toContain('Avg LOC/Handler: 30.63');
      expect(diagram).toContain('Coverage: 84.3%');
      expect(diagram).toContain('Duplication: 14.1%');
    });

    it('should use default values when metrics are missing', () => {
      const diagram = generateDiagram({});

      // Assert: Should use defaults without crashing
      expect(diagram).toContain('UNKNOWN DOMAIN');
      expect(diagram).toContain('Total Files: 0');
      expect(diagram).toContain('Handlers: 0');
      expect(diagram).toContain('✓  No God Handlers');
    });

    it('should handle empty array handlerSummary correctly', () => {
      const metrics = {
        totalFiles: 17,
        totalLoc: 1164,
        totalHandlers: 38,
        avgLocPerHandler: 30.63,
        overallCoverage: 84.3,
        domainId: 'build-pipeline-symphony',
        handlerSummary: [], // Empty array should be treated as null
        duplicateBlocks: 141,
        duplicationPercent: 14.1,
        godHandlers: []
      };

      const diagram = generateDiagram(metrics);

      // Assert: Should use generic summary, not try to process empty array
      expect(diagram).toContain('BUILD PIPELINE SYMPHONY STRUCTURE');
      expect(diagram).toContain('(Analyzed: 38 handlers)');
      expect(diagram).not.toContain('UNKNOWN DOMAIN');
    });
  });

  describe('Integration with actual metrics', () => {
    it('should match the pattern used in analyze-symphonic-code.cjs', () => {
      // Simulate the actual call from analyze-symphonic-code.cjs
      const mockMetrics = {
        discoveredFiles: 17,
        discoveredCount: 38,
        loc: { totalLoc: 1164 },
        coverage: { statements: 78.02 },
        duplication: { duplicateBlocks: 141, duplicationPercent: 14.1 },
        refactoring: { godHandlers: [] }
      };

      // Transform like the actual code does
      const diagramParams = {
        totalFiles: mockMetrics.discoveredFiles || 0,
        totalLoc: mockMetrics.loc?.totalLoc || 0,
        totalHandlers: mockMetrics.discoveredCount || 0,
        avgLocPerHandler: (mockMetrics.discoveredCount > 0 && mockMetrics.loc?.totalLoc) 
          ? (mockMetrics.loc.totalLoc / mockMetrics.discoveredCount) 
          : 0,
        overallCoverage: mockMetrics.coverage?.statements || 0,
        domainId: 'build-pipeline-symphony',
        handlerSummary: [],
        duplicateBlocks: mockMetrics.duplication?.duplicateBlocks || 0,
        duplicationPercent: mockMetrics.duplication?.duplicationPercent || 0,
        godHandlers: mockMetrics.refactoring?.godHandlers || []
      };

      const diagram = generateDiagram(diagramParams);

      // Assert: Should generate valid diagram
      expect(diagram).toBeTruthy();
      expect(diagram.length).toBeGreaterThan(100);
      expect(diagram).toContain('BUILD PIPELINE SYMPHONY');
      expect(diagram).toContain('Total Files: 17');
      expect(diagram).toContain('Handlers: 38');
    });
  });
});
