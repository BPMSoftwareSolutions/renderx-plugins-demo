# Architecture Rules for Desktop Shell 🏗️

## Strict Rules Enforced by Roslyn Analyzer

These rules are **ENFORCED AT COMPILE TIME**. The build will FAIL if you violate them.

---

## SHELL001: Thin-Host Architecture

### Rule
Shell code must NOT import from custom SDK implementations. All services must come from DI.

### Forbidden Imports
```csharp
❌ using RenderX.Shell.Avalonia.Core.Conductor.*;
❌ using RenderX.Shell.Avalonia.Core.Events.*;
```

### Why
The shell is a **thin presentation layer**. It must NOT contain business logic or custom implementations. All orchestration and event routing comes from the SDKs:
- `MusicalConductor.Avalonia` - Orchestration
- `RenderX.HostSDK.Avalonia` - Event routing and core services

### Correct Pattern
```csharp
// ✅ CORRECT - Get services from DI
var thinHostLayer = _serviceProvider.GetRequiredService<IThinHostLayer>();
var eventRouter = thinHostLayer.EventRouter;
var conductor = thinHostLayer.Conductor;
```

### Incorrect Pattern
```csharp
// ❌ WRONG - Custom implementation
using RenderX.Shell.Avalonia.Core.Conductor;
var conductor = new CustomConductor();
```

---

## SHELL002: Plugin Decoupling

### Rule
Plugins must be loaded dynamically via manifest, NOT hardcoded in MainWindow.

### Forbidden in MainWindow.axaml.cs
```csharp
❌ using RenderX.Shell.Avalonia.UI.Views;
❌ new CanvasControl();
❌ new ControlPanelControl();
❌ new LibraryControl();
```

### Why
**Tight Coupling Problem**:
- If you hardcode `new CanvasControl()`, you must rebuild the shell to change it
- Adding a new plugin requires modifying shell code
- Plugins can't be deployed independently

**Decoupling Solution**:
- Plugins defined in `plugin-manifest.json`
- Loaded dynamically at runtime
- Shell never changes when plugins change
- Plugins can be added/removed without rebuilding shell

### Correct Pattern (Web Version)
```typescript
// PanelSlot.tsx - Generic loader
const manifest = await getPluginManifest();
const entry = manifest.plugins.find(p => p.ui?.slot === slot);
const mod = await import(entry.ui.module);
const Exported = mod[entry.ui.export];
```

### Correct Pattern (Desktop Version)
```csharp
// SlotContainer.cs - Generic loader
var manifest = await pluginLoader.LoadManifestAsync();
var plugin = manifest.plugins.FirstOrDefault(p => p.ui?.slot == SlotName);
var assembly = Assembly.Load(plugin.ui.assembly);
var type = assembly.GetType(plugin.ui.type);
var control = (Control)Activator.CreateInstance(type);
this.Child = control;
```

### Incorrect Pattern
```csharp
// ❌ WRONG - Hardcoded in MainWindow.axaml.cs
using RenderX.Shell.Avalonia.UI.Views;

var canvasControl = new CanvasControl();
var controlPanelControl = new ControlPanelControl();
canvasSlot.Child = canvasControl;
controlPanelSlot.Child = controlPanelControl;
```

---

## Plugin Manifest Structure

### plugin-manifest.json
```json
{
  "plugins": [
    {
      "id": "CanvasPlugin",
      "ui": {
        "slot": "canvas",
        "assembly": "RenderX.Plugins.Canvas",
        "type": "RenderX.Plugins.Canvas.CanvasControl"
      },
      "runtime": {
        "assembly": "RenderX.Plugins.Canvas",
        "type": "RenderX.Plugins.Canvas.CanvasPlugin",
        "method": "Register"
      }
    },
    {
      "id": "ControlPanelPlugin",
      "ui": {
        "slot": "controlPanel",
        "assembly": "RenderX.Plugins.ControlPanel",
        "type": "RenderX.Plugins.ControlPanel.ControlPanelControl"
      },
      "runtime": {
        "assembly": "RenderX.Plugins.ControlPanel",
        "type": "RenderX.Plugins.ControlPanel.ControlPanelPlugin",
        "method": "Register"
      }
    }
  ]
}
```

---

## MainWindow Architecture

