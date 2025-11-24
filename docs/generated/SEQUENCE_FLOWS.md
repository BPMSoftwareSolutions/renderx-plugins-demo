<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: f773ac373cce5459fd67dcf8d991ea91da5108f10a0240d0fe88a78a3427b31e
Generated: 2025-11-24T01:11:26.662Z
Regenerate: npm run docs:generate:governed
-->

# Sequence Flows & Orchestration

**Generated**: 2025-11-24T01:11:26.339Z

## Overview

- **Total Sequences**: 55
- **Total Handlers**: 90
- **Total Topics**: 100

## Sequences by Plugin

### Canvas Component Copy
- **ID**: canvas-component-copy-symphony
- **Plugin**: CanvasComponentCopyPlugin
- **Movements**: 1

#### Copy to Clipboard (3 beats)
- **Beat 1**: serializeSelectedComponent (pure)
- **Beat 2**: copyToClipboard (io)
- **Beat 3**: notifyCopyComplete (pure)

### Canvas Component Create
- **ID**: canvas-component-create-symphony
- **Plugin**: CanvasComponentPlugin
- **Movements**: 1

#### Create (6 beats)
- **Beat 1**: resolveTemplate (pure)
- **Beat 2**: registerInstance (io)
- **Beat 3**: createNode (stage-crew)
- **Beat 4**: renderReact (stage-crew)
- **Beat 5**: notifyUi (pure)
- **Beat 6**: enhanceLine (stage-crew)

### Canvas Component Delete
- **ID**: canvas-component-delete-symphony
- **Plugin**: CanvasComponentDeletePlugin
- **Movements**: 1

#### Delete (2 beats)
- **Beat 1**: deleteComponent (stage-crew)
- **Beat 2**: publishDeleted (pure)

### Canvas Component Delete Requested
- **ID**: canvas-component-delete-requested-symphony
- **Plugin**: CanvasComponentDeleteRequestPlugin
- **Movements**: 1

#### Route Delete (1 beats)
- **Beat 1**: routeDeleteRequest (pure)

### Canvas Component Deselect All
- **ID**: canvas-component-deselect-all-symphony
- **Plugin**: CanvasComponentDeselectionPlugin
- **Movements**: 1

#### Deselect All (2 beats)
- **Beat 1**: hideAllOverlays (stage-crew)
- **Beat 2**: publishSelectionsCleared (pure)

### Canvas Component Deselect
- **ID**: canvas-component-deselect-symphony
- **Plugin**: CanvasComponentDeselectionPlugin
- **Movements**: 1

#### Deselect (2 beats)
- **Beat 1**: deselectComponent (stage-crew)
- **Beat 2**: publishDeselectionChanged (pure)

### Canvas Component Deselect Requested
- **ID**: canvas-component-deselect-requested-symphony
- **Plugin**: CanvasComponentDeselectionRequestPlugin
- **Movements**: 1

#### Route Deselection (1 beats)
- **Beat 1**: routeDeselectionRequest (pure)

### Canvas Component Drag End
- **ID**: canvas-component-drag-end-symphony
- **Plugin**: CanvasComponentDragEndPlugin
- **Movements**: 1

#### Drag End (1 beats)
- **Beat 1**: endDrag (stage-crew)

### Canvas Component Drag Move
- **ID**: canvas-component-drag-move-symphony
- **Plugin**: CanvasComponentDragMovePlugin
- **Movements**: 1

#### Drag Move (2 beats)
- **Beat 1**: updatePosition (stage-crew)
- **Beat 2**: forwardToControlPanel (pure)

### Canvas Component Drag Start
- **ID**: canvas-component-drag-start-symphony
- **Plugin**: CanvasComponentDragStartPlugin
- **Movements**: 1

#### Drag Start (1 beats)
- **Beat 1**: startDrag (stage-crew)


... and 45 more sequences
