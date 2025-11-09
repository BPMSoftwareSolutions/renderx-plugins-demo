# ADR-0020: Plugin Architecture Validation and Completeness

**Status:** Accepted  
**Date:** 2025-11-08  
**Context:** Desktop Avalonia shell requires manifest-driven plugin loading with validation to ensure all plugins in the manifest have corresponding implementations.

## Problem

The desktop shell uses a manifest-driven plugin architecture similar to the web version, but there was no validation to ensure:
1. All plugins defined in `plugin-manifest.json` have actual implementations
2. All plugins are registered in `PluginLoader.cs`
3. All plugin DLLs are referenced in the shell project
4. Plugin implementations match the manifest specifications

This could lead to runtime failures if a plugin is defined in the manifest but not implemented.

## Solution

Implement a three-layer validation system:

### Layer 1: Pre-Build Validation (PowerShell Script)
- **File:** `src/RenderX.Shell.Avalonia/validate-plugins.ps1`
- **Trigger:** MSBuild pre-build target
- **Checks:**
  - Manifest file exists and is valid JSON
  - Each plugin with a UI slot is registered in PluginLoader
  - Plugin assemblies exist in build output

### Layer 2: Roslyn Analyzer (SHELL003)
- **File:** `src/RenderX.Shell.Avalonia.Analyzers/ThinHostArchitectureAnalyzer.cs`
- **Rule ID:** SHELL003
- **Checks:**
  - PluginLoader contains all slots from manifest
  - No orphaned plugin implementations exist
  - Plugin type names match manifest exports

### Layer 3: Runtime Validation
- **File:** `src/RenderX.Shell.Avalonia/Infrastructure/Plugins/PluginLoader.cs`
- **Checks:**
  - Plugin types can be loaded via reflection
  - Plugin controls implement required interfaces
  - Plugin initialization succeeds

## Plugin Architecture

### Web Version (Reference)
```
packages/
├── header/           (TypeScript/React)
├── canvas/           (TypeScript/React)
├── control-panel/    (TypeScript/React)
├── library/          (TypeScript/React)
├── library-component/ (runtime-only)
├── canvas-component/ (runtime-only)
├── components/       (shared)
├── digital-assets/   (shared)
└── manifest-tools/   (shared)
```

### Desktop Version (Parity Target)
```
src/
├── RenderX.Plugins.Header/      (Avalonia)
│   ├── HeaderTitlePlugin
│   ├── HeaderControlsPlugin
│   └── HeaderThemePlugin
├── RenderX.Plugins.Library/     (Avalonia)
│   └── LibraryPlugin
├── RenderX.Plugins.Canvas/      (Avalonia - TODO)
│   └── CanvasPlugin
├── RenderX.Plugins.ControlPanel/ (Avalonia - TODO)
│   └── ControlPanelPlugin
└── RenderX.Shell.Avalonia/      (Thin host)
    ├── Infrastructure/Plugins/PluginLoader.cs
    └── validate-plugins.ps1
```

## Manifest Structure

```json
{
  "plugins": [
    {
      "id": "HeaderTitlePlugin",
      "ui": {
        "slot": "headerLeft",
        "module": "RenderX.Plugins.Header.dll",
        "export": "HeaderTitlePlugin"
      }
    }
  ]
}
```

## Validation Checklist

- [x] All 6 UI slots have implementations
- [x] PluginLoader maps all slots to fully-qualified type names
- [x] Plugin projects are added to solution file
- [x] Plugin projects are referenced in shell project
- [x] Pre-build validation script runs before build
- [ ] Roslyn analyzer SHELL003 validates completeness
- [ ] Runtime plugin loading succeeds
- [ ] Canvas and ControlPanel moved to standalone plugins

## Future Work

1. **Move Canvas and ControlPanel to standalone plugins** for architectural consistency
2. **Enhance Roslyn analyzer** to validate manifest against implementations
3. **Add plugin discovery** to automatically find all plugin DLLs
4. **Create plugin template** for easier plugin creation
5. **Implement plugin versioning** for compatibility checking