### MainWindow.axaml (XAML Layout)
```xml
<Window Background="White">
    <Grid RowDefinitions="48,*" ColumnDefinitions="320,*,360">
        <!-- Header slots - empty, plugins populate them -->
        <local:SlotContainer Grid.Row="0" Grid.Column="0" SlotName="headerLeft" />
        <local:SlotContainer Grid.Row="0" Grid.Column="1" SlotName="headerCenter" />
        <local:SlotContainer Grid.Row="0" Grid.Column="2" SlotName="headerRight" />
        
        <!-- Main slots - empty, plugins populate them -->
        <local:SlotContainer Grid.Row="1" Grid.Column="0" SlotName="library" />
        <local:SlotContainer Grid.Row="1" Grid.Column="1" SlotName="canvas" />
        <local:SlotContainer Grid.Row="1" Grid.Column="2" SlotName="controlPanel" />
    </Grid>
</Window>
```

### MainWindow.axaml.cs (Code-Behind)
```csharp
// ✅ CORRECT - Use plugin loader
private async void OnWindowLoaded(object? sender, RoutedEventArgs e)
{
    var pluginLoader = _serviceProvider.GetRequiredService<IPluginLoader>();
    var manifest = await pluginLoader.LoadManifestAsync();

    var slots = this.FindControls<SlotContainer>();
    foreach (var slot in slots)
    {
        await slot.InitializeAsync(pluginLoader, manifest);
    }
}
```

---

## SlotContainer Pattern

### SlotContainer.cs (Generic Slot Loader)
```csharp
public class SlotContainer : Border
{
    public static readonly StyledProperty<string> SlotNameProperty =
        AvaloniaProperty.Register<SlotContainer, string>(nameof(SlotName));

    public string SlotName
    {
        get => GetValue(SlotNameProperty);
        set => SetValue(SlotNameProperty, value);
    }

    public async Task InitializeAsync(IPluginLoader loader, PluginManifest manifest)
    {
        var plugin = manifest.plugins.FirstOrDefault(p => p.ui?.slot == SlotName);
        if (plugin == null) return;

        var type = await loader.LoadPluginTypeAsync(plugin.ui);
        var control = (Control)Activator.CreateInstance(type);
        this.Child = control;
    }
}
```

---

## Parity with Web Version

| Aspect | Web | Desktop |
|--------|-----|---------|
| **Manifest** | plugin-manifest.json | plugin-manifest.json |
| **Slot Container** | PanelSlot.tsx | SlotContainer.cs |
| **Dynamic Loading** | `import()` | `Assembly.Load()` |
| **Type Resolution** | `mod[export]` | `assembly.GetType()` |
| **Instance Creation** | React component | `Activator.CreateInstance()` |
| **Plugin Isolation** | ✅ Full | ✅ Full |

---

## Build Failures

If you violate these rules, the build will fail with:

```
error SHELL001: Shell code must not import from 'RenderX.Shell.Avalonia.Core.Conductor'. 
Use SDK services from DI instead.

error SHELL002: MainWindow must not directly instantiate plugin controls. 
Use IPluginLoader and manifest-driven discovery instead.
```

**You MUST fix these errors before the build succeeds.**

---

## For Future Agents

### DO ✅
- Load plugins dynamically via `IPluginLoader`
- Use `plugin-manifest.json` as single source of truth
- Use `SlotContainer` for all plugin slots
- Get SDK services from DI container
- Keep MainWindow.axaml.cs free of plugin imports

### DON'T ❌
- Hardcode `new CanvasControl()` or any plugin control
- Import from `RenderX.Shell.Avalonia.UI.Views`
- Import from `RenderX.Shell.Avalonia.Core.Conductor` or `.Core.Events`
- Create custom implementations of SDK interfaces
- Modify MainWindow.axaml.cs to add new plugins

### To Add a New Plugin
1. Create plugin assembly (e.g., `RenderX.Plugins.MyPlugin.dll`)
2. Add entry to `plugin-manifest.json`
3. Deploy plugin assembly
4. **No shell rebuild needed!**

---

## Documentation References

- **DESKTOP_VS_WEB_ARCHITECTURE_PARITY.md** - Complete architecture comparison
- **DESKTOP_DECOUPLING_ARCHITECTURE.md** - Detailed decoupling strategy
- **ARCHITECTURE_CLARIFICATION_SUMMARY.md** - High-level overview

---

**Status**: ✅ Rules enforced at compile time  
**Build**: Will fail if rules are violated  
**Next**: Implement IPluginLoader and SlotContainer

