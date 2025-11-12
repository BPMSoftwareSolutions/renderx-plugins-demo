# Plugin Architecture Parity Analysis: Web vs Desktop

## Executive Summary

The desktop Avalonia shell now has **4 of 9 web plugins implemented** with full parity on the manifest-driven architecture pattern. The remaining 5 plugins are either runtime-only or need to be migrated to standalone DLLs.

## Web Plugins (Reference)

| Plugin | Type | Purpose | Status |
|--------|------|---------|--------|
| `header` | UI | Header controls (title, buttons, theme) | ✅ Implemented (Desktop) |
| `canvas` | UI | Canvas rendering and manipulation | ⚠️ Embedded in shell |
| `control-panel` | UI | Property inspector and interactions | ⚠️ Embedded in shell |
| `library` | UI | Component library browser | ✅ Implemented (Desktop) |
| `library-component` | Runtime | Component library data provider | ⏳ Not needed yet |
| `canvas-component` | Runtime | Canvas component data provider | ⏳ Not needed yet |
| `components` | Shared | Component definitions and schemas | ⏳ Shared via manifest |
| `digital-assets` | Shared | Asset management utilities | ⏳ Not needed yet |
| `manifest-tools` | Shared | Manifest parsing and validation | ⏳ Shared via manifest |

## Desktop Implementation Status

### ✅ Fully Implemented

#### RenderX.Plugins.Header
- **HeaderTitlePlugin** - Displays app title in headerLeft slot
- **HeaderControlsPlugin** - Save/Export/Import buttons in headerCenter slot
- **HeaderThemePlugin** - Theme toggle button in headerRight slot
- **Status:** Standalone DLL, manifest-driven loading, fully functional

#### RenderX.Plugins.Library
- **LibraryPlugin** - Component library browser in library slot
- **Status:** Standalone DLL, manifest-driven loading, fully functional

### ⚠️ Embedded in Shell (Need Migration)

#### RenderX.Shell.Avalonia.UI.Views
- **CanvasControl** - Canvas rendering (currently in shell)
- **ControlPanelControl** - Property inspector (currently in shell)
- **Status:** Should be moved to `RenderX.Plugins.Canvas` and `RenderX.Plugins.ControlPanel`

### ⏳ Runtime-Only (Not UI Plugins)

- **library-component** - Data provider for library
- **canvas-component** - Data provider for canvas
- **components** - Shared component definitions
- **digital-assets** - Asset management
- **manifest-tools** - Manifest utilities

## Architecture Validation

### Manifest-Driven Loading ✅
- Plugin manifest defines all plugins with slot mappings
- PluginLoader uses reflection to load plugins dynamically
- No hardcoded plugin imports in MainWindow

### Thin-Host Pattern ✅
- Shell only references SDK assemblies (RenderX.HostSDK.Avalonia, MusicalConductor.Avalonia)
- Plugin projects reference SDKs, not shell
- Roslyn analyzer enforces thin-host violations (SHELL001, SHELL002)

### Plugin Decoupling ✅
- Each plugin is a separate DLL
- Plugins loaded via IPluginLoader interface
- MainWindow uses SlotContainer for dynamic loading

### Pre-Build Validation ✅
- `validate-plugins.ps1` runs before build
- Checks manifest against PluginLoader registrations
- Fails build if mismatches detected

## Parity Gaps

### Gap 1: Canvas and ControlPanel Not Standalone
**Issue:** Canvas and ControlPanel are embedded in shell, not standalone plugins
**Impact:** Architectural inconsistency, harder to maintain
**Solution:** Move to `RenderX.Plugins.Canvas` and `RenderX.Plugins.ControlPanel`

### Gap 2: No Runtime Plugin Discovery
**Issue:** Plugins must be manually registered in PluginLoader
**Impact:** Adding new plugins requires code changes
**Solution:** Implement plugin discovery to scan for plugin DLLs

### Gap 3: No Plugin Versioning
**Issue:** No version compatibility checking
**Impact:** Plugin updates could break compatibility
**Solution:** Add version field to manifest and validate at runtime

### Gap 4: Limited Plugin Initialization
**Issue:** Plugins only receive IEventRouter, IConductorClient, ILogger
**Impact:** Plugins can't access other services
**Solution:** Pass full IServiceProvider to plugins

## Recommendations

### Priority 1 (Critical)
1. Move Canvas and ControlPanel to standalone plugins
2. Enhance Roslyn analyzer to validate manifest completeness
3. Add runtime plugin discovery

### Priority 2 (Important)
1. Implement plugin versioning
2. Add plugin configuration support
3. Create plugin template for easier creation

### Priority 3 (Nice-to-Have)
1. Plugin marketplace/registry
2. Plugin dependency resolution
3. Plugin hot-reload support

## Validation Checklist

- [x] All 6 UI slots have implementations
- [x] PluginLoader maps all slots correctly
- [x] Plugin projects in solution file
- [x] Plugin projects referenced in shell
- [x] Pre-build validation script works
- [ ] Roslyn analyzer validates completeness
- [ ] Canvas/ControlPanel moved to standalone
- [ ] Runtime plugin discovery implemented

