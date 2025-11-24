<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: 50e5a7241bbc58bec6686a4af3124c19e25ad128ebf4acf136e92908dc893913
Generated: 2025-11-24T01:11:26.663Z
Regenerate: npm run docs:generate:governed
-->

# RenderX System Overview

**Generated**: 2025-11-24T01:11:26.343Z

## Quick Stats

| Metric | Value |
|--------|-------|
| **Plugins** | 10 |
| **UI Plugins** | 7 |
| **Runtime Plugins** | 6 |
| **Slots** | 6 |
| **Sequences** | 55 |
| **Handlers** | 90 |
| **Topics** | 100 |
| **Test Files** | 272 |
| **Total Tests** | 1830 |
| **Test Coverage** | 74% |

## Architecture Layers

### 1. Plugin System
- **9 Plugins** providing UI and runtime functionality
- **7 UI Plugins** mounted in 6 slots
- **6 Runtime Plugins** for orchestration

### 2. Orchestration Layer
- **54 Sequences** defining system behavior
- **87 Handlers** implementing business logic
- **97 Topics** for event-driven communication

### 3. Test Coverage
- **Public API**: 92% coverage (83/90 handlers)
- **Internal**: 62% coverage (82/132 handlers)

## Key Plugins

- **HeaderTitlePlugin**: 🎨 UI 
- **HeaderControlsPlugin**: 🎨 UI 
- **HeaderThemePlugin**: 🎨 UI 
- **LibraryPlugin**: 🎨 UI ⚙️ Runtime
- **CanvasPlugin**: 🎨 UI ⚙️ Runtime

## Next Steps

1. **Architecture**: See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
2. **Plugins**: See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)
3. **Orchestration**: See [ORCHESTRATION_GUIDE.md](./ORCHESTRATION_GUIDE.md)
4. **Handlers**: See [HANDLER_REFERENCE.md](./HANDLER_REFERENCE.md)
5. **Testing**: See [TEST_COVERAGE_GUIDE.md](./TEST_COVERAGE_GUIDE.md)
