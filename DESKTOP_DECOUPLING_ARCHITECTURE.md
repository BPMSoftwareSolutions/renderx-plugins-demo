# Desktop Decoupling Architecture 🔌

## Critical Issue: Desktop is TIGHTLY COUPLED

**Current State**: ❌ WRONG
```csharp
// MainWindow.axaml.cs - HARDCODED DEPENDENCIES
var canvasControl = new CanvasControl();  // Direct import!
var controlPanelControl = new ControlPanelControl();  // Direct import!
canvasSlot.Child = canvasControl;
controlPanelSlot.Child = controlPanelControl;
```

**Required State**: ✅ DECOUPLED
```csharp
// MainWindow.axaml.cs - DYNAMIC LOADING
var pluginDescriptor = manifest.plugins.Find(p => p.id == "CanvasPlugin");
var controlType = await pluginLoader.LoadPluginType(pluginDescriptor);
var canvasControl = Activator.CreateInstance(controlType);
canvasSlot.Child = (Control)canvasControl;
```

---

## Web Version Decoupling Pattern

### How Web Achieves Decoupling

**1. Plugin Manifest** (Single Source of Truth)
```json
{
  "plugins": [
    {
      "id": "CanvasPlugin",
      "ui": {
        "slot": "canvas",
        "module": "@renderx-plugins/canvas",
        "export": "CanvasPage"
      },
      "runtime": {
        "module": "@renderx-plugins/canvas",
        "export": "register"
      }
    }
  ]
}
```

**2. PanelSlot Component** (Generic Loader)
```typescript
// src/ui/shared/PanelSlot.tsx
export function PanelSlot({ slot }: { slot: string }) {
  const [Comp, setComp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    (async () => {
      // 1. Load manifest
      const manifest = await getPluginManifest();
      
      // 2. Find plugin for this slot
      const entry = manifest.plugins.find(p => p.ui?.slot === slot);
      
      // 3. Dynamically import plugin
      const mod = await import(/* @vite-ignore */ entry.ui.module);
      
      // 4. Get exported component
      const Exported = mod[entry.ui.export];
      
      // 5. Render it
      setComp(() => Exported);
    })();
  }, [slot]);

  return Comp ? <Comp /> : null;
}
```

**3. No Direct Imports**
```typescript
// ❌ WRONG - Tightly coupled
import { CanvasPage } from '@renderx-plugins/canvas';

// ✅ RIGHT - Decoupled
// Plugin loaded dynamically via manifest
```

**4. Event-Based Communication**
```typescript
// Plugins communicate via EventRouter, not direct calls
EventRouter.subscribe('canvas.component.selection.changed', (payload) => {
  // Update control panel
});
```

---

## Desktop Decoupling Pattern (REQUIRED)

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│ MainWindow.axaml (XAML Layout - 6 empty slots)              │
├─────────────────────────────────────────────────────────────┤
│ MainWindow.axaml.cs (Generic Slot Loader)                   │
│  ├─ Load plugin-manifest.json                               │
│  ├─ For each slot:                                          │
│  │  ├─ Find plugin descriptor                               │
│  │  ├─ Load plugin assembly dynamically                     │
│  │  ├─ Create plugin control instance                       │
│  │  └─ Mount in slot                                        │
│  └─ Initialize all plugins with SDK services                │
├─────────────────────────────────────────────────────────────┤
│ Plugin Manifest (plugin-manifest.json)                       │
│  └─ Maps slot → plugin assembly + type                      │
├─────────────────────────────────────────────────────────────┤
│ Plugin Assemblies (External .NET DLLs)                       │
│  ├─ RenderX.Plugins.Canvas.dll                              │
│  ├─ RenderX.Plugins.ControlPanel.dll                        │
│  ├─ RenderX.Plugins.Library.dll                             │
│  └─ RenderX.Plugins.Header.dll                              │
├─────────────────────────────────────────────────────────────┤
│ SDK Services (DI Container)                                  │
│  ├─ IEventRouter                                            │
│  ├─ IConductorClient                                        │
│  └─ ILogger                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Strategy

### Step 1: Create Plugin Manifest (Desktop)
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

