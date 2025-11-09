# SHELL002 Violations Guide 🔧

## Current Status

The build is currently **FAILING** with 3 SHELL002 violations:

```
error SHELL002: MainWindow must not directly instantiate plugin controls. 
Violation: Import from RenderX.Shell.Avalonia.UI.Views
[MainWindow.axaml.cs:9]

error SHELL002: MainWindow must not directly instantiate plugin controls. 
Violation: Direct instantiation of CanvasControl
[MainWindow.axaml.cs:69]

error SHELL002: MainWindow must not directly instantiate plugin controls. 
Violation: Direct instantiation of ControlPanelControl
[MainWindow.axaml.cs:83]
```

---

## What This Means

The analyzer is **correctly detecting** that MainWindow.axaml.cs is:

1. ❌ Importing plugin controls directly
2. ❌ Instantiating plugin controls with `new`
3. ❌ Mounting plugins hardcoded in code

This violates the **plugin decoupling architecture**.

---

## How to Fix

### Step 1: Create IPluginLoader Interface

Create `src/RenderX.Shell.Avalonia/Infrastructure/Plugins/IPluginLoader.cs`:

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Plugins;

public interface IPluginDescriptor
{
    string Assembly { get; }
    string Type { get; }
}

public interface IPluginManifest
{
    List<IPluginEntry> Plugins { get; }
}

public interface IPluginEntry
{
    string Id { get; }
    IPluginDescriptor? Ui { get; }
    IPluginDescriptor? Runtime { get; }
}

public interface IPluginLoader
{
    Task<IPluginManifest> LoadManifestAsync();
    Task<Type> LoadPluginTypeAsync(IPluginDescriptor descriptor);
}
```

### Step 2: Create PluginLoader Implementation

Create `src/RenderX.Shell.Avalonia/Infrastructure/Plugins/PluginLoader.cs`:

```csharp
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Plugins;

public class PluginLoader : IPluginLoader
{
    private readonly string _manifestPath;

    public PluginLoader(string manifestPath = "wwwroot/plugins/plugin-manifest.json")
    {
        _manifestPath = manifestPath;
    }

    public async Task<IPluginManifest> LoadManifestAsync()
    {
        var json = await File.ReadAllTextAsync(_manifestPath);
        var doc = JsonDocument.Parse(json);
        return new PluginManifest(doc.RootElement);
    }

    public async Task<Type> LoadPluginTypeAsync(IPluginDescriptor descriptor)
    {
        var assembly = Assembly.Load(descriptor.Assembly);
        var type = assembly.GetType(descriptor.Type);
        if (type == null)
            throw new InvalidOperationException($"Type {descriptor.Type} not found in {descriptor.Assembly}");
        return type;
    }
}

// Implementation classes...
```

### Step 3: Create SlotContainer Control

Create `src/RenderX.Shell.Avalonia/UI/Controls/SlotContainer.axaml.cs`:

```csharp
using Avalonia.Controls;
using RenderX.Shell.Avalonia.Infrastructure.Plugins;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.UI.Controls;

public partial class SlotContainer : Border
{
    public static readonly StyledProperty<string> SlotNameProperty =
        AvaloniaProperty.Register<SlotContainer, string>(nameof(SlotName));

    public string SlotName
    {
        get => GetValue(SlotNameProperty);
        set => SetValue(SlotNameProperty, value);
    }

    public async Task InitializeAsync(IPluginLoader loader, IPluginManifest manifest)
    {
        var plugin = manifest.Plugins.FirstOrDefault(p => p.Ui?.Slot == SlotName);
        if (plugin?.Ui == null) return;

        var type = await loader.LoadPluginTypeAsync(plugin.Ui);
        var control = (Control)Activator.CreateInstance(type);
        this.Child = control;
    }
}
```

### Step 4: Update MainWindow.axaml

Replace hardcoded Border elements with SlotContainers:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:local="using:RenderX.Shell.Avalonia.UI.Controls"
        ...>
    <Grid RowDefinitions="48,*" ColumnDefinitions="320,*,360" Background="White">
        <!-- Header slots -->
        <local:SlotContainer Grid.Row="0" Grid.Column="0" SlotName="headerLeft" />
        <local:SlotContainer Grid.Row="0" Grid.Column="1" SlotName="headerCenter" />
        <local:SlotContainer Grid.Row="0" Grid.Column="2" SlotName="headerRight" />
        
        <!-- Main slots -->
        <local:SlotContainer Grid.Row="1" Grid.Column="0" SlotName="library" />
        <local:SlotContainer Grid.Row="1" Grid.Column="1" SlotName="canvas" />
        <local:SlotContainer Grid.Row="1" Grid.Column="2" SlotName="controlPanel" />
    </Grid>
</Window>
```

### Step 5: Update MainWindow.axaml.cs

Remove plugin imports and hardcoded instantiation:

```csharp
// ❌ DELETE THESE IMPORTS
// using RenderX.Shell.Avalonia.UI.Views;

private async void OnWindowLoaded(object? sender, RoutedEventArgs e)
{
    try
    {
        _logger.LogInformation("MainWindow loaded, initializing plugins");

        // ✅ Use plugin loader instead
        var pluginLoader = _serviceProvider.GetRequiredService<IPluginLoader>();
        var manifest = await pluginLoader.LoadManifestAsync();

        // Initialize all slot containers
        var slots = this.FindControls<SlotContainer>();
        foreach (var slot in slots)
        {
            await slot.InitializeAsync(pluginLoader, manifest);
        }

        _logger.LogInformation("MainWindow initialization complete");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error initializing MainWindow");
    }
}
```

### Step 6: Register in DI Container

Update `Program.cs`:

```csharp
services.AddSingleton<IPluginLoader>(sp => 
    new PluginLoader("wwwroot/plugins/plugin-manifest.json"));
```

### Step 7: Update plugin-manifest.json

Add assembly and type mappings:

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
    }
  ]
}
```

---

## Verification

After implementing these changes:

1. **Build should succeed** with zero SHELL002 errors
2. **MainWindow.axaml.cs should have NO plugin imports**
3. **Plugins should load dynamically** from manifest
4. **App should display** with all slots populated

---

## Testing

Run the build:
```bash
dotnet build src/RenderX.Shell.Avalonia/RenderX.Shell.Avalonia.csproj
```

Expected output:
```
Build succeeded. 0 errors, 0 warnings
```

---

## References

- **ARCHITECTURE_RULES_FOR_AGENTS.md** - Strict rules
- **ADR-0024-Desktop-Plugin-Decoupling.md** - Architecture decision
- **DESKTOP_DECOUPLING_ARCHITECTURE.md** - Implementation strategy

---

## Key Principle

**The analyzer is your friend!** It's preventing you from creating tight coupling. Follow its guidance and you'll build a properly decoupled plugin architecture.

---

**Status**: Build failing with 3 SHELL002 violations  
**Next**: Implement the 7 steps above to fix violations

