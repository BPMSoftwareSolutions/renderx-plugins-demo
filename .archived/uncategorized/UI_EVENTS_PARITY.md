# UI Events Parity - Web vs Desktop

**Status:** ✅ Keyboard Shortcuts Implemented | 🚧 Click Selectors Deferred  
**Date:** November 9, 2025  
**ADR Reference:** ADR-0037 (Data-driven UI Event Wiring via JSON manifest)

## Overview

The web version uses a manifest-driven approach for UI event wiring (`src/core/manifests/uiEvents.json`). The desktop .NET version now has **parity for keyboard shortcuts**, with click selector support deferred for future implementation.

## Architecture Comparison

### Web Version (TypeScript)
**File:** `src/ui/events/wiring.ts`
- Loads events from `uiEvents.json`
- Supports window events AND element selectors (`#rx-canvas`)
- Attaches listeners via DOM API
- Guards: key, modifiers, `notClosestMatch` selector
- Publishes to `EventRouter.publish()`

### Desktop Version (C#)
**Files:** 
- `src/RenderX.Shell.Avalonia/Infrastructure/Events/UiEventService.cs`
- `src/RenderX.Shell.Avalonia/Infrastructure/Events/UiEventDef.cs`
- `src/RenderX.Shell.Avalonia/Infrastructure/Events/IUiEventService.cs`

- Loads events from `manifests/uiEvents.json`
- Supports **window-level keyboard events** ✅
- Supports element selectors 🚧 (deferred - not critical path)
- Attaches listeners via Avalonia Input system
- Guards: key, modifiers (Ctrl, Meta/Cmd, Shift, Alt)
- Publishes to `IEventRouter.PublishAsync()`

## Implemented Features ✅

### 1. Manifest Structure (100% Parity)

Both versions use identical JSON structure:

```json
{
  "id": "canvas.deselect.onEscape",
  "target": { "window": true },
  "event": "keydown",
  "guard": { "key": "Escape" },
  "publish": { "topic": "canvas.component.deselect.requested", "payload": {} }
}
```

**C# Models:**
- `UiEventDef` - Main event definition
- `EventTarget` - window or selector
- `EventGuard` - Key and modifier conditions
- `EventPublish` - Topic and payload

### 2. Keyboard Shortcuts (100% Parity)

| Shortcut | Topic Published | Web | Desktop |
|----------|----------------|-----|---------|
| **Escape** | `canvas.component.deselect.requested` | ✅ | ✅ |
| **Delete** | `canvas.component.delete.requested` | ✅ | ✅ |
| **Ctrl+C** | `canvas.component.copy` | ✅ | ✅ |
| **Cmd+C** (Mac) | `canvas.component.copy` | ✅ | ✅ |
| **Ctrl+V** | `canvas.component.paste` | ✅ | ✅ |
| **Cmd+V** (Mac) | `canvas.component.paste` | ✅ | ✅ |

### 3. Guard Conditions (100% Parity)

Both versions support:
- ✅ `key` - Specific key check (Escape, Delete, c, v, etc.)
- ✅ `ctrlKey` - Control modifier
- ✅ `metaKey` - Command/Meta modifier (Mac)
- ✅ `shiftKey` - Shift modifier
- ✅ `altKey` - Alt modifier

### 4. Integration Points (100% Parity)

**Web:**
```typescript
// src/ui/App/App.tsx
React.useEffect(() => {
  const cleanup = wireUiEvents(uiEventDefs as any);
  return () => cleanup();
}, []);
```

**Desktop:**
```csharp
// src/RenderX.Shell.Avalonia/MainWindow.axaml.cs
_uiEventService = _serviceProvider.GetRequiredService<IUiEventService>();
var uiEventsManifestPath = Path.Combine(AppContext.BaseDirectory, "manifests", "uiEvents.json");
await _uiEventService.WireEventsAsync(uiEventsManifestPath);
_uiEventService.RegisterHandlers(this);
```

## Deferred Features 🚧

### Click Event Selectors (Not Critical)

**Web Implementation:**
```json
{
  "id": "canvas.deselect.onCanvasClick",
  "target": { "selector": "#rx-canvas" },
  "event": "click",
  "guard": { "notClosestMatch": ".rx-comp,[id^='rx-node-']" },
  "publish": { "topic": "canvas.component.deselect.requested" }
}
```

**Desktop Status:**
- ❌ Element selector queries not yet implemented
- ❌ Click event handling not yet implemented  
- ❌ `notClosestMatch` guard not yet implemented

**Rationale for Deferral:**
1. **Keyboard shortcuts are higher priority** - User productivity depends on Escape/Delete/Copy/Paste
2. **Canvas click events can be handled directly** - CanvasControl.axaml.cs has pointer event handlers
3. **Selector-based events require Visual Tree traversal** - More complex implementation
4. **Web uses DOM queries** - Need Avalonia equivalent (FindControl, AutomationId queries)

**Future Implementation Path:**
1. Enhance `UiEventService.WireEvent()` to handle selectors
2. Add Visual Tree search by AutomationId or Name
3. Attach PointerPressed/Released handlers dynamically
4. Implement `notClosestMatch` guard using Visual Tree ancestry check

## Canvas Element Parity ✅

**Critical Fix Applied:**

The Canvas element in `CanvasControl.axaml` now has proper identification:

```xml
<Canvas Background="White" 
        Name="rxCanvas"
        AutomationProperties.AutomationId="rx-canvas"/>
```

