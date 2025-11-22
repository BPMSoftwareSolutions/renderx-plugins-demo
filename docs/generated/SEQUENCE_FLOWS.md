# Sequence Flows & Orchestration

**Generated**: 2025-11-22T17:06:31.310Z

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
