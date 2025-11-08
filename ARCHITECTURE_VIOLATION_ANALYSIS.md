# Architecture Violation Analysis 🚨

## Summary

The agents have successfully fixed the **SHELL001 violations** (custom SDK implementations), but they've introduced a **NEW ARCHITECTURAL VIOLATION**: The MainWindow is still mounting **WebViewHost** instead of native Avalonia controls.

---

## The Problem

### Current Implementation (WRONG ❌)
```csharp
// MainWindow.axaml.cs, lines 63-71
var canvasSlot = this.FindControl<Border>("Canvas");
if (canvasSlot != null)
{
    var webViewHost = new WebViewHost();  // ❌ WRONG!
    canvasSlot.Child = webViewHost;
    await webViewHost.InitializeWebViewAsync(this);
}
```

### What Should Happen (CORRECT ✅)
```csharp
// MainWindow.axaml.cs, lines 63-71
var canvasSlot = this.FindControl<Border>("Canvas");
if (canvasSlot != null)
{
    var canvasControl = new CanvasControl();  // ✅ CORRECT!
    canvasSlot.Child = canvasControl;
    // Initialize with SDK services from ThinHostLayer
    canvasControl.Initialize(
        thinHostLayer.EventRouter,
        thinHostLayer.Conductor,
        canvasLogger);
}
```

---

## Why This Is Wrong

### 1. **Violates Thin-Host Pattern**
- WebViewHost is the **old WebView2 architecture** (Phase 4 cleanup item)
- Should be using **native Avalonia controls** (CanvasControl, ControlPanelControl)
- This is a **regression** to the old architecture

### 2. **Defeats the Purpose of Phase 2**
- Phase 2 created CanvasControl and ControlPanelControl
- They're not being used!
- The native controls are sitting unused while WebViewHost is mounted

### 3. **Blocks Phase 4 Cleanup**
- Phase 4 is supposed to remove WebView2
- But if MainWindow is still using WebViewHost, Phase 4 can't complete
- Creates a circular dependency

### 4. **Wrong Slot Architecture**
The MainWindow should mount:
- **Canvas slot**: CanvasControl (native Avalonia)
- **ControlPanel slot**: ControlPanelControl (native Avalonia)
- **Library slot**: LibraryPanel (from plugin)
- **Header slots**: Plugin-provided header components

---

## What Needs to Be Fixed

### In MainWindow.axaml.cs

**Current (lines 63-71):**
```csharp
// Mount WebViewHost into Canvas slot
var canvasSlot = this.FindControl<Border>("Canvas");
if (canvasSlot != null)
{
    var webViewHost = new WebViewHost();
    canvasSlot.Child = webViewHost;
    await webViewHost.InitializeWebViewAsync(this);
    _logger.LogInformation("WebViewHost mounted in Canvas slot");
}
```

**Should be:**
```csharp
// Mount native Avalonia controls into slots
var canvasSlot = this.FindControl<Border>("Canvas");
if (canvasSlot != null)
{
    var canvasControl = new CanvasControl();
    var canvasLogger = _serviceProvider.GetRequiredService<ILogger<CanvasControl>>();
    canvasControl.Initialize(
        thinHostLayer.EventRouter,
        thinHostLayer.Conductor,
        canvasLogger);
    canvasSlot.Child = canvasControl;
    _logger.LogInformation("CanvasControl mounted in Canvas slot");
}

var controlPanelSlot = this.FindControl<Border>("ControlPanel");
if (controlPanelSlot != null)
{
    var controlPanelControl = new ControlPanelControl();
    var controlPanelLogger = _serviceProvider.GetRequiredService<ILogger<ControlPanelControl>>();
    controlPanelControl.Initialize(
        thinHostLayer.EventRouter,
        thinHostLayer.Conductor,
        controlPanelLogger);
    controlPanelSlot.Child = controlPanelControl;
    _logger.LogInformation("ControlPanelControl mounted in ControlPanel slot");
}
```

---

## Status

✅ **SHELL001 violations**: FIXED (zero violations)  
❌ **Thin-host architecture**: VIOLATED (WebViewHost still in use)  
❌ **Phase 2 controls**: NOT BEING USED  
❌ **Phase 4 cleanup**: BLOCKED  

---

## Root Cause

The agents focused on fixing the **SHELL001 violations** (custom SDK implementations) but didn't understand the **broader architectural goal**: Replace WebView2 with native Avalonia controls.

They fixed the code violations but missed the architectural intent.

---

## Next Steps

1. **Update MainWindow.axaml.cs** to mount CanvasControl and ControlPanelControl
2. **Remove WebViewHost** from the Canvas slot
3. **Initialize controls** with SDK services from ThinHostLayer
4. **Verify** the native controls render correctly
5. **Test** event routing between controls

---

**Severity**: HIGH - Architectural regression  
**Impact**: Blocks Phase 4, defeats Phase 2 work  
**Fix Effort**: 30 minutes  
**Status**: NEEDS IMMEDIATE FIX

