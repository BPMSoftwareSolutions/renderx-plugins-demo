<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: 8bd1d2419dd4c8dcd54e9babac55424913a86115b515ea814a4457d09f4466b5
Generated: 2025-11-24T01:11:26.660Z
Regenerate: npm run docs:generate:governed
-->

# Orchestration Guide

**Generated**: 2025-11-24T01:11:26.339Z

## Sequences Overview

- **Total Sequences**: 55
- **Total Handlers**: 90
- **Total Topics**: 100

## Sequence Structure

Each sequence has:
- **Movements**: Logical groupings of work
- **Beats**: Individual handler invocations
- **Handler Types**: pure, io, stage-crew
- **Timing**: immediate or deferred

## Sample Sequences

### Canvas Component Copy
  - Copy to Clipboard (3 beats)

### Canvas Component Create
  - Create (6 beats)

### Canvas Component Delete
  - Delete (2 beats)

### Canvas Component Delete Requested
  - Route Delete (1 beats)

### Canvas Component Deselect All
  - Deselect All (2 beats)

## Event Topics

### Public Topics

- **canvas.component.copied**: Published when a component is copied to clipboard
- **canvas.component.pasted**: Published when a component is pasted from clipboard
- **canvas.component.select.svg-node.changed**: Published when SVG node selection changes
- **control.panel.classes.updated**: Published when CSS classes are updated for a component
- **control.panel.css.registry.updated**: Published when the CSS registry is updated
- **control.panel.selection.updated**: Published when control panel selection state is updated
- **react.component.error**: Published when a React component fails to compile or render
- **react.component.mounted**: Published when a React component is successfully mounted on the canvas

## Handler Types

- **pure**: Pure functions, no side effects
- **io**: I/O operations (API calls, storage)
- **stage-crew**: DOM manipulation and rendering

## See Also

- [HANDLER_REFERENCE.md](./HANDLER_REFERENCE.md) - Handler details
