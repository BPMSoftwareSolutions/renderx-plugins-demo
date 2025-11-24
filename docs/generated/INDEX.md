<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: 3acac4c11e86fb33783cf6c8508c6048cb5e0db29efb0674de5a71d8045e327d
Generated: 2025-11-24T01:11:26.660Z
Regenerate: npm run docs:generate:governed
-->

# System Documentation Index

**Generated**: 2025-11-24T01:11:26.336Z

## 📊 System Overview

| Metric | Value |
|--------|-------|
| **Plugins** | 10 |
| **Sequences** | 55 |
| **Handlers** | 423 |
| **Test Files** | 272 |
| **Total Tests** | 1830 |
| **Test Coverage** | 74% |
| **Handlers with Tests** | 165 |
| **Handlers without Tests** | 57 |

## 📚 Documentation Files

### 1. [HANDLER_SPECS.md](./HANDLER_SPECS.md)
Complete handler specifications with test coverage details.
- All 423 handlers listed
- Test files and test descriptions for each handler
- Function parameters and async status
- **Use this to**: Find what a handler does and what tests cover it

### 2. [SEQUENCE_FLOWS.md](./SEQUENCE_FLOWS.md)
Orchestration sequences and their handler flows.
- All 55 sequences documented
- Handler beats and timing information
- Event flow and handler kinds (pure, io, stage-crew)
- **Use this to**: Understand how sequences orchestrate handlers

### 3. [TEST_SPECS.md](./TEST_SPECS.md)
Complete test specifications organized by plugin.
- 272 test files
- 1830 test descriptions
- Test organization by plugin and feature
- **Use this to**: Find tests for a specific feature or plugin

### 4. [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md)
Complete handler-to-test mapping with all test descriptions.
- Every handler with tests listed
- All test descriptions that cover each handler
- Full traceability from handler to test
- **Use this to**: Trace a handler to all its tests

### 5. [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md)
Test coverage analysis by plugin.
- Coverage percentage per plugin
- Handler count and test count per plugin
- **Use this to**: Identify which plugins need more tests

### 6. [UNTESTED_HANDLERS.md](./UNTESTED_HANDLERS.md)
Handlers that need test coverage.
- 57 handlers without tests
- Function signatures and parameters
- Organized by plugin
- **Use this to**: Find handlers that need tests

## 🎯 Quick Navigation

### By Task

**I want to understand a handler:**
1. Search in [HANDLER_SPECS.md](./HANDLER_SPECS.md)
2. Check [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md) for tests

**I want to understand a sequence:**
1. Look in [SEQUENCE_FLOWS.md](./SEQUENCE_FLOWS.md)
2. Check [TEST_SPECS.md](./TEST_SPECS.md) for related tests

**I want to find tests for a feature:**
1. Search in [TEST_SPECS.md](./TEST_SPECS.md)
2. Check [HANDLER_TRACEABILITY.md](./HANDLER_TRACEABILITY.md) for handler coverage

**I want to improve test coverage:**
1. Check [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md) for coverage by plugin
2. Review [UNTESTED_HANDLERS.md](./UNTESTED_HANDLERS.md) for priority handlers

## 📈 Coverage Summary

### By Handler Type
- **Sequence-Defined Handlers**: 90 (92% coverage)
- **Internal Implementation**: 132 (62% coverage)

### By Plugin
See [PLUGIN_COVERAGE.md](./PLUGIN_COVERAGE.md) for detailed breakdown.

## 🔍 Data Quality

This documentation is **automatically generated** from:
- ✅ Actual test files and test descriptions
- ✅ Handler implementations and signatures
- ✅ Sequence definitions and orchestration flows
- ✅ Comprehensive audit data

**Everything is traceable to source code.**

---

*Last updated: 2025-11-24T01:11:26.336Z*
