# RenderX.Shell.Avalonia Upgrade - Technical Specification

## ThinHostLayer Service Design

### Interface Definition
```csharp
public interface IThinHostLayer
{
    // SDK Services
    IEventRouter EventRouter { get; }
    IInventoryAPI Inventory { get; }
    ICssRegistryAPI CssRegistry { get; }
    IConductorClient Conductor { get; }
    IConfigService Config { get; }
    IFeatureFlagsService FeatureFlags { get; }
    IPluginManifestService PluginManifest { get; }
    IInteractionManifestService InteractionManifest { get; }
    ITopicsManifestService TopicsManifest { get; }
    
    // Lifecycle
    Task InitializeAsync(CancellationToken ct = default);
    Task ShutdownAsync(CancellationToken ct = default);
}
```

### Implementation Pattern
```csharp
public class ThinHostLayer : IThinHostLayer
{
    private readonly IEventRouter _eventRouter;
    private readonly IInventoryAPI _inventory;
    private readonly ICssRegistryAPI _cssRegistry;
    private readonly IConductorClient _conductor;
    private readonly IConfigService _config;
    private readonly IFeatureFlagsService _featureFlags;
    private readonly IPluginManifestService _pluginManifest;
    private readonly IInteractionManifestService _interactionManifest;
    private readonly ITopicsManifestService _topicsManifest;
    private readonly ILogger<ThinHostLayer> _logger;

    public ThinHostLayer(
        IEventRouter eventRouter,
        IInventoryAPI inventory,
        ICssRegistryAPI cssRegistry,
        IConductorClient conductor,
        IConfigService config,
        IFeatureFlagsService featureFlags,
        IPluginManifestService pluginManifest,
        IInteractionManifestService interactionManifest,
        ITopicsManifestService topicsManifest,
        ILogger<ThinHostLayer> logger)
    {
        _eventRouter = eventRouter;
        _inventory = inventory;
        _cssRegistry = cssRegistry;
        _conductor = conductor;
        _config = config;
        _featureFlags = featureFlags;
        _pluginManifest = pluginManifest;
        _interactionManifest = interactionManifest;
        _topicsManifest = topicsManifest;
        _logger = logger;
    }

    public IEventRouter EventRouter => _eventRouter;
    public IInventoryAPI Inventory => _inventory;
    public ICssRegistryAPI CssRegistry => _cssRegistry;
    public IConductorClient Conductor => _conductor;
    public IConfigService Config => _config;
    public IFeatureFlagsService FeatureFlags => _featureFlags;
    public IPluginManifestService PluginManifest => _pluginManifest;
    public IInteractionManifestService InteractionManifest => _interactionManifest;
    public ITopicsManifestService TopicsManifest => _topicsManifest;

    public async Task InitializeAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Initializing ThinHostLayer");
        // Initialization logic
        _logger.LogInformation("ThinHostLayer initialized successfully");
    }

    public async Task ShutdownAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Shutting down ThinHostLayer");
        // Cleanup logic
        _logger.LogInformation("ThinHostLayer shutdown complete");
    }
}
```

## UI Component Specifications

### CanvasControl
**Purpose:** Render components on canvas

**Constructor:**
```csharp
public CanvasControl(
    IInventoryAPI inventory,
    IEventRouter eventRouter,
    ICssRegistryAPI cssRegistry,
    ILogger<CanvasControl> logger)
```

**Key Methods:**
- `RenderComponent(ComponentData data)` - Render a component
- `SelectComponent(string componentId)` - Select a component
- `DeleteComponent(string componentId)` - Delete a component
- `UpdateComponent(ComponentData data)` - Update a component

**Event Subscriptions:**
- `canvas.component.create.requested`
- `canvas.component.select.requested`
- `canvas.component.delete.requested`
- `canvas.component.updated`

**Event Publications:**
- `canvas.component.selection.changed`
- `canvas.component.updated`

### ControlPanelControl
**Purpose:** Edit component properties and execute interactions

**Constructor:**
```csharp
public ControlPanelControl(
    IEventRouter eventRouter,
    IConductorClient conductor,
    IInteractionManifestService interactionManifest,
    ILogger<ControlPanelControl> logger)
```

**Key Methods:**
- `DisplayProperties(ComponentData data)` - Display component properties
- `ExecuteInteraction(string interactionId)` - Execute an interaction
- `UpdateProperty(string propertyName, object value)` - Update a property

**Event Subscriptions:**
- `canvas.component.selection.changed`
- `canvas.component.updated`

**Event Publications:**
- `control.panel.property.changed`
- `control.panel.interaction.clicked`

### LayoutManager
**Purpose:** Manage layout and resizing

**Constructor:**
```csharp
public LayoutManager(
    IConfigService config,
    ILogger<LayoutManager> logger)
```

**Key Methods:**
- `ApplyLayout(LayoutConfig config)` - Apply layout configuration
- `SaveLayout()` - Save layout preferences
- `RestoreLayout()` - Restore saved layout

## Event Flow Examples

### Component Selection Flow
```
User clicks component on canvas
  ↓
CanvasControl.OnComponentClicked()
  ↓
IEventRouter.PublishAsync("canvas.component.selection.changed", {
    componentId: "comp-123",
    properties: { ... }
})
  ↓
ControlPanelControl subscribes to event
  ↓
ControlPanelControl.DisplayProperties(componentData)
  ↓
UI updates with component properties
```

### Property Change Flow
```
User edits property in ControlPanel
  ↓
ControlPanelControl.OnPropertyChanged()
  ↓
IEventRouter.PublishAsync("control.panel.property.changed", {
    componentId: "comp-123",
    propertyName: "width",
    value: 200
})
  ↓
CanvasControl subscribes to event
  ↓
CanvasControl.UpdateComponent(componentData)
  ↓
Canvas re-renders with new property
```

### Interaction Execution Flow
```
User clicks interaction button
  ↓
ControlPanelControl.OnInteractionClicked()
  ↓
IInteractionManifestService.ResolveInteraction(interactionId)
  ↓
IConductorClient.Play(pluginId, sequenceId, context)
  ↓
Subscribe to "sequence:completed" event
  ↓
Update UI with result
```

## DI Registration

```csharp
// Program.cs
services.AddRenderXHostSdk(options =>
{
    options.ConfigurePath = "config.json";
});

services.AddMusicalConductor(options =>
{
    options.PluginsPath = "plugins";
});

services.AddSingleton<IThinHostLayer, ThinHostLayer>();
services.AddSingleton<CanvasControl>();
services.AddSingleton<ControlPanelControl>();
services.AddSingleton<LayoutManager>();
```

## Testing Strategy

### Unit Tests
- ThinHostLayer initialization
- Service property access
- Event subscription/publication

### Integration Tests
- Component rendering
- Event routing
- Plugin execution
- Property updates

### E2E Tests
- Full user workflows
- Component creation/editing/deletion
- Interaction execution

## Migration Checklist

- [ ] Phase 1: Foundation setup complete
- [ ] Phase 2: UI components created
- [ ] Phase 3: Plugin integration working
- [ ] Phase 4: WebView2 removed
- [ ] All tests passing
- [ ] No lint errors
- [ ] Documentation updated
- [ ] Performance targets met

---

**Version:** 1.0  
**Date:** 2025-11-08

