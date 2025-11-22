# Plugin Guide

**Generated**: 2025-11-22T16:04:17.782Z

## Plugin System Overview

RenderX uses a plugin architecture with:
- **9 Plugins** total
- **7 UI Plugins** for user interface
- **6 Runtime Plugins** for orchestration

## All Plugins

### HeaderTitlePlugin
  - **UI**: @renderx-plugins/header → HeaderTitle

### HeaderControlsPlugin
  - **UI**: @renderx-plugins/header → HeaderControls

### HeaderThemePlugin
  - **UI**: @renderx-plugins/header → HeaderThemeToggle

### LibraryPlugin
  - **UI**: @renderx-plugins/library → LibraryPanel
  - **Runtime**: @renderx-plugins/library → register

### CanvasPlugin
  - **UI**: @renderx-plugins/canvas → CanvasPage
  - **Runtime**: @renderx-plugins/canvas → register

### ControlPanelPlugin
  - **UI**: @renderx-plugins/control-panel → ControlPanel
  - **Runtime**: @renderx-plugins/control-panel → register

### LibraryComponentPlugin
  - **Runtime**: @renderx-plugins/library-component → register

### CanvasComponentPlugin
  - **Runtime**: @renderx-plugins/canvas-component → register

### RealEstateAnalyzerPlugin
  - **UI**: @renderx-plugins/real-estate-analyzer → OpportunityAnalyzer
  - **Runtime**: @renderx-plugins/real-estate-analyzer → register

## Plugin Slots

Plugins mount to these slots:

- headerLeft
- headerCenter
- headerRight
- library
- canvas
- controlPanel

## Test Coverage by Plugin

### canvas
- **Handlers**: 4
- **With Tests**: 2
- **Without Tests**: 2
- **Coverage**: 50%

### canvas-component
- **Handlers**: 218
- **With Tests**: 208
- **Without Tests**: 10
- **Coverage**: 95%

### control-panel
- **Handlers**: 110
- **With Tests**: 19
- **Without Tests**: 91
- **Coverage**: 17%

### header
- **Handlers**: 8
- **With Tests**: 6
- **Without Tests**: 2
- **Coverage**: 75%

### library
- **Handlers**: 52
- **With Tests**: 21
- **Without Tests**: 31
- **Coverage**: 40%

### library-component
- **Handlers**: 23
- **With Tests**: 3
- **Without Tests**: 20
- **Coverage**: 13%

### real-estate-analyzer
- **Handlers**: 8
- **With Tests**: 2
- **Without Tests**: 6
- **Coverage**: 25%
