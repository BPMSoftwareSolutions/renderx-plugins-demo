/**
 * @fileoverview Unit tests for CODE-ANALYSIS-REPORT.md structure validation
 * @module code-analysis-report-structure.spec
 * 
 * These tests ensure all required report elements are present whenever
 * the symphonic code analysis report generator executes. The reference
 * report is renderx-web-orchestration-CODE-ANALYSIS-REPORT.md.
 * 
 * Related GitHub Issue: TBD
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Parameterized domain report paths (add new domains here)
const DOMAIN_REPORTS: { name: string; filePath: string }[] = [
  {
    name: 'renderx-web-orchestration',
    filePath: 'docs/generated/renderx-web/renderx-web-orchestration-CODE-ANALYSIS-REPORT.md'
  },
  {
    name: 'build-pipeline-orchestration',
    filePath: 'docs/generated/build-pipeline/build-pipeline-orchestration-CODE-ANALYSIS-REPORT.md'
  }
];

// Execute full structural validation for each domain's generated report
for (const { name, filePath } of DOMAIN_REPORTS) {
  describe(`CODE-ANALYSIS-REPORT.md Structure Validation (${name})`, () => {
    let reportContent: string;
    beforeAll(() => {
      const fullPath = path.join(process.cwd(), filePath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Domain report not found at: ${fullPath}`);
      }
      reportContent = fs.readFileSync(fullPath, 'utf-8');
    });

  describe('Report Header', () => {
    it('should contain report title with domain name', () => {
      expect(reportContent).toMatch(/^# .+ Code Analysis Report/m);
    });

    it('should contain Generated timestamp', () => {
      expect(reportContent).toMatch(/\*\*Generated\*\*:\s*\d{4}-\d{2}-\d{2}T/);
    });

    it('should contain Codebase identifier', () => {
      expect(reportContent).toMatch(/\*\*Codebase\*\*:\s*[\w-]+/);
    });

    it('should contain Pipeline identifier', () => {
      expect(reportContent).toMatch(/\*\*Pipeline\*\*:\s*symphonic-code-analysis-pipeline/);
    });
  });

  describe('Executive Summary', () => {
    it('should contain Executive Summary section', () => {
      expect(reportContent).toContain('## Executive Summary');
    });

    it('should contain Overall Health status', () => {
      expect(reportContent).toMatch(/### Overall Health:/);
    });

    it('should contain summary metrics table', () => {
      expect(reportContent).toMatch(/\| Metric \| Value \| Status \| Classification \|/);
    });

    it('should contain Conformity Score metric', () => {
      expect(reportContent).toMatch(/\| Conformity Score \|.*%/);
    });

    it('should contain Test Coverage metric', () => {
      expect(reportContent).toMatch(/\| Test Coverage \|.*%/);
    });

    it('should contain Maintainability metric', () => {
      expect(reportContent).toMatch(/\| Maintainability \|.*\/100/);
    });

    it('should contain Code Duplication metric', () => {
      expect(reportContent).toMatch(/\| Code Duplication \|.*%/);
    });
  });

  describe('Architecture Diagram (ASCII)', () => {
    it('should contain SYMPHONIC CODE ANALYSIS ARCHITECTURE header', () => {
      expect(reportContent).toMatch(/SYMPHONIC CODE ANALYSIS ARCHITECTURE/);
    });

    it('should contain CODEBASE METRICS FOUNDATION section', () => {
      expect(reportContent).toMatch(/CODEBASE METRICS FOUNDATION/);
    });

    it('should contain HANDLER PORTFOLIO METRICS box', () => {
      expect(reportContent).toMatch(/HANDLER PORTFOLIO METRICS/);
    });

    it('should contain COVERAGE HEATMAP BY BEAT section', () => {
      expect(reportContent).toMatch(/COVERAGE HEATMAP BY BEAT/);
    });

    it('should contain SYMPHONY ORCHESTRATION STRUCTURE section', () => {
      expect(reportContent).toMatch(/SYMPHONY ORCHESTRATION STRUCTURE/);
    });
  });

  describe('Handler Symphony Sections', () => {
    it('should contain at least one HANDLER SYMPHONY section', () => {
      expect(reportContent).toMatch(/HANDLER SYMPHONY:/);
    });

    it('should contain Domain identifier in symphony header', () => {
      expect(reportContent).toMatch(/Domain\s*:\s*[\w-]+/);
    });

    it('should contain Package identifier in symphony header', () => {
      expect(reportContent).toMatch(/Package:\s*[\w-]+/);
    });

    it('should contain Scope line with Symphony/Movement/Beat/Handler counts', () => {
      expect(reportContent).toMatch(/Scope\s*:\s*\d+\s*Symphony/);
    });

    it('should contain Health line with LOC, Coverage, Size Band, Risk', () => {
      expect(reportContent).toMatch(/Health:\s*\d+\s*LOC/);
    });

    it('should contain MOVEMENT MAP section', () => {
      expect(reportContent).toMatch(/MOVEMENT MAP/);
    });

    it('should contain BEAT / HANDLER PORTFOLIO section', () => {
      expect(reportContent).toMatch(/BEAT \/ HANDLER PORTFOLIO/);
    });

    it('should contain HANDLER PORTFOLIO METRICS summary', () => {
      expect(reportContent).toMatch(/Size Bands\s*:/);
      expect(reportContent).toMatch(/Coverage Dist\./);
      expect(reportContent).toMatch(/Risk Summary\s*:/);
    });
  });

  describe('Movement Sections', () => {
    it('should contain Movement 1: Code Discovery & Beat Mapping', () => {
      expect(reportContent).toContain('## Movement 1: Code Discovery & Beat Mapping');
    });

    it('should contain Movement 2: Code Metrics Analysis', () => {
      expect(reportContent).toContain('## Movement 2: Code Metrics Analysis');
    });

    it('should contain Movement 3: Test Coverage Analysis', () => {
      expect(reportContent).toMatch(/## Movement 3: Test Coverage Analysis/);
    });

    it('should contain Movement 4: Architecture Conformity & Reporting', () => {
      expect(reportContent).toContain('## Movement 4: Architecture Conformity & Reporting');
    });
  });

  describe('Movement 1 Content', () => {
    it('should contain Files Discovered count', () => {
      expect(reportContent).toMatch(/Files Discovered\*\*:\s*\d+/);
    });

    it('should contain Beats Completed status', () => {
      expect(reportContent).toMatch(/Beats Completed\*\*:\s*\d+\/\d+/);
    });

    it('should contain Beat Mappings list', () => {
      expect(reportContent).toMatch(/Beat Mappings/);
      expect(reportContent).toMatch(/Beat 1 \(Discovery\)/);
    });
  });

  describe('Movement 2 Content (Metrics)', () => {
    it('should contain Lines of Code section', () => {
      expect(reportContent).toContain('### Lines of Code (LOC)');
    });

    it('should contain Total LOC value', () => {
      expect(reportContent).toMatch(/Total\*\*:\s*[\d,]+/);
    });

    it('should contain Complexity Analysis section', () => {
      expect(reportContent).toContain('### Complexity Analysis');
    });

    it('should contain High/Medium/Low Complexity counts', () => {
      expect(reportContent).toMatch(/High Complexity\*\*:\s*\d+/);
      expect(reportContent).toMatch(/Medium Complexity\*\*:\s*\d+/);
      expect(reportContent).toMatch(/Low Complexity\*\*:\s*\d+/);
    });

    it('should contain Code Duplication section', () => {
      expect(reportContent).toContain('### Code Duplication');
    });

    it('should contain duplication metrics', () => {
      expect(reportContent).toMatch(/duplicated code blocks detected/);
    });

    it('should contain Maintainability Index section', () => {
      expect(reportContent).toContain('### Maintainability Index');
    });

    it('should contain Maintainability Score', () => {
      expect(reportContent).toMatch(/Score\*\*:\s*[\d.]+\/100/);
    });

    it('should contain Contributing Factors', () => {
      expect(reportContent).toContain('Contributing Factors');
      expect(reportContent).toMatch(/Test Coverage:\s*[\d.]+%/);
      expect(reportContent).toMatch(/Documentation:\s*[\d.]+%/);
    });
  });

  describe('Movement 3 Content (Coverage)', () => {
    it('should contain Coverage Metrics table', () => {
      expect(reportContent).toContain('### Coverage Metrics');
      expect(reportContent).toMatch(/\| Type \| Coverage \| Target \| Gap \| Status \|/);
    });

    it('should contain Statement coverage', () => {
      expect(reportContent).toMatch(/\| Statements \|.*%/);
    });

    it('should contain Branch coverage', () => {
      expect(reportContent).toMatch(/\| Branches \|.*%/);
    });

    it('should contain Function coverage', () => {
      expect(reportContent).toMatch(/\| Functions \|.*%/);
    });

    it('should contain Line coverage', () => {
      expect(reportContent).toMatch(/\| Lines \|.*%/);
    });

    it('should contain Beat-by-Beat Coverage section', () => {
      expect(reportContent).toContain('### Beat-by-Beat Coverage');
    });
  });

  describe('Movement 4 Content (Conformity)', () => {
    it('should contain Conformity Assessment section', () => {
      expect(reportContent).toContain('### Conformity Assessment');
    });

    it('should contain Conformity Score', () => {
      expect(reportContent).toMatch(/Conformity Score\*\*:\s*[\d.]+%/);
    });

    it('should contain Conforming Beats count', () => {
      expect(reportContent).toMatch(/Conforming Beats\*\*:\s*\d+\/\d+/);
    });

    it('should contain Violations count', () => {
      expect(reportContent).toMatch(/Violations\*\*:\s*\d+/);
    });
  });

  describe('Handler Metrics Sections', () => {
    it('should contain Handler Metrics section', () => {
      expect(reportContent).toContain('### Handler Metrics');
    });

    it('should contain Handler-to-Beat Mapping section', () => {
      expect(reportContent).toMatch(/### Handler-to-Beat Mapping/);
    });

    it('should contain Symphonic Health Score', () => {
      expect(reportContent).toMatch(/Symphonic Health Score/);
    });
  });

  describe('Risk and Refactoring', () => {
    it('should contain RISK ASSESSMENT MATRIX', () => {
      expect(reportContent).toMatch(/RISK ASSESSMENT MATRIX/);
    });

    it('should contain risk levels (CRITICAL, HIGH, MEDIUM, LOW)', () => {
      expect(reportContent).toMatch(/CRITICAL:\s*\d+/);
      expect(reportContent).toMatch(/HIGH\s*:\s*\d+/);
      expect(reportContent).toMatch(/MEDIUM\s*:\s*\d+/);
      expect(reportContent).toMatch(/LOW\s*:\s*\d+/);
    });

    it('should contain REFACTORING ROADMAP or Automated Refactor Suggestions section', () => {
      expect(reportContent).toMatch(/REFACTORING ROADMAP|Automated Refactor Suggestions/i);
    });
  });

  describe('Quality and Coverage Metrics Box', () => {
    it('should contain QUALITY & COVERAGE METRICS section', () => {
      expect(reportContent).toMatch(/QUALITY & COVERAGE METRICS/);
    });

    it('should contain Handlers Analyzed count', () => {
      expect(reportContent).toMatch(/Handlers Analyzed:\s*\d+/);
    });

    it('should contain Avg LOC/Handler', () => {
      expect(reportContent).toMatch(/Avg LOC\/Handler:\s*[\d.]+/);
    });

    it('should contain Test Coverage percentage', () => {
      expect(reportContent).toMatch(/Test Coverage:\s*[\d.]+%/);
    });

    it('should contain Duplication percentage', () => {
      expect(reportContent).toMatch(/Duplication:\s*[\d.]+%/);
    });
  });

  describe('Trend Analysis', () => {
    it('should contain Historical Trend Analysis section or trend metrics', () => {
      // Check for trend-related content
      expect(reportContent).toMatch(/Trend|Period-over-Period|Baseline/);
    });

    it('should contain baseline and projected metrics', () => {
      expect(reportContent).toMatch(/Baseline|Current State|Projected/);
    });
  });

  describe('Governance Summary', () => {
    it('should contain Movement Governance Summary section', () => {
      expect(reportContent).toContain('## Movement Governance Summary');
    });

    it('should contain governance table with Movement, Coverage, Conformity columns', () => {
      expect(reportContent).toMatch(/\| Movement \| Coverage \| Conformity \| Maintainability \| Governance \|/);
    });

    it('should contain governance status for each movement', () => {
      expect(reportContent).toMatch(/1: Discovery.*PASS|FAIL|REVIEW/);
    });
  });

  describe('CI/CD Readiness', () => {
    it('should contain CI/CD Readiness Assessment section', () => {
      expect(reportContent).toContain('## CI/CD Readiness Assessment');
    });

    it('should contain Ready for CI Gating status', () => {
      expect(reportContent).toMatch(/Ready for CI Gating\*\*:/);
    });

    it('should contain Gating Level', () => {
      expect(reportContent).toMatch(/Gating Level:\s*\*\*\w+\*\*/);
    });

    it('should contain conformity check with percentage', () => {
      expect(reportContent).toMatch(/Conformity \([\d.]+%\)/);
    });

    it('should contain coverage check with percentage', () => {
      expect(reportContent).toMatch(/Coverage.*\([\d.]+%\)/);
    });
  });

  describe('Actionable Improvements', () => {
    it('should contain Top 10 Actionable Improvements section', () => {
      expect(reportContent).toContain('## Top 10 Actionable Improvements');
    });

    it('should contain at least 5 improvement items', () => {
      const improvementMatches = reportContent.match(/### \[(HIGH|MEDIUM|LOW)\] \d+\./g);
      expect(improvementMatches).toBeTruthy();
      expect(improvementMatches!.length).toBeGreaterThanOrEqual(5);
    });

    it('should contain priority indicators [HIGH], [MEDIUM], or [LOW]', () => {
      expect(reportContent).toMatch(/\[HIGH\]/);
      expect(reportContent).toMatch(/\[MEDIUM\]|\[LOW\]/);
    });
  });

  describe('Summary and Next Steps', () => {
    it('should contain Summary & Next Steps section', () => {
      expect(reportContent).toContain('## Summary & Next Steps');
    });

    it('should contain Overall Status', () => {
      expect(reportContent).toMatch(/Overall Status\*\*:/);
    });

    it('should contain Recommended Action list', () => {
      expect(reportContent).toContain('Recommended Action');
    });
  });

  describe('Artifacts Generated', () => {
    it('should contain Artifacts Generated section', () => {
      expect(reportContent).toContain('## Artifacts Generated');
    });

    it('should list JSON Analysis artifact', () => {
      expect(reportContent).toMatch(/JSON Analysis\*\*:.*code-analysis.*\.json/);
    });

    it('should list Coverage Summary artifact', () => {
      expect(reportContent).toMatch(/Coverage Summary\*\*:.*coverage-summary.*\.json/);
    });

    it('should list Per-Beat Metrics artifact', () => {
      expect(reportContent).toMatch(/Per-Beat Metrics\*\*:.*per-beat-metrics.*\.csv/);
    });

    it('should list Trend Analysis artifact', () => {
      expect(reportContent).toMatch(/Trend Analysis\*\*:.*trends.*\.json/);
    });
  });

  describe('Report Footer', () => {
    it('should contain auto-generated disclaimer', () => {
      expect(reportContent).toMatch(/Report auto-generated from symphonic-code-analysis-pipeline/);
    });

    it('should contain metrics immutability note', () => {
      expect(reportContent).toMatch(/metrics are immutable and traceable/);
    });
  });

  describe('Legend and Terminology', () => {
    it('should contain LEGEND & DOMAIN TERMINOLOGY section', () => {
      expect(reportContent).toMatch(/LEGEND & DOMAIN TERMINOLOGY/);
    });

    it('should define Symphony term', () => {
      expect(reportContent).toMatch(/Symphony:.*grouping/i);
    });

    it('should define Sequence term', () => {
      expect(reportContent).toMatch(/Sequence:.*order|execution/i);
    });

    it('should define Handler term', () => {
      expect(reportContent).toMatch(/Handler:.*function/i);
    });

    it('should define Beat term', () => {
      expect(reportContent).toMatch(/Beat:.*stage|unit/i);
    });

    it('should define Movement term', () => {
      expect(reportContent).toMatch(/Movement:.*phase/i);
    });

    it('should define Data Baton term', () => {
      expect(reportContent).toMatch(/Data Baton/);
    });

    it('should define coverage status indicators (GREEN, YELLOW, RED)', () => {
      expect(reportContent).toMatch(/GREEN|🟢/);
      expect(reportContent).toMatch(/YELLOW|🟡/);
      expect(reportContent).toMatch(/RED|🔴/);
    });
  });

  describe('Analysis Execution Summary', () => {
    it('should contain ANALYSIS EXECUTION SUMMARY section', () => {
      expect(reportContent).toMatch(/ANALYSIS EXECUTION SUMMARY/);
    });

    it('should show Discovered files count', () => {
      expect(reportContent).toMatch(/Discovered:\s*\d+\s*source files/);
    });

    it('should show Analyzed handlers count', () => {
      expect(reportContent).toMatch(/Analyzed:\s*\d+\s*handler functions/);
    });

    it('should show NEXT ACTIONS section', () => {
      expect(reportContent).toMatch(/NEXT ACTIONS/);
    });
  });
  });
}

