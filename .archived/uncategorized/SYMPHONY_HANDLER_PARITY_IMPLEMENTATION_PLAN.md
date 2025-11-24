# Symphony Handler Parity Implementation Plan

## Overview
This document outlines the comprehensive plan to achieve parity between the web (TypeScript) and .NET (C#) implementations of symphony handlers.

**Current Status:** Web version has 48 fully functional sequences across 5 plugins. .NET version needs equivalent handlers.

**Reference:** `symphony_report.txt` - Complete analysis of all web sequences and their handlers.

---

## Summary of Required Work

### Plugins & Sequence Counts
1. **canvas-component**: 30 sequences (29 functional + 1 index)
2. **control-panel**: 12 sequences (11 functional + 1 index)
3. **header**: 2 sequences
4. **library**: 1 sequence
5. **library-component**: 3 sequences

**Total: 48 sequences** requiring C# handler implementations

---

## Architecture Pattern

### Web (TypeScript) Pattern
```typescript
// Handler file: src/symphonies/[operation]/[operation].stage-crew.ts
export async function handlerName(data: any, ctx: any) {
  // Implementation
  return result;
}

export const handlers = { handlerName, anotherHandler };
```

### .NET (C#) Pattern
```csharp
// Handler file: Handlers/[Operation]Handlers.cs
namespace RenderX.Plugins.[PluginName].Handlers
{
    public class [Operation]Handlers
    {
        public async Task<object?> HandlerName(dynamic data, dynamic ctx)
        {
            // Implementation
            return result;
        }
    }
}
```

### Sequence Registration
```csharp
// In Plugin initialization
var sequence = new Sequence
{
    Id = "sequence-id",
    Name = "Sequence Name",
    Category = "plugin-name"
};

var movement = new Movement
{
    Id = "movement-id",
    Name = "Movement Name"
};

movement.AddBeat(new Beat
{
    Id = "beat-1",
    Event = "event:name",
    Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => 
        handlers.HandlerName(data, ctx))
});

sequence.AddMovement(movement);
conductor.RegisterSequence(sequence);
```

---

## Detailed Implementation Breakdown

### Phase 1: Canvas Component (30 sequences)

#### 1.1 Copy/Paste Operations (2 sequences)
- **canvas-component-copy-symphony** (3 beats)
  - serializeSelectedComponent
  - copyToClipboard
  - notifyCopyComplete
  
- **canvas-component-paste-symphony** (5 beats)
  - readFromClipboard
  - deserializeComponentData
  - calculatePastePosition
  - createPastedComponent
  - notifyPasteComplete

#### 1.2 CRUD Operations (7 sequences)
- **canvas-component-create-symphony** (6 beats)
  - resolveTemplate
  - registerInstance
  - createNode
  - renderReact
  - notifyUi
  - enhanceLine

- **canvas-component-delete-symphony** (2 beats)
  - deleteComponent
  - publishDeleted

- **canvas-component-delete-requested-symphony** (1 beat)
  - routeDeleteRequest

- **canvas-component-update-symphony** (2 beats)
  - updateAttribute
  - refreshControlPanel

- **canvas-component-update-svg-node-symphony** (2 beats)
  - updateSvgNodeAttribute
  - refreshControlPanel

#### 1.3 Selection Operations (5 sequences)
- **canvas-component-select-symphony** (3 beats)
  - showSelectionOverlay
  - notifyUi
  - publishSelectionChanged

- **canvas-component-select-requested-symphony** (1 beat)
  - routeSelectionRequest

- **canvas-component-select-svg-node-symphony** (1 beat)
  - showSvgNodeOverlay

- **canvas-component-deselect-symphony** (2 beats)
  - deselectComponent
  - publishDeselectionChanged

- **canvas-component-deselect-all-symphony** (2 beats)
  - hideAllOverlays
  - publishSelectionsCleared

- **canvas-component-deselect-requested-symphony** (1 beat)
  - routeDeselectionRequest

#### 1.4 Drag Operations (3 sequences)
- **canvas-component-drag-start-symphony** (1 beat)
  - startDrag

- **canvas-component-drag-move-symphony** (2 beats)
  - updatePosition
  - forwardToControlPanel

- **canvas-component-drag-end-symphony** (1 beat)
  - endDrag

#### 1.5 Resize Operations (6 sequences)
- **canvas-component-resize-start-symphony** (1 beat)
  - startResize

- **canvas-component-resize-move-symphony** (2 beats)
  - updateSize
  - forwardToControlPanel

- **canvas-component-resize-end-symphony** (1 beat)
  - endResize

- **canvas-line-resize-start-symphony** (1 beat)
  - startLineResize

- **canvas-line-resize-move-symphony** (1 beat)
  - updateLine

- **canvas-line-resize-end-symphony** (1 beat)
  - endLineResize

#### 1.6 Line Manipulation (3 sequences)
- **canvas-line-manip-start-symphony** (1 beat)
  - startLineManip

- **canvas-line-manip-move-symphony** (1 beat)
  - moveLineManip

- **canvas-line-manip-end-symphony** (1 beat)
  - endLineManip

#### 1.7 Import/Export Operations (4 sequences)
- **canvas-component-import-symphony** (5 beats)
  - openUiFile
  - parseUiFile
  - injectCssClasses
  - createComponentsSequentially
  - applyHierarchyAndOrder

- **canvas-component-export-symphony** (6 beats)
  - queryAllComponents
  - discoverComponentsFromDom
  - collectCssClasses
  - collectLayoutData
  - buildUiFileContent
  - downloadUiFile

- **canvas-component-export-gif-symphony** (1 beat)
  - exportSvgToGif

- **canvas-component-export-mp4-symphony** (1 beat)
  - exportSvgToMp4

---

### Phase 2: Control Panel (12 sequences)

#### 2.1 CSS Class Management (2 sequences)
- **control-panel-classes-add-symphony** (2 beats)
  - addClass
  - notifyUi

- **control-panel-classes-remove-symphony** (2 beats)
  - removeClass
  - notifyUi

#### 2.2 CSS Management (3 sequences)
- **control-panel-css-create-symphony** (2 beats)
  - createCssClass
  - notifyUi

- **control-panel-css-edit-symphony** (2 beats)
  - updateCssClass
  - notifyUi

- **control-panel-css-delete-symphony** (2 beats)
  - deleteCssClass
  - notifyUi

#### 2.3 UI Operations (5 sequences)
- **control-panel-ui-init-symphony** (6 beats)
  - initConfig
  - initResolver
  - loadSchemas
  - registerObservers
  - notifyReady
  - initMovement

- **control-panel-ui-init-batched-symphony** (6 beats)
  - [Same as ui-init]

- **control-panel-ui-render-symphony** (3 beats)
  - generateFields
  - generateSections
  - renderView

- **control-panel-ui-field-change-symphony** (4 beats)
  - prepareField
  - dispatchField
  - setDirty
  - awaitRefresh

- **control-panel-ui-field-validate-symphony** (3 beats)
  - validateField
  - mergeErrors
  - updateView

- **control-panel-ui-section-toggle-symphony** (1 beat)
  - toggleSection

#### 2.4 Selection & Update (2 sequences)
- **control-panel-selection-show-symphony** (2 beats)
  - deriveSelectionModel
  - notifyUi

- **control-panel-update-symphony** (2 beats)
  - updateFromElement
  - notifyUi

---

### Phase 3: Header (2 sequences)

- **header-ui-theme-get-symphony** (2 beats)
  - getTheme
  - notifyUi

- **header-ui-theme-toggle-symphony** (2 beats)
  - toggleTheme
  - notifyUi

---

### Phase 4: Library (1 sequence)

- **library-load-symphony** (2 beats)
  - loadComponents
  - notifyUi

---

### Phase 5: Library Component (3 sequences)

- **library-component-drag-symphony** (1 beat)
  - onDragStart

- **library-component-drop-symphony** (1 beat)
  - publishCreateRequested

- **library-component-container-drop-symphony** (1 beat)
  - publishCreateRequested

---

## Implementation Strategy

### Step 1: Create Handler Classes
For each plugin, create handler classes organized by feature:
```
src/RenderX.Plugins.[PluginName]/
├── Handlers/
│   ├── CopyPasteHandlers.cs
│   ├── CrudHandlers.cs
│   ├── SelectionHandlers.cs
│   ├── DragHandlers.cs
│   ├── ResizeHandlers.cs
│   └── [Feature]Handlers.cs
├── json-sequences/
│   └── [plugin-name]/
│       └── *.json (already exist, copied from packages/)
└── [PluginName]Plugin.cs
```

### Step 2: Handler Signature Pattern
```csharp
/// <summary>
/// Web version: packages/[package]/src/symphonies/[feature]/[feature].stage-crew.ts:[line]
/// </summary>
public async Task<object?> HandlerName(dynamic data, dynamic ctx)
{
    try
    {
        ctx?.logger?.LogInformation($"🎯 HandlerName: {{data}}", JsonSerializer.Serialize(data));
        
        // Implementation logic
        
        return new { success = true, result = ... };
    }
    catch (Exception ex)
    {
        ctx?.logger?.LogError(ex, "HandlerName failed");
        return new { success = false, error = ex.Message };
    }
}
```

### Step 3: Sequence Registration
In each plugin's initialization method:
```csharp
public void RegisterSequences(IConductorClient conductor, ILogger logger)
{
    var handlers = new [Feature]Handlers(logger, eventBus);
    
    // Register each sequence
    RegisterCopySequence(conductor, handlers);
    RegisterPasteSequence(conductor, handlers);
    // ... etc
}

private void RegisterCopySequence(IConductorClient conductor, [Feature]Handlers handlers)
{
    var sequence = new Sequence
    {
        Id = "canvas-component-copy-symphony",
        Name = "Canvas Component Copy",
        Category = "canvas-component"
    };

    var movement = new Movement
    {
        Id = "copy-to-clipboard",
        Name = "Copy to Clipboard"
    };

    movement.AddBeat(new Beat
    {
        Id = "beat-1",
        Event = "canvas:component:copy:serialize",
        Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => 
            handlers.SerializeSelectedComponent(data, ctx))
    });

    // Add more beats...

    sequence.AddMovement(movement);
    conductor.RegisterSequence(sequence);
}
```

### Step 4: Dependency Injection Setup
Update DI registration in each plugin:
```csharp
services.AddSingleton<CopyPasteHandlers>();
services.AddSingleton<CrudHandlers>();
// ... etc
```

---

## Testing Strategy

### Unit Tests
Create tests for each handler class:
```csharp
[Fact]
public async Task SerializeSelectedComponent_WithValidData_ReturnsClipboardData()
{
    // Arrange
    var handlers = new CopyPasteHandlers(_logger, _eventBus);
    var data = new { id = "test-component" };
    var ctx = new { logger = _logger, payload = new {} };

    // Act
    var result = await handlers.SerializeSelectedComponent(data, ctx);

    // Assert
    Assert.NotNull(result);
    Assert.True(result.success);
}
```

### Integration Tests
Test full sequence execution:
```csharp
[Fact]
public async Task CopySequence_ExecutesAllBeats_Successfully()
{
    // Arrange
    var conductor = _serviceProvider.GetRequiredService<IConductorClient>();

    // Act
    var result = await conductor.Play("CanvasComponentPlugin", 
        "canvas-component-copy-symphony", 
        new { id = "test-component" });

    // Assert
    Assert.NotNull(result);
}
```

---

## Success Criteria

1. ✅ All 48 sequences have registered C# handlers
2. ✅ All JSON sequence definitions copied to .NET plugin folders  
3. ✅ All sequences registered with Musical Conductor
4. ✅ Handlers emit proper log messages with emoji icons (matching web version)
5. ✅ Unit tests pass for all handler methods
6. ✅ Integration tests verify full sequence execution
7. ✅ Event routing works correctly between plugins
8. ✅ No regressions in existing functionality

---

## Dependencies & Prerequisites

### Required Services
- `IEventBus` - For event routing and pub/sub
- `ILogger<T>` - For logging (with ConductorAwareLogger wrapping)
- `IConductorClient` - For sequence registration and execution
- `IEventRouter` - For topic-based routing

### Platform Considerations
- **Clipboard**: .NET clipboard API differs from browser navigator.clipboard
- **File I/O**: Use Avalonia file pickers instead of HTML input elements
- **DOM Manipulation**: Will need Avalonia control tree equivalents
- **CSS Injection**: Style management through Avalonia Styles system

---

## Timeline Estimate

- **Phase 1 (Canvas Component)**: 5-7 days
- **Phase 2 (Control Panel)**: 3-4 days  
- **Phase 3 (Header)**: 1 day
- **Phase 4 (Library)**: 1 day
- **Phase 5 (Library Component)**: 1 day
- **Testing & Integration**: 2-3 days

**Total Estimate: 13-18 days**

---

## Notes

- Some handlers may be stubs initially (e.g., React rendering, GIF/MP4 export)
- Focus on core interactive sequences first (copy/paste, drag, resize, select)
- Ensure proper error handling and logging in all handlers
- Maintain consistency with web version's behavior and event names
- Document any .NET-specific adaptations or limitations

---

**Last Updated:** 2025-11-09
**Status:** Ready for implementation
