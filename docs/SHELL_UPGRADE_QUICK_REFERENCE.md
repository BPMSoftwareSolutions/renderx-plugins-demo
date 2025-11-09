# RenderX.Shell.Avalonia Upgrade - Quick Reference

## SDK APIs

### IEventRouter
```csharp
// Subscribe to event
_eventRouter.Subscribe("topic.name", async (data) =>
{
    // Handle event
});

// Publish event
await _eventRouter.PublishAsync("topic.name", new { /* data */ });
```

### IInventoryAPI
```csharp
// Get component
var component = await _inventory.GetComponentAsync(componentId);

// List components
var components = await _inventory.ListComponentsAsync();

// Create component
await _inventory.CreateComponentAsync(componentData);
```

### ICssRegistryAPI
```csharp
// Register CSS
_cssRegistry.RegisterCss("selector", "{ color: red; }");

// Get CSS
var css = _cssRegistry.GetCss("selector");
```

### IConductorClient
```csharp
// Execute sequence
var result = await _conductor.Play(pluginId, sequenceId, context);

// Subscribe to sequence events
_eventRouter.Subscribe("sequence:completed", OnSequenceCompleted);
```

## Common Event Topics

### Canvas Events
- `canvas.component.create.requested` - Create component
- `canvas.component.select.requested` - Select component
- `canvas.component.delete.requested` - Delete component
- `canvas.component.updated` - Component updated
- `canvas.component.selection.changed` - Selection changed

### Control Panel Events
- `control.panel.property.changed` - Property changed
- `control.panel.interaction.clicked` - Interaction clicked

### Conductor Events
- `sequence:started` - Sequence started
- `sequence:completed` - Sequence completed
- `sequence:failed` - Sequence failed
- `beat:executed` - Beat executed

## DI Registration Patterns

### Basic Registration
```csharp
services.AddRenderXHostSdk();
services.AddMusicalConductor();
services.AddSingleton<IThinHostLayer, ThinHostLayer>();
```

### With Configuration
```csharp
services.AddRenderXHostSdk(options =>
{
    options.ConfigurePath = "config.json";
});

services.AddMusicalConductor(options =>
{
    options.PluginsPath = "plugins";
});
```

## Event Subscription Patterns

### Simple Subscription
```csharp
_eventRouter.Subscribe("topic", async (data) =>
{
    _logger.LogInformation("Event: {Data}", data);
});
```

### With Type Casting
```csharp
_eventRouter.Subscribe("topic", async (data) =>
{
    if (data is ComponentData component)
    {
        // Handle component
    }
});
```

### With Error Handling
```csharp
_eventRouter.Subscribe("topic", async (data) =>
{
    try
    {
        // Handle event
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error handling event");
    }
});
```

## Conductor Execution Patterns

### Basic Execution
```csharp
var result = await _conductor.Play(pluginId, sequenceId, context);
```

### With Result Handling
```csharp
var result = await _conductor.Play(pluginId, sequenceId, context);
if (result.Success)
{
    _logger.LogInformation("Sequence completed successfully");
}
else
{
    _logger.LogError("Sequence failed: {Error}", result.Error);
}
```

### With Event Subscription
```csharp
_eventRouter.Subscribe("sequence:completed", async (data) =>
{
    _logger.LogInformation("Sequence completed");
});

await _conductor.Play(pluginId, sequenceId, context);
```

## Phase Checklists

### Phase 1: Foundation
- [ ] Project references added
- [ ] ThinHostLayer created
- [ ] Program.cs updated
- [ ] MainWindowViewModel updated
- [ ] Build successful
- [ ] App launches

### Phase 2: UI Components
- [ ] CanvasControl created
- [ ] ControlPanelControl created
- [ ] LayoutManager created
- [ ] MainWindow updated
- [ ] Event subscriptions wired
- [ ] UI displays correctly

### Phase 3: Integration
- [ ] AvaloniaPluginManager updated
- [ ] Component rendering implemented
- [ ] Event routing wired
- [ ] Conductor execution working
- [ ] Plugins load successfully
- [ ] Interactions execute

### Phase 4: Cleanup
- [ ] WebView2 code removed
- [ ] Legacy services removed
- [ ] wwwroot directory removed
- [ ] WebView2 dependency removed
- [ ] Performance optimized
- [ ] Tests updated
- [ ] Documentation updated

## Troubleshooting

### Build Fails
```bash
# Clean and rebuild
dotnet clean
dotnet build -c Debug

# Restore packages
dotnet restore
```

### App Won't Launch
- Check logs for initialization errors
- Verify DI registration
- Check for missing dependencies

### Events Not Firing
- Verify topic names match exactly
- Check subscription order
- Add logging to trace flow

### Performance Issues
- Profile with dotnet-trace
- Check for blocking calls
- Optimize hot paths

## File Structure

```
src/RenderX.Shell.Avalonia/
├── Core/
│   ├── ThinHostLayer.cs (NEW)
│   ├── Conductor/
│   │   └── AvaloniaPluginManager.cs (MODIFY)
│   └── Events/
│       └── AvaloniaEventRouter.cs (DELETE)
├── UI/
│   ├── Views/
│   │   ├── CanvasControl.axaml (NEW)
│   │   ├── CanvasControl.axaml.cs (NEW)
│   │   ├── ControlPanelControl.axaml (NEW)
│   │   ├── ControlPanelControl.axaml.cs (NEW)
│   │   ├── LayoutManager.cs (NEW)
│   │   ├── WebViewHost.axaml (DELETE)
│   │   └── WebViewHost.axaml.cs (DELETE)
│   └── ViewModels/
│       └── MainWindowViewModel.cs (MODIFY)
├── MainWindow.axaml (MODIFY)
├── MainWindow.axaml.cs (MODIFY)
├── Program.cs (MODIFY)
├── RenderX.Shell.Avalonia.csproj (MODIFY)
└── wwwroot/ (DELETE)
```

---

**Version:** 1.0  
**Date:** 2025-11-08