### Step 2: Create Plugin Loader Service
```csharp
public interface IPluginLoader
{
    Task<PluginManifest> LoadManifestAsync();
    Task<Type> LoadPluginTypeAsync(PluginDescriptor descriptor);
    Task<object> LoadRuntimePluginAsync(PluginDescriptor descriptor);
}

public class PluginLoader : IPluginLoader
{
    public async Task<Type> LoadPluginTypeAsync(PluginDescriptor descriptor)
    {
        // 1. Load assembly dynamically
        var assembly = Assembly.Load(descriptor.Assembly);
        
        // 2. Get type from assembly
        var type = assembly.GetType(descriptor.Type);
        
        return type;
    }
}
```

### Step 3: Create Generic Slot Container
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

    private IPluginLoader _pluginLoader;
    private PluginManifest _manifest;

    public async Task InitializeAsync(IPluginLoader pluginLoader, PluginManifest manifest)
    {
        _pluginLoader = pluginLoader;
        _manifest = manifest;

        // Find plugin for this slot
        var plugin = _manifest.plugins.FirstOrDefault(p => p.ui?.slot == SlotName);
        if (plugin == null) return;

        // Load plugin type
        var type = await _pluginLoader.LoadPluginTypeAsync(plugin.ui);

        // Create instance
        var control = (Control)Activator.CreateInstance(type);

        // Mount in slot
        this.Child = control;
    }
}
```

### Step 4: Update MainWindow.axaml
```xml
<Window ...>
    <Grid RowDefinitions="48,*" ColumnDefinitions="320,*,360">
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
```csharp
private async void OnWindowLoaded(object? sender, RoutedEventArgs e)
{
    var pluginLoader = _serviceProvider.GetRequiredService<IPluginLoader>();
    var manifest = await pluginLoader.LoadManifestAsync();

    // Initialize all slot containers
    var slots = this.FindControls<SlotContainer>();
    foreach (var slot in slots)
    {
        await slot.InitializeAsync(pluginLoader, manifest);
    }
}
```

---

## Benefits of Decoupling

| Aspect | Tightly Coupled | Decoupled |
|--------|-----------------|-----------|
| **Adding Plugin** | Modify MainWindow.cs + rebuild | Update manifest + deploy plugin |
| **Removing Plugin** | Modify MainWindow.cs + rebuild | Remove from manifest |
| **Plugin Updates** | Rebuild entire app | Update plugin assembly only |
| **Plugin Isolation** | Plugins can affect host | Plugins isolated via manifest |
| **Testing** | Hard to mock plugins | Easy to mock via manifest |
| **Parity with Web** | ❌ Different architecture | ✅ Same architecture |

---

## Parity with Web Version

### Web: Dynamic Loading
```typescript
const mod = await import(/* @vite-ignore */ entry.ui.module);
const Exported = mod[entry.ui.export];
```

### Desktop: Dynamic Loading (SAME PATTERN)
```csharp
var assembly = Assembly.Load(descriptor.Assembly);
var type = assembly.GetType(descriptor.Type);
var control = (Control)Activator.CreateInstance(type);
```

---

## Current Status

❌ **Desktop is tightly coupled**
- CanvasControl hardcoded in MainWindow.axaml.cs
- ControlPanelControl hardcoded in MainWindow.axaml.cs
- No plugin manifest loading
- No dynamic plugin discovery
- No plugin isolation

✅ **Web is properly decoupled**
- PanelSlot loads plugins dynamically
- Plugin manifest is single source of truth
- Plugins loaded at runtime
- Full plugin isolation

---

## Next Steps

1. **Create IPluginLoader interface** - Define plugin loading contract
2. **Create PluginLoader implementation** - Load assemblies dynamically
3. **Create SlotContainer control** - Generic slot that loads plugins
4. **Update MainWindow.axaml** - Replace hardcoded controls with SlotContainers
5. **Update MainWindow.axaml.cs** - Use plugin loader instead of direct instantiation
6. **Update plugin-manifest.json** - Add assembly + type mappings
7. **Test** - Verify plugins load dynamically
8. **Verify parity** - Desktop should work identically to web

---

**Key Principle**: The desktop version should use the SAME decoupling pattern as the web version, just with .NET reflection instead of JavaScript dynamic imports.

