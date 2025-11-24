<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: 86fa8dd0971b0932981d5f0773907646eff179c9d2c5025e82ed25a0d168caee
Generated: 2025-11-24T01:11:26.662Z
Regenerate: npm run docs:generate:governed
-->

# System Architecture

**Generated**: 2025-11-24T01:11:26.336Z

## Architecture Overview

RenderX is a plugin-based system with orchestrated sequences and event-driven communication.

### Core Components

#### 1. Plugin System
- **Slot-based architecture**: Plugins mount to predefined slots
- **UI Plugins**: React components for user interface
- **Runtime Plugins**: Handlers for business logic
- **Manifest-driven**: All plugins defined in `plugin-manifest.json`

#### 2. Orchestration Layer
- **Sequences**: Define workflows as movements with beats
- **Handlers**: Pure functions, I/O operations, or DOM manipulation
- **Topics**: Event channels for inter-plugin communication

#### 3. Event System
- **Topic-based**: Decoupled communication via topics
- **Public Topics**: 8 documented topics
- **Plugin-scoped**: Topics organized by plugin

## Plugin Slots

| Slot | Purpose | Plugins |
|------|---------|---------|
| headerLeft | UI Component | HeaderTitlePlugin |
| headerCenter | UI Component | HeaderControlsPlugin |
| headerRight | UI Component | HeaderThemePlugin |
| library | UI Component | LibraryPlugin |
| canvas | UI Component | CanvasPlugin |
| controlPanel | UI Component | ControlPanelPlugin |
| library | UI Component | RealEstateAnalyzerPlugin |

## Sequence Architecture

- **Total Sequences**: 55
- **Total Handlers**: 90
- **Handler Types**: pure, io, stage-crew
- **Timing**: immediate, deferred, async

## Data Flow

```
User Action → Event → Topic → Sequence → Handlers → UI Update
```

## See Also

- [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) - Plugin system details
- [ORCHESTRATION_GUIDE.md](./ORCHESTRATION_GUIDE.md) - Sequence documentation