- ✅ `Name="rxCanvas"` - For FindControl<Canvas>("rxCanvas")
- ✅ `AutomationProperties.AutomationId="rx-canvas"` - For UI automation and future selector queries
- ✅ Matches web `<div id="rx-canvas">` semantic equivalent

## Service Registration

**Desktop DI Container:**
```csharp
// src/RenderX.Shell.Avalonia/Program.cs
services.AddSingleton<IUiEventService, UiEventService>();
```

## Event Flow Diagram

```
User Presses Key
       ↓
MainWindow KeyDown Event (Avalonia)
       ↓
UiEventService Event Handler
       ↓
Check Guards (key, modifiers)
       ↓ (guards pass)
IEventRouter.PublishAsync(topic, payload)
       ↓
Event Bus (Musical Conductor)
       ↓
Plugin Handlers Subscribe to Topics
       ↓
Execute Handler Sequences
```

## Testing Verification

### Manual Testing Checklist

- [ ] **Escape Key**
  1. Launch application
  2. Press Escape
  3. Verify event published: `canvas.component.deselect.requested`
  4. Check logs: `🎹 UI event triggered: canvas.deselect.onEscape -> canvas.component.deselect.requested`

- [ ] **Delete Key**
  1. Press Delete
  2. Verify event published: `canvas.component.delete.requested`
  3. Check logs for UI event trigger

- [ ] **Ctrl+C (Copy)**
  1. Press Ctrl+C (or Cmd+C on Mac)
  2. Verify event published: `canvas.component.copy`
  3. Check logs for UI event trigger

- [ ] **Ctrl+V (Paste)**
  1. Press Ctrl+V (or Cmd+V on Mac)
  2. Verify event published: `canvas.component.paste`
  3. Check logs for UI event trigger

### Log File Verification

Check `.logs/renderx-*.log` for entries like:

```
[2025-11-09 HH:mm:ss.fff] [INF] RenderX.Shell.Avalonia.Infrastructure.Events.UiEventService: 🎹 Wiring 7 UI events from manifest
[2025-11-09 HH:mm:ss.fff] [DBG] RenderX.Shell.Avalonia.Infrastructure.Events.UiEventService: ✅ Wired UI event: canvas.deselect.onEscape
[2025-11-09 HH:mm:ss.fff] [DBG] RenderX.Shell.Avalonia.Infrastructure.Events.UiEventService: ✅ Wired UI event: canvas.delete.onDelete
[2025-11-09 HH:mm:ss.fff] [INF] RenderX.Shell.Avalonia.Infrastructure.Events.UiEventService: ✅ Registered 6 keyboard event handlers
```

When keys are pressed:
```
[2025-11-09 HH:mm:ss.fff] [DBG] RenderX.Shell.Avalonia.Infrastructure.Events.UiEventService: 🎹 UI event triggered: canvas.deselect.onEscape -> canvas.component.deselect.requested
[2025-11-09 HH:mm:ss.fff] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: 📤 Publishing event: canvas.component.deselect.requested
```

## Files Created/Modified

### New Files ✨
1. `src/RenderX.Shell.Avalonia/Infrastructure/Events/UiEventDef.cs` - Model classes
2. `src/RenderX.Shell.Avalonia/Infrastructure/Events/IUiEventService.cs` - Service interface
3. `src/RenderX.Shell.Avalonia/Infrastructure/Events/UiEventService.cs` - Service implementation
4. `src/RenderX.Shell.Avalonia/manifests/uiEvents.json` - Event definitions (copied from web)

### Modified Files 🔧
1. `src/RenderX.Shell.Avalonia/Program.cs` - Added UiEventService registration
2. `src/RenderX.Shell.Avalonia/MainWindow.axaml.cs` - Wire UI event service on load
3. `src/RenderX.Shell.Avalonia/RenderX.Shell.Avalonia.csproj` - Copy manifests to output
4. `src/RenderX.Plugins.Canvas/CanvasControl.axaml` - Added AutomationId to Canvas element

## Benefits

✅ **Manifest-Driven** - Add/modify keyboard shortcuts via JSON, no code changes  
✅ **Centralized Configuration** - Single source of truth for UI event bindings  
✅ **Web/Desktop Parity** - Both versions use same manifest structure  
✅ **Maintainable** - Easy to understand what shortcuts exist  
✅ **Testable** - Clear contract between events and topics  
✅ **Extensible** - Future: Add click selectors, custom guards, more events  

## Conclusion

**Keyboard shortcut parity is COMPLETE** ✅

The desktop version now has full parity with the web version for the most critical UI event use case: keyboard shortcuts. Click selector support is intentionally deferred as it's not on the critical path and can be added when needed.

Both versions:
- Load events from `uiEvents.json` manifest
- Support all standard keyboard shortcuts (Escape, Delete, Copy, Paste)
- Support platform-specific modifiers (Ctrl vs Cmd)
- Publish to event topics via EventRouter
- Follow ADR-0037 manifest-driven architecture

## Next Steps

1. ✅ **Complete** - Keyboard shortcuts implemented
2. 🔄 **In Progress** - Testing and verification
3. 🚧 **Future** - Click selector support when needed
4. 🚧 **Future** - Custom element event handlers
5. 🚧 **Future** - More complex guards and conditions

---

**Related Documentation:**
- ADR-0037: Data-driven UI Event Wiring via JSON manifest
- Web Implementation: `src/ui/events/wiring.ts`
- Test Suite: `tests/ui-event-wiring.spec.ts`
