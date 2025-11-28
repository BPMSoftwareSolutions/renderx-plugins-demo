/**
 * @fileoverview Tests for ASCII sketch rendering patterns
 * @module ascii-sketch-renderers.spec
 */

import { describe, it, expect } from 'vitest';
import {
  renderSymphonyArchitecture,
  renderSymphonyHandlerBreakdown,
  renderHandlerPortfolioFoundation,
  renderCoverageHeatmapByBeat,
  renderRiskAssessmentMatrix,
  renderRefactoringRoadmap,
  renderHistoricalTrendAnalysis,
  renderLegendAndTerminology,
  type SymphonyArchitecture,
  type SymphonyHandlers,
  type HandlerPortfolioFoundation,
  type BeatCoverage,
  type RiskMatrix,
  type RefactorRoadmap,
  type TrendAnalysis,
  type Legend
} from '../ascii-sketch-renderers.cjs';

describe('ASCII Sketch Renderers', () => {
  describe('renderSymphonyArchitecture', () => {
    it('should render symphony architecture diagram with domain summary', () => {
      const data: SymphonyArchitecture = {
        domainId: 'renderx-web-orchestration',
        summary: {
          symphonyCount: 3,
          handlerCount: 45,
          avgHandlersPerSymphony: 15
        },
        symphonies: [
          { id: 'create', label: 'Create Symphony', handlerCount: 20, avgCoverage: 85.5 },
          { id: 'drag', label: 'Drag Symphony', handlerCount: 15, avgCoverage: 78.2 },
          { id: 'select', label: 'Select Symphony', handlerCount: 10, avgCoverage: 92.0 }
        ]
      };

      const result = renderSymphonyArchitecture(data);

      expect(result).toContain('SYMPHONY ORCHESTRATION');
      expect(result).toContain('Domain : renderx-web-orchestration');
      expect(result).toContain('3 symphonies');
      expect(result).toContain('45 handlers');
      expect(result).toContain('• Create Symphony (20 @ 85.5%)');
      expect(result).toContain('• Drag Symphony (15 @ 78.2%)');
      expect(result).toContain('• Select Symphony (10 @ 92.0%)');
    });

    it('should handle empty symphonies array', () => {
      const data: SymphonyArchitecture = {
        domainId: 'test-domain',
        summary: {
          symphonyCount: 0,
          handlerCount: 0,
          avgHandlersPerSymphony: 0
        },
        symphonies: []
      };

      const result = renderSymphonyArchitecture(data);

      expect(result).toContain('SYMPHONY ORCHESTRATION');
      expect(result).toContain('0 symphonies');
      expect(result).toContain('0 handlers');
    });
  });

  describe('renderSymphonyHandlerBreakdown', () => {
    it('should render handler breakdown with proper alignment', () => {
      const data: SymphonyHandlers = {
        symphonyId: 'create',
        symphonyLabel: 'Create Symphony',
        handlers: [
          { name: 'resolveTemplate', loc: 120, coverage: 85.5, complexity: 5, sizeBand: 'Medium', risk: 'LOW' },
          { name: 'injectCssFallback', loc: 45, coverage: 92.0, complexity: 2, sizeBand: 'Small', risk: 'LOW' },
          { name: 'createLargeHandler', loc: 250, coverage: 45.0, complexity: 15, sizeBand: 'XL', risk: 'HIGH' }
        ]
      };

      const result = renderSymphonyHandlerBreakdown(data);

      expect(result).toContain('HANDLERS: Create Symphony');
      expect(result).toContain('Name');
      expect(result).toContain('LOC');
      expect(result).toContain('Cov');
      expect(result).toContain('Risk');
      expect(result).toContain('resolveTemplate');
      expect(result).toContain('120');
      expect(result).toContain('85');
      expect(result).toContain('LOW');
      expect(result).toContain('HIGH');
    });

    it('should truncate long handler names to fixed width', () => {
      const data: SymphonyHandlers = {
        symphonyId: 'test',
        symphonyLabel: 'Test Symphony',
        handlers: [
          { 
            name: 'thisIsAReallyLongHandlerNameThatNeedsToTruncate', 
            loc: 50, 
            coverage: 75.0, 
            complexity: 3, 
            sizeBand: 'Small', 
            risk: 'MEDIUM' 
          }
        ]
      };

      const result = renderSymphonyHandlerBreakdown(data);
      const lines = result.split('\n');
      const handlerLine = lines.find(line => line.includes('thisIsAReallyLongHandler'));
      
      expect(handlerLine).toBeDefined();
      // Name should be truncated to 24 chars
      expect(handlerLine).toMatch(/thisIsAReallyLongHandler/);
    });
  });

  describe('renderHandlerPortfolioFoundation', () => {
    it('should render portfolio metrics foundation box', () => {
      const data: HandlerPortfolioFoundation = {
        totalFiles: 777,
        totalLoc: 5045,
        handlerCount: 283,
        avgLocPerHandler: 17.83,
        coverageStatements: 76.34,
        duplicationBlocks: 561,
        maintainability: 57.72,
        conformityScore: 87.50
      };

      const result = renderHandlerPortfolioFoundation(data);

      expect(result).toContain('HANDLER PORTFOLIO METRICS');
      expect(result).toContain('Files           : 777');
      expect(result).toContain('Total LOC       : 5045');
      expect(result).toContain('Handlers        : 283');
      expect(result).toContain('Avg LOC/Handler : 17.8');
      expect(result).toContain('Coverage        : 76.3%');
      expect(result).toContain('Duplication     : 561');
      expect(result).toContain('Conformity      : 87.5%');
    });

    it('should round numeric values appropriately', () => {
      const data: HandlerPortfolioFoundation = {
        totalFiles: 100,
        totalLoc: 1000,
        handlerCount: 50,
        avgLocPerHandler: 20.12345,
        coverageStatements: 78.98765,
        duplicationBlocks: 25,
        maintainability: 65.44444,
        conformityScore: 90.11111
      };

      const result = renderHandlerPortfolioFoundation(data);

      expect(result).toContain('20.1'); // avgLocPerHandler rounded to 1 decimal
      expect(result).toContain('79.0%'); // coverage rounded to 1 decimal
      expect(result).toContain('65.4'); // maintainability rounded to 1 decimal
      expect(result).toContain('90.1%'); // conformity rounded to 1 decimal
    });
  });

  describe('renderCoverageHeatmapByBeat', () => {
    it('should render coverage heatmap with bar visualization', () => {
      const data: BeatCoverage[] = [
        { beat: 'Beat 1', movement: 'Mov. I', coverage: 85.0 },
        { beat: 'Beat 2', movement: 'Mov. I', coverage: 70.0 },
        { beat: 'Beat 3', movement: 'Mov. II', coverage: 95.0 },
        { beat: 'Beat 4', movement: 'Mov. II', coverage: 50.0 }
      ];

      const result = renderCoverageHeatmapByBeat(data);

      expect(result).toContain('COVERAGE HEATMAP BY BEAT');
      expect(result).toContain('Beat       Mov.   Cov   Bar');
      expect(result).toContain('Beat 1');
      expect(result).toContain('Mov. I');
      expect(result).toContain('85%');
      expect(result).toContain('█'); // Bar character
    });

    it('should scale bars proportionally to coverage', () => {
      const data: BeatCoverage[] = [
        { beat: 'Beat 1', movement: 'Mov. I', coverage: 100.0 },
        { beat: 'Beat 2', movement: 'Mov. I', coverage: 50.0 },
        { beat: 'Beat 3', movement: 'Mov. I', coverage: 0.0 }
      ];

      const result = renderCoverageHeatmapByBeat(data);
      const lines = result.split('\n');
      
      const beat1Line = lines.find(l => l.includes('Beat 1'));
      const beat2Line = lines.find(l => l.includes('Beat 2'));
      const beat3Line = lines.find(l => l.includes('Beat 3'));

      // 100% should have ~20 bars, 50% should have ~10 bars, 0% should have 0 bars
      const beat1Bars = (beat1Line?.match(/█/g) || []).length;
      const beat2Bars = (beat2Line?.match(/█/g) || []).length;
      const beat3Bars = (beat3Line?.match(/█/g) || []).length;

      expect(beat1Bars).toBeGreaterThan(beat2Bars);
      expect(beat2Bars).toBeGreaterThan(beat3Bars);
      expect(beat3Bars).toBe(0);
    });
  });

  describe('renderRiskAssessmentMatrix', () => {
    it('should render risk matrix with grouped items', () => {
      const data: RiskMatrix = {
        critical: ['Unhandled error in core handler', 'Security vulnerability in auth'],
        high: ['High complexity in render loop', 'Missing test coverage'],
        medium: ['Code duplication detected', 'Performance bottleneck'],
        low: ['Minor style inconsistency']
      };

      const result = renderRiskAssessmentMatrix(data);

      expect(result).toContain('RISK ASSESSMENT MATRIX');
      expect(result).toContain('CRITICAL: 2');
      expect(result).toContain('Unhandled error in core handler');
      expect(result).toContain('Security vulnerability in auth');
      expect(result).toContain('HIGH    : 2');
      expect(result).toContain('MEDIUM  : 2');
      expect(result).toContain('LOW     : 1');
    });

    it('should handle empty risk categories', () => {
      const data: RiskMatrix = {
        critical: [],
        high: ['One high risk'],
        medium: [],
        low: []
      };

      const result = renderRiskAssessmentMatrix(data);

      expect(result).toContain('CRITICAL: 0');
      expect(result).toContain('HIGH    : 1');
      expect(result).toContain('MEDIUM  : 0');
      expect(result).toContain('LOW     : 0');
    });
  });

  describe('renderRefactoringRoadmap', () => {
    it('should render refactoring roadmap with PR templates', () => {
      const data: RefactorRoadmap = [
        {
          id: 'refactor-1',
          title: 'Extract utility functions',
          target: 'src/utils/helpers.ts',
          rationale: 'Reduce duplication and improve testability',
          suggestedPrTitle: 'refactor: Extract common utility functions',
          suggestedPrBody: 'Extracts repeated logic into reusable utilities',
          effort: 'M'
        },
        {
          id: 'refactor-2',
          title: 'Split god handler',
          target: 'src/handlers/complex.ts',
          rationale: 'Handler exceeds 200 LOC with low coverage',
          effort: 'L'
        }
      ];

      const result = renderRefactoringRoadmap(data);

      expect(result).toContain('REFACTORING ROADMAP');
      expect(result).toContain('1. Extract utility functions');
      expect(result).toContain('Target : src/utils/helpers.ts');
      expect(result).toContain('Effort : M');
      expect(result).toContain('Rationale: Reduce duplication');
      expect(result).toContain('PR: refactor: Extract common utility functions');
      expect(result).toContain('2. Split god handler');
    });
  });

  describe('renderHistoricalTrendAnalysis', () => {
    it('should render trend analysis with directional indicators', () => {
      const data: TrendAnalysis = {
        periodLabel: 'Last 30 snapshots',
        baselineAt: '2025-10-28T00:00:00Z',
        current: {
          timestamp: '2025-11-28T00:00:00Z',
          handlerCount: 283,
          duplicationBlocks: 450,
          coverageAvg: 76.3,
          maintainability: 57.7,
          conformity: 87.5
        },
        previous: {
          timestamp: '2025-10-28T00:00:00Z',
          handlerCount: 250,
          duplicationBlocks: 500,
          coverageAvg: 70.0,
          maintainability: 55.0,
          conformity: 85.0
        }
      };

      const result = renderHistoricalTrendAnalysis(data);

      expect(result).toContain('HISTORICAL TREND ANALYSIS');
      expect(result).toContain('Period  : Last 30 snapshots');
      expect(result).toContain('Baseline: 2025-10-28');
      expect(result).toContain('Handlers');
      expect(result).toContain('283');
      expect(result).toContain('250');
      expect(result).toContain('↑'); // Handlers increased
      expect(result).toContain('↓'); // Duplication decreased
      expect(result).toContain('Coverage avg');
      expect(result).toContain('76.3%');
    });

    it('should handle missing previous data', () => {
      const data: TrendAnalysis = {
        periodLabel: 'Initial snapshot',
        baselineAt: '2025-11-28T00:00:00Z',
        current: {
          timestamp: '2025-11-28T00:00:00Z',
          handlerCount: 283,
          duplicationBlocks: 450,
          coverageAvg: 76.3,
          maintainability: 57.7,
          conformity: 87.5
        }
      };

      const result = renderHistoricalTrendAnalysis(data);

      expect(result).toContain('HISTORICAL TREND ANALYSIS');
      expect(result).toContain('283');
      expect(result).toContain('–'); // No trend indicator when no previous data
    });
  });

  describe('renderLegendAndTerminology', () => {
    it('should render legend with domain terminology', () => {
      const data: Legend = {
        domainId: 'renderx-web-orchestration',
        entries: [
          { term: 'Symphony', definition: 'Logical grouping of related handler functions' },
          { term: 'Sequence', definition: 'Execution order of handlers within a symphony' },
          { term: 'Movement', definition: 'Major analysis phase (Discovery, Metrics, Coverage, Conformity)' },
          { term: 'Beat', definition: 'Workflow stage within a movement' },
          { term: 'Handler', definition: 'Individual function performing specific domain logic' },
          { term: 'Data Baton', definition: 'Metrics and context passed between movements' }
        ]
      };

      const result = renderLegendAndTerminology(data);

      expect(result).toContain('LEGEND & DOMAIN TERMINOLOGY');
      expect(result).toContain('Domain: renderx-web-orchestration');
      expect(result).toContain('• Symphony: Logical grouping of related handler functions');
      expect(result).toContain('• Sequence: Execution order of handlers within a symphony');
      expect(result).toContain('• Movement: Major analysis phase');
      expect(result).toContain('• Beat: Workflow stage within a movement');
      expect(result).toContain('• Handler: Individual function performing specific domain logic');
      expect(result).toContain('• Data Baton: Metrics and context passed between movements');
    });

    it('should handle empty entries', () => {
      const data: Legend = {
        domainId: 'test-domain',
        entries: []
      };

      const result = renderLegendAndTerminology(data);

      expect(result).toContain('LEGEND & DOMAIN TERMINOLOGY');
      expect(result).toContain('Domain: test-domain');
    });
  });
});
