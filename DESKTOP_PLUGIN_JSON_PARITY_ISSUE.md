# Desktop Plugin JSON Parity Issue

## Problem Statement

The desktop Avalonia plugins (`src/RenderX.Plugins.*`) are **completely missing their JSON files** that define sequences, topics, and components. This causes:

1. **E2E test failures** - All 26 E2E tests fail because the application cannot load any sequences
2. **No feature parity** - Desktop version has no functionality because sequences don't exist
3. **Architecture violation** - Desktop doesn't follow the same manifest-driven architecture as web

## Root Cause

Someone made an incorrect assumption and implemented the desktop plugins as **empty DLL shells** without copying the JSON files from the web version. The desktop version is missing:

### Missing Directories

```
src/RenderX.Plugins.Canvas/json-sequences/     ❌ MISSING
src/RenderX.Plugins.Canvas/json-topics/        ❌ MISSING
src/RenderX.Plugins.ControlPanel/json-sequences/ ❌ MISSING
src/RenderX.Plugins.ControlPanel/json-topics/  ❌ MISSING
src/RenderX.Plugins.Header/json-sequences/     ❌ MISSING
src/RenderX.Plugins.Library/json-sequences/    ❌ MISSING
src/RenderX.Plugins.Components/                ❌ MISSING (entire plugin)
```

### What Should Exist

The desktop plugins should mirror the web plugins' JSON structure:

```
Web Version                                    Desktop Version (SHOULD BE)
===========                                    ===========================
packages/canvas-component/json-sequences/   → src/RenderX.Plugins.Canvas/json-sequences/
packages/canvas-component/json-topics/      → src/RenderX.Plugins.Canvas/json-topics/
packages/control-panel/json-sequences/      → src/RenderX.Plugins.ControlPanel/json-sequences/
packages/control-panel/json-topics/         → src/RenderX.Plugins.ControlPanel/json-topics/
packages/header/json-sequences/             → src/RenderX.Plugins.Header/json-sequences/
packages/library/json-sequences/            → src/RenderX.Plugins.Library/json-sequences/
packages/library-component/json-sequences/  → src/RenderX.Plugins.Library/json-sequences/
packages/components/json-components/        → src/RenderX.Plugins.Components/json-components/
```

## Web Version Architecture (Correct)

The web version has a sophisticated pre-build system:

### 1. JSON Files in Plugins

Each web plugin has JSON files defining its functionality:

```
packages/canvas-component/json-sequences/canvas-component/
├── create.json
├── delete.json
├── drag.start.json
├── drag.move.json
├── drag.end.json
├── resize.start.json
├── resize.move.json
├── resize.end.json
├── select.json
├── deselect.json
└── ... (31 sequence files total)

packages/canvas-component/json-topics/
└── canvas-component.json

packages/control-panel/json-sequences/
├── classes.add.json
├── classes.remove.json
├── css.create.json
├── ui.field.change.json
├── ui.init.json
└── ... (14 sequence files total)

packages/control-panel/json-topics/
└── control-panel.json
```

### 2. Pre-Build Scripts

The web version has scripts that:

1. **`sync-json-sequences.js`** - Copies JSON files from `packages/*/json-sequences` to `public/json-sequences`
2. **`generate-topics-manifest.js`** - Generates `topics-manifest.json` from `packages/*/json-topics`
3. **`generate-interaction-manifest.js`** - Generates `interaction-manifest.json` from sequences
4. **`aggregate-plugins.js`** - Generates `plugin-manifest.json` from plugin metadata

### 3. Package.json Scripts

```json
{
  "scripts": {
    "pre:manifests": "node scripts/sync-json-sources.js && npm run sync:json-components && node scripts/sync-json-sequences.js && node scripts/generate-json-interactions-from-plugins.js && node scripts/generate-interaction-manifest.js && node scripts/generate-topics-manifest.js && node scripts/generate-layout-manifest.js && node scripts/aggregate-plugins.js && node scripts/sync-plugins.js && node scripts/sync-control-panel-config.js"
  }
}
```

## Desktop Version Architecture (BROKEN)

The desktop version has:

1. ❌ **No JSON files** in plugin projects
2. ❌ **No pre-build scripts** to generate manifests
3. ❌ **No MSBuild targets** to copy/process JSON files
4. ✅ **Plugin manifest exists** at `src/RenderX.Shell.Avalonia/plugins/plugin-manifest.json` (but it's incomplete)

## Solution

### Phase 1: Copy JSON Files to Desktop Plugins

1. **Create missing directories** in each desktop plugin
2. **Copy JSON files** from web plugins to desktop plugins
3. **Update .csproj files** to include JSON files as Content or EmbeddedResource

### Phase 2: Create Pre-Build System

Create MSBuild targets or PowerShell scripts to:

1. **Validate JSON files** exist in plugins
2. **Generate manifests** from JSON files (like web version)
3. **Copy manifests** to output directory

### Phase 3: Update Analyzer Tests

The analyzer tests now enforce this architecture:

```csharp
[Fact]
public void DesktopPlugins_MustHaveJsonSequencesDirectories()
{
    // Ensures desktop plugins have json-sequences directories
    // matching their web counterparts
}

[Fact]
public void DesktopPlugins_SequenceFilesMustMatchWebVersion()
{
    // Ensures desktop plugins have the same sequence files
    // as web plugins for feature parity
}
```

## Impact

### Current State (BROKEN)

- ❌ All 26 E2E tests fail
- ❌ Application cannot load any sequences
- ❌ No drag-and-drop functionality
- ❌ No component creation
- ❌ No theme toggle
- ❌ No library loading

### After Fix (WORKING)

- ✅ E2E tests pass
- ✅ Application loads sequences from JSON files
- ✅ Full feature parity with web version
- ✅ Manifest-driven architecture enforced by analyzer

## Files to Create/Modify

### New Files Needed

```
src/RenderX.Plugins.Canvas/json-sequences/       (copy from packages/canvas-component/json-sequences)
src/RenderX.Plugins.Canvas/json-topics/          (copy from packages/canvas-component/json-topics)
src/RenderX.Plugins.ControlPanel/json-sequences/ (copy from packages/control-panel/json-sequences)
src/RenderX.Plugins.ControlPanel/json-topics/    (copy from packages/control-panel/json-topics)
src/RenderX.Plugins.Header/json-sequences/       (copy from packages/header/json-sequences)
src/RenderX.Plugins.Library/json-sequences/      (copy from packages/library/json-sequences + library-component/json-sequences)
src/RenderX.Plugins.Components/                  (new plugin project)
src/RenderX.Plugins.Components/json-components/  (copy from packages/components/json-components)
```

### Files to Modify

```
src/RenderX.Plugins.Canvas/RenderX.Plugins.Canvas.csproj
src/RenderX.Plugins.ControlPanel/RenderX.Plugins.ControlPanel.csproj
src/RenderX.Plugins.Header/RenderX.Plugins.Header.csproj
src/RenderX.Plugins.Library/RenderX.Plugins.Library.csproj
src/RenderX.Shell.Avalonia/RenderX.Shell.Avalonia.csproj (add pre-build target)
```

## Analyzer Test Results

Current test failures (expected):

```
❌ DesktopPlugins_MustHaveJsonSequencesDirectories
   - Canvas missing json-sequences
   - ControlPanel missing json-sequences
   - Header missing json-sequences
   - Library missing json-sequences

❌ DesktopPlugins_MustHaveJsonTopicsFiles
   - Canvas missing json-topics
   - ControlPanel missing json-topics

❌ DesktopPlugins_SequenceFilesMustMatchWebVersion
   - All desktop plugins missing sequence files

❌ DesktopPlugins_TopicFilesMustMatchWebVersion
   - All desktop plugins missing topic files

❌ ComponentsPlugin_MustExistInDesktop
   - RenderX.Plugins.Components project doesn't exist
```

## Next Steps

1. **Create issue** documenting this architectural gap
2. **Copy JSON files** from web to desktop plugins
3. **Create pre-build scripts** to generate manifests
4. **Run analyzer tests** to verify parity
5. **Run E2E tests** to verify functionality

## References

- Web plugin structure: `packages/*/json-sequences`, `packages/*/json-topics`
- Web pre-build scripts: `scripts/sync-json-sequences.js`, `scripts/generate-topics-manifest.js`
- Desktop analyzer tests: `src/RenderX.Shell.Avalonia.Analyzers/PluginStructureValidationTests.cs`
- Web packages JSON file list: `web_packages_json_files.txt`

