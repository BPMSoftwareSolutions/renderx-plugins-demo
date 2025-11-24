# Architecture Analyzer Roadmap

## Current Implementation

### SHELL001: Thin-Host Violations ✅
**Status:** Implemented and tested

**Rules:**
- Shell code must NOT import from `RenderX.Shell.Avalonia.Core.Conductor/**`
- Shell code must NOT import from `RenderX.Shell.Avalonia.Core.Events/**`
- All SDK services must come from DI

**Tests:** 2 passing

### SHELL002: Plugin Decoupling Violations ✅
**Status:** Implemented and tested

**Rules:**
- MainWindow must NOT directly instantiate plugin controls
- MainWindow must NOT import from `RenderX.Shell.Avalonia.UI.Views.*`
- Plugin loading must use IPluginLoader and manifest-driven discovery

**Tests:** 9 passing

## Planned Implementation

### SHELL003: Plugin Completeness Violations ⏳
**Status:** Planned

**Rules:**
1. All plugins in `plugin-manifest.json` must have corresponding implementations
2. All plugins must be registered in `PluginLoader.cs`
3. All plugin DLLs must be referenced in the shell project
4. Plugin type names must match manifest exports

**Implementation Approach:**

```csharp
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class PluginCompletenessAnalyzer : DiagnosticAnalyzer
{
    public const string DiagnosticId = "SHELL003";
    
    public override void Initialize(AnalysisContext context)
    {
        // 1. Parse plugin-manifest.json
        var manifest = LoadManifest();
        
        // 2. Check PluginLoader.cs for all plugins
        context.RegisterSyntaxNodeAction(
            ctx => AnalyzePluginLoader(ctx, manifest),
            SyntaxKind.ClassDeclaration);
        
        // 3. Check project file for plugin references
        context.RegisterCompilationAction(
            ctx => AnalyzeProjectReferences(ctx, manifest));
    }
    
    private void AnalyzePluginLoader(SyntaxNodeAnalysisContext context, Manifest manifest)
    {
        // Verify all plugins from manifest are registered
        foreach (var plugin in manifest.Plugins)
        {
            if (!pluginLoaderCode.Contains(plugin.Id))
            {
                ReportDiagnostic(context, $"Plugin {plugin.Id} not registered in PluginLoader");
            }
        }
    }
    
    private void AnalyzeProjectReferences(CompilationAnalysisContext context, Manifest manifest)
    {
        // Verify all plugin DLLs are referenced
        foreach (var plugin in manifest.Plugins)
        {
            if (!projectFile.Contains(plugin.Module))
            {
                ReportDiagnostic(context, $"Plugin DLL {plugin.Module} not referenced in project");
            }
        }
    }
}
```

**Tests to Add:**
- `ManifestPluginNotRegisteredInLoader` - Reports SHELL003 when plugin in manifest but not in PluginLoader
- `PluginNotInManifest` - Reports SHELL003 when plugin in PluginLoader but not in manifest
- `PluginDllNotReferenced` - Reports SHELL003 when plugin DLL not referenced in project
- `AllPluginsRegistered` - No violation when all plugins properly registered

## Future Enhancements

### SHELL004: Plugin Initialization Violations
**Purpose:** Ensure all plugins properly initialize with required dependencies

**Rules:**
- All plugin controls must implement `Initialize(IEventRouter, IConductorClient, ILogger<T>)`
- Plugin initialization must be called before rendering
- Plugins must handle initialization errors gracefully

### SHELL005: Plugin Dependency Violations
**Purpose:** Ensure plugins only depend on SDKs, not on shell internals

**Rules:**
- Plugin projects must NOT reference `RenderX.Shell.Avalonia` (except SDKs)
- Plugin projects must NOT reference other plugin projects
- Plugin projects must only reference `RenderX.HostSDK.Avalonia` and `MusicalConductor.Avalonia`

### SHELL006: Plugin Manifest Violations
**Purpose:** Ensure manifest is valid and complete

**Rules:**
- Manifest must be valid JSON
- All required fields must be present (id, ui.slot, ui.module, ui.export)
- Slot names must be unique
- Module names must be valid assembly names
- Export names must be valid type names

## Testing Strategy

### Unit Tests
- Test each analyzer rule in isolation
- Use synthetic code snippets
- Verify correct diagnostic ID and message

### Integration Tests
- Test analyzer against actual plugin projects
- Verify analyzer catches real violations
- Verify analyzer doesn't report false positives

### CI/CD Integration
- Run analyzer as part of build
- Fail build if SHELL00x violations found
- Generate report of violations

## Implementation Timeline

| Phase | Task | Effort | Status |
|-------|------|--------|--------|
| 1 | Implement SHELL003 analyzer | 4 hours | ⏳ Planned |
| 2 | Add SHELL003 tests | 2 hours | ⏳ Planned |
| 3 | Implement SHELL004 analyzer | 3 hours | ⏳ Planned |
| 4 | Implement SHELL005 analyzer | 3 hours | ⏳ Planned |
| 5 | Implement SHELL006 analyzer | 2 hours | ⏳ Planned |
| 6 | CI/CD integration | 2 hours | ⏳ Planned |

## Success Criteria

- [x] SHELL001 and SHELL002 fully implemented and tested
- [x] 22 architecture validation tests passing
- [ ] SHELL003 implemented and tested
- [ ] SHELL004 implemented and tested
- [ ] SHELL005 implemented and tested
- [ ] SHELL006 implemented and tested
- [ ] All analyzers integrated into CI/CD
- [ ] Zero violations in codebase

## References

- [Roslyn Analyzers Documentation](https://github.com/dotnet/roslyn-analyzers)
- [ADR-0020: Plugin Architecture Validation](./adr/0020-plugin-architecture-validation.md)
- [Architecture Validation Report](./ARCHITECTURE_VALIDATION_REPORT.md)

