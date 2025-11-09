# RenderX.Shell.Avalonia Upgrade - Implementation Guide

## Phase 1: Foundation Setup (2-3 hours)

### Step 1: Add Project References

Edit `RenderX.Shell.Avalonia.csproj`:
```xml
<ItemGroup>
    <ProjectReference Include="..\RenderX.HostSDK.Avalonia\RenderX.HostSDK.Avalonia.csproj" />
    <ProjectReference Include="..\MusicalConductor.Avalonia\MusicalConductor.Avalonia.csproj" />
</ItemGroup>
```

### Step 2: Create ThinHostLayer Service

Create `Core/ThinHostLayer.cs`:
```csharp
public interface IThinHostLayer
{
    IEventRouter EventRouter { get; }
    IInventoryAPI Inventory { get; }
    ICssRegistryAPI CssRegistry { get; }
    IConductorClient Conductor { get; }
    // ... other properties
    Task InitializeAsync(CancellationToken ct = default);
    Task ShutdownAsync(CancellationToken ct = default);
}

public class ThinHostLayer : IThinHostLayer
{
    private readonly IEventRouter _eventRouter;
    private readonly IInventoryAPI _inventory;
    private readonly ICssRegistryAPI _cssRegistry;
    private readonly IConductorClient _conductor;
    private readonly ILogger<ThinHostLayer> _logger;

    public ThinHostLayer(
        IEventRouter eventRouter,
        IInventoryAPI inventory,
        ICssRegistryAPI cssRegistry,
        IConductorClient conductor,
        ILogger<ThinHostLayer> logger)
    {
        _eventRouter = eventRouter;
        _inventory = inventory;
        _cssRegistry = cssRegistry;
        _conductor = conductor;
        _logger = logger;
    }

    public IEventRouter EventRouter => _eventRouter;
    public IInventoryAPI Inventory => _inventory;
    public ICssRegistryAPI CssRegistry => _cssRegistry;
    public IConductorClient Conductor => _conductor;

    public async Task InitializeAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Initializing ThinHostLayer");
        // Initialization logic
    }

    public async Task ShutdownAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Shutting down ThinHostLayer");
        // Cleanup logic
    }
}
```

### Step 3: Update Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add SDKs
builder.Services.AddRenderXHostSdk(options =>
{
    options.ConfigurePath = "config.json";
});

builder.Services.AddMusicalConductor(options =>
{
    options.PluginsPath = "plugins";
});

// Add ThinHostLayer
builder.Services.AddSingleton<IThinHostLayer, ThinHostLayer>();

// Add other services
builder.Services.AddLogging();
builder.Services.AddAvaloniaServices();

var app = builder.Build();
// ... rest of configuration
```

### Step 4: Update MainWindowViewModel

```csharp
public class MainWindowViewModel : ViewModelBase
{
    private readonly IThinHostLayer _thinHostLayer;
    private readonly ILogger<MainWindowViewModel> _logger;

    public MainWindowViewModel(
        IThinHostLayer thinHostLayer,
        ILogger<MainWindowViewModel> logger)
    {
        _thinHostLayer = thinHostLayer;
        _logger = logger;
        
        _logger.LogInformation("MainWindowViewModel initialized");
    }

    public IEventRouter EventRouter => _thinHostLayer.EventRouter;
    public IInventoryAPI Inventory => _thinHostLayer.Inventory;
    public IConductorClient Conductor => _thinHostLayer.Conductor;
}
```

### Verification
```bash
dotnet build -c Debug
# Should build without errors
```

---

## Phase 2: UI Components (8-12 hours)

### Step 1: Create CanvasControl

Create `UI/Views/CanvasControl.axaml`:
```xml
<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             x:Class="RenderX.Shell.Avalonia.UI.Views.CanvasControl">
    <Grid>
        <ItemsControl Name="ComponentsContainer" />
    </Grid>
</UserControl>
```

Create `UI/Views/CanvasControl.axaml.cs`:
```csharp
public partial class CanvasControl : UserControl
{
    private readonly IInventoryAPI _inventory;
    private readonly IEventRouter _eventRouter;
    private readonly ICssRegistryAPI _cssRegistry;
    private readonly ILogger<CanvasControl> _logger;

    public CanvasControl(
        IInventoryAPI inventory,
        IEventRouter eventRouter,
        ICssRegistryAPI cssRegistry,
        ILogger<CanvasControl> logger)
    {
        InitializeComponent();
        _inventory = inventory;
        _eventRouter = eventRouter;
        _cssRegistry = cssRegistry;
        _logger = logger;
        
        SubscribeToEvents();
    }

    private void SubscribeToEvents()
    {
        _eventRouter.Subscribe("canvas.component.create.requested", OnCreateRequested);
        _eventRouter.Subscribe("canvas.component.select.requested", OnSelectRequested);
        _logger.LogInformation("CanvasControl event subscriptions initialized");
    }

    private async Task OnCreateRequested(object data)
    {
        _logger.LogInformation("Create component requested");
        // Implementation
    }

    private async Task OnSelectRequested(object data)
    {
        _logger.LogInformation("Select component requested");
        // Implementation
    }
}
```

### Step 2: Create ControlPanelControl

Similar pattern to CanvasControl, but for property editing and interaction execution.

### Step 3: Update MainWindow

Replace WebViewHost with new controls:
```xml
<Window>
    <Grid ColumnDefinitions="*,Auto,300">
        <local:CanvasControl Grid.Column="0" />
        <GridSplitter Grid.Column="1" Width="5" />
        <local:ControlPanelControl Grid.Column="2" />
    </Grid>
</Window>
```

### Verification
```bash
dotnet build -c Debug
# App should launch with native UI
```

---

## Phase 3: Integration (6-8 hours)

### Step 1: Update AvaloniaPluginManager

Wire plugin manager to use ThinHostLayer services.

### Step 2: Implement Component Rendering

Update CanvasControl to render components from inventory.

### Step 3: Wire Event Routing

Ensure all events flow correctly between controls.

### Step 4: Test Plugin Execution

Verify plugins load and execute via conductor.

### Verification
```bash
dotnet build -c Debug
# Plugins should load and execute
```

---

## Phase 4: Cleanup (4-6 hours)

### Step 1: Remove WebView2 Code

Delete WebViewHost files and references.

### Step 2: Remove Legacy Services

Delete custom implementations now provided by SDKs.

### Step 3: Remove wwwroot Directory

Delete TypeScript frontend files.

### Step 4: Remove WebView2 Dependency

Remove from .csproj and run `dotnet restore`.

### Step 5: Optimize Performance

Profile and optimize hot paths.

### Verification
```bash
dotnet build -c Release
# No WebView2 references
# Deployment size reduced
```

---

## Common Patterns

### Event Subscription
```csharp
_eventRouter.Subscribe("topic.name", async (data) =>
{
    _logger.LogInformation("Event received: {Topic}", "topic.name");
    // Handle event
});
```

### Event Publishing
```csharp
await _eventRouter.PublishAsync("topic.name", new { /* data */ });
```

### Conductor Execution
```csharp
var result = await _conductor.Play(pluginId, sequenceId, context);
```

---

## Troubleshooting

**Build Errors:**
- Verify project references are correct
- Run `dotnet restore`
- Check for circular dependencies

**Runtime Errors:**
- Check logs for initialization errors
- Verify DI registration order
- Ensure all services are registered

**Event Issues:**
- Verify event topic names match
- Check event subscription order
- Add logging to trace event flow

---

**Version:** 1.0  
**Date:** 2025-11-08

