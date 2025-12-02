# AC-to-Test Alignment — Implementation Summary

**Date:** 2025-12-01
**Issue:** [#420](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/420)
**Status:** ✅ Phase 1 Complete (Ready for Adoption)

---

## Overview

The AC-to-Test Alignment system has been successfully implemented for the `renderx-web-orchestration` domain. This system enables measurable traceability between structured acceptance criteria (GWT) and automated tests, with integrated reporting in the symphonic code analysis pipeline.

## Implemented Components

### 1. AC Registry Generator
**File:** [scripts/generate-ac-registry.cjs](../scripts/generate-ac-registry.cjs)

- Extracts all ACs from `acceptanceCriteriaStructured` fields across sequence JSON files
- Generates normalized AC registry with stable AC IDs
- Format: `<domain>:<sequence>:<beat>:<acIndex>`
- Output: `.generated/acs/<domain>.registry.json`

**Current Status:**
- ✅ 115 ACs extracted from `renderx-web-orchestration`
- ✅ 1 sequence, 23 beats registered

### 2. Test Tagging Guide
**File:** [docs/TEST_TAGGING_GUIDE.md](./TEST_TAGGING_GUIDE.md)

Comprehensive guide for developers covering:
- Tag format and conventions
- Examples for Vitest/Jest and Cypress
- Best practices and FAQ
- Helper function patterns

**Tag Formats:**
- Full AC: `[AC:domain:sequence:beat:acIndex]`
- Beat-level: `[BEAT:domain:sequence:beat]`

### 3. Test Result Collector
**File:** [scripts/ac-alignment/collect-test-results.cjs](../scripts/ac-alignment/collect-test-results.cjs)

- Parses Vitest/Jest JSON reporter output
- Parses Cypress Mocha JSON reporter output
- Extracts AC and BEAT tags from test titles
- Output: `.generated/ac-alignment/results/collected-results.json`

### 4. Alignment Computation Engine
**File:** [scripts/ac-alignment/compute-alignment.cjs](../scripts/ac-alignment/compute-alignment.cjs)

**Phase 1: Presence-Based Coverage**
- Correlates AC tags from tests with AC registry
- Computes per-AC, per-beat, per-sequence coverage
- Identifies covered vs. uncovered ACs

**Phase 2: THEN-to-Assertion Heuristics**
- Extracts assertion type hints from THEN clauses
- Provides confidence scores for alignment depth
- Supports optional assertion markers (future enhancement)

**Output:**
- `.generated/ac-alignment/coverage.presence.json`
- `.generated/ac-alignment/coverage.then.json`
- `.generated/ac-alignment/summary.json`

### 5. Report Formatter
**File:** [scripts/ac-alignment/format-alignment-report.cjs](../scripts/ac-alignment/format-alignment-report.cjs)

Generates Markdown reports with:
- Summary table with coverage thresholds
- Sequence-level coverage breakdown
- Beat-level coverage (sorted by lowest coverage first)
- Uncovered ACs list
- Top covered ACs (optional)

**Output:**
- `docs/generated/<domain>/ac-alignment-report.md`

### 6. Unified Workflow Script
**File:** [scripts/validate-ac-alignment.cjs](../scripts/validate-ac-alignment.cjs)

Single command to run the complete workflow:
1. Generate AC registry
2. Collect test results
3. Compute alignment (both phases)
4. Format reports

**Exit Codes:**
- `0` - Coverage ≥50%
- `1` - Coverage <50% (critical threshold)

### 7. Example Test Tags
**Files:**
- [tests/react-component-theme-toggle.spec.ts](../tests/react-component-theme-toggle.spec.ts)
- [tests/select.overlay.dom.spec.ts](../tests/select.overlay.dom.spec.ts)

Demonstrates proper tag usage in both describe blocks and test cases.

---

## Current Metrics

### Domain: renderx-web-orchestration

| Metric | Value |
|--------|-------|
| Total ACs | 115 |
| Sequences | 1 |
| Beats | 23 |
| Average AC Coverage | 0% (baseline - tags being adopted) |
| Covered ACs | 0 / 115 |
| Tests with AC Tags | 0 (2 examples added) |

**Note:** 0% coverage is expected at this stage. As tests are tagged, coverage will increase.

---

## Usage

### Quick Start

```bash
# Generate AC registry and run alignment
ANALYSIS_DOMAIN_ID=renderx-web-orchestration node scripts/validate-ac-alignment.cjs

# Or with domain flag
node scripts/validate-ac-alignment.cjs --domain renderx-web-orchestration
```

### Individual Steps

```bash
# Step 1: Generate AC registry
ANALYSIS_DOMAIN_ID=renderx-web-orchestration node scripts/generate-ac-registry.cjs

# Step 2: Collect test results (after running tests with JSON reporter)
node scripts/ac-alignment/collect-test-results.cjs --all

# Step 3: Compute alignment
node scripts/ac-alignment/compute-alignment.cjs

# Step 4: Format report
node scripts/ac-alignment/format-alignment-report.cjs
```

### View Reports

- **Full Report:** `docs/generated/renderx-web-orchestration/ac-alignment-report.md`
- **Summary Data:** `.generated/ac-alignment/summary.json`
- **AC Registry:** `.generated/acs/renderx-web-orchestration.registry.json`

---

## Integration with Symphonic Analysis

The AC alignment summary can be integrated into the main symphonic code analysis report by importing:

```javascript
const {
  getAlignmentSummary,
  formatAlignmentSectionForAnalysisReport
} = require('./validate-ac-alignment.cjs');

// Get summary data
const summary = getAlignmentSummary(domainId);

// Get formatted section for report
const alignmentSection = formatAlignmentSectionForAnalysisReport(domainId);
```

---

## Coverage Thresholds

| Threshold | Status | Action |
|-----------|--------|--------|
| ≥70% | ✅ Good | Maintain and improve |
| 40-69% | ⚠️ Partial | Tag more tests |
| <40% | ❌ Poor | Urgent action required |
| <50% | 🚨 Critical | CI failure (optional gate) |

---

## Next Steps

### Immediate (Week 1)

1. **Tag Existing Tests**
   - Review existing tests in key symphonies (Create, Select, UI, Export)
   - Add AC/BEAT tags to test titles
   - Target: 30%+ coverage

2. **CI Integration**
   - Add `validate-ac-alignment` to CI pipeline
   - Set warning threshold at 70%
   - Optional: Set failure threshold at 50% for critical beats

3. **Developer Onboarding**
   - Share Test Tagging Guide with team
   - Conduct workshop/demo session
   - Add pre-commit hook to validate tag format

### Short-term (Weeks 2-4)

4. **Expand Coverage**
   - Create new tests for uncovered ACs
   - Focus on high-priority sequences
   - Target: 70%+ coverage

5. **Test Result Integration**
   - Configure Vitest/Jest JSON reporter
   - Configure Cypress JSON reporter
   - Automate result collection in CI

6. **Phase 2 Enhancements**
   - Implement assertion marker parsing
   - Add THEN-to-assertion confidence scoring
   - Generate actionable test recommendations

### Long-term (Months 2-3)

7. **Rollout to Other Domains**
   - Extend to additional domains beyond renderx-web-orchestration
   - Establish domain-specific coverage targets
   - Cross-domain coverage dashboard

8. **Advanced Features**
   - AST-based assertion detection
   - Runtime coverage instrumentation
   - AI-assisted test generation for uncovered ACs

---

## File Structure

```
.
├── docs/
Active Workflows: 
- `packages/orchestration/json-sequences/ac-to-test-alignment.workflow.v2.json`
- `packages/orchestration/json-sequences/ac-to-test-alignment.workflow.v3.json` (adds analysis beats: test discovery, canonical count, quality diff, projection)
│   ├── TEST_TAGGING_GUIDE.md                    ← Developer guide
Outputs: Registry, test analysis, canonical count, quality-diff report, projection summary, tag suggestions, dry-run patches, AC alignment report.
│   ├── ISSUE_DRAFT_AC_TO_TEST_ALIGNMENT.md      ← GitHub issue draft
│   └── generated/
│       └── renderx-web-orchestration/
│           └── ac-alignment-report.md           ← Generated report
├── scripts/
│   ├── generate-ac-registry.cjs                 ← AC registry generator
│   ├── validate-ac-alignment.cjs                ← Unified workflow
│   └── ac-alignment/
│       ├── collect-test-results.cjs             ← Test collector
│       ├── compute-alignment.cjs                ← Alignment engine
│       └── format-alignment-report.cjs          ← Report formatter
├── .generated/
│   ├── acs/
│   │   └── renderx-web-orchestration.registry.json
│   └── ac-alignment/
│       ├── results/
│       │   └── collected-results.json
│       ├── coverage.presence.json
│       ├── coverage.then.json
│       └── summary.json
└── tests/
    ├── react-component-theme-toggle.spec.ts     ← Example tags
    └── select.overlay.dom.spec.ts               ← Example tags
```

---

## Dependencies

- Node.js 18+
- Existing test infrastructure (Vitest/Jest or Cypress)
- JSON reporter configuration (for test result collection)

**No new external dependencies required.** All scripts use Node.js built-ins.

---

## Known Limitations

1. **Test Results:** Manual collection required until CI integration complete
2. **Tag Validation:** No pre-commit hook yet to validate tag format
3. **Phase 2:** THEN heuristics are simplified; AST parsing not yet implemented
4. **Multi-domain:** Currently focused on renderx-web-orchestration

---

## Success Criteria (DoD)

- [x] AC registry generation working
- [x] Test tagging guide published
- [x] Alignment computation functional
- [x] Report generation complete
- [x] Example tags added to tests
- [ ] Average AC coverage ≥70% (in progress)
- [ ] Beats with tests ≥80% (in progress)
- [ ] CI integration active (pending)

---

## Support & Feedback

- **GitHub Issue:** [#420](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/420)
- **Documentation:** [TEST_TAGGING_GUIDE.md](./TEST_TAGGING_GUIDE.md)
- **Workflow Sequence:** `packages/orchestration/json-sequences/ac-to-test-alignment.workflow.v2.json`

---

**Generated:** 2025-12-01
**Version:** 1.0.0 (Phase 1 Complete)
