# Drag Ghost Image Implementation Plan

**Date:** November 9, 2025  
**Priority:** 🔴 HIGH  
**Estimated Effort:** 5-7 days  
**Status:** NOT STARTED

---

## 🎯 Overview

Implement custom drag preview/ghost image functionality for the Library plugin desktop (Avalonia) version to achieve parity with the web implementation. This feature significantly improves UX by showing users exactly what they're dragging.

### Current State
- ✅ **Web:** Fully implemented with sophisticated ghost image rendering
- ❌ **Desktop:** Completely missing - no drag preview

### Impact
- **UX:** Users see what they're dragging (clear visual feedback)
- **Accuracy:** Better component placement precision
- **Polish:** Professional, polished appearance

---

## 📋 Implementation Phases

### Phase 1: Foundation (2 days)
1. Research Avalonia drag/drop architecture
2. Create `DragAdorner.cs` class
3. Create `DragGhostHelper.cs` class
4. Write unit tests

### Phase 2: Integration (2 days)
1. Integrate with `LibraryPreview.axaml.cs`
2. Integrate with `LibraryPanel.axaml.cs`
3. Test drag operations
4. Polish animations

### Phase 3: Testing & Polish (1-2 days)
1. Manual testing in running app
2. Cross-platform testing
3. Performance optimization
4. Final polish

---

## 🏗️ Architecture

### DragAdorner.cs (New File)
```csharp
public class DragAdorner : Adorner
{
    // Properties
    public double LeftOffset { get; set; }
    public double TopOffset { get; set; }
    public Control? Content { get; set; }
    
    // Methods
    public override void Render(DrawingContext context);
    public void UpdatePosition(double x, double y);
}
```

**Responsibilities:**
- Render component preview during drag
- Update position based on cursor
- Handle styling and transforms
- Clean up resources

### DragGhostHelper.cs (New File)
```csharp
public static class DragGhostHelper
{
    // Methods
    public static DragAdorner CreateGhost(Control component, double width, double height);
    public static void ApplyComponentStyles(DragAdorner adorner, Control component);
    public static (double offsetX, double offsetY) ComputeCursorOffsets(
        PointerEventArgs e, Control targetEl, double width, double height);
    public static void InstallGhost(AdornerLayer layer, DragAdorner adorner);
    public static void RemoveGhost(AdornerLayer layer, DragAdorner adorner);
}
```

**Responsibilities:**
- Create ghost adorner instances
- Apply component styling to ghost
- Calculate cursor offsets
- Manage adorner layer lifecycle

---

## 🔄 Integration Points

### LibraryPreview.axaml.cs
```csharp
private DragAdorner? _dragAdorner;

private void OnPointerPressed(object? sender, PointerPressedEventArgs e)
{
    // Start drag operation
    var data = new DataObject();
    data.Set(DataFormats.Text, ComponentData);
    
    // Create ghost image
    _dragAdorner = DragGhostHelper.CreateGhost(this, Width, Height);
    DragGhostHelper.ApplyComponentStyles(_dragAdorner, this);
    
    // Install adorner
    var layer = AdornerLayer.GetAdornerLayer(this);
    DragGhostHelper.InstallGhost(layer, _dragAdorner);
    
    // Start drag
    DragDrop.DoDragDrop(e, data, DragDropEffects.Copy);
}

private void OnPointerMoved(object? sender, PointerEventArgs e)
{
    if (_dragAdorner != null)
    {
        var pos = e.GetPosition(null);
        _dragAdorner.UpdatePosition(pos.X, pos.Y);
    }
}

private void OnDragEnd()
{
    if (_dragAdorner != null)
    {
        var layer = AdornerLayer.GetAdornerLayer(this);
        DragGhostHelper.RemoveGhost(layer, _dragAdorner);
        _dragAdorner = null;
    }
}
```

### LibraryPanel.axaml.cs
- Similar integration for component cards
- Reuse DragGhostHelper for consistency
- Handle multiple draggable items

---

## 🧪 Testing Strategy

### Unit Tests (DragGhostTests.cs)
1. **DragAdorner Tests**
   - Render correctly
   - Update position
   - Handle styling

2. **DragGhostHelper Tests**
   - Create ghost with correct dimensions
   - Apply styles correctly
   - Calculate offsets accurately
   - Install/remove from adorner layer

### Integration Tests
1. Drag from LibraryPreview
2. Drag from LibraryPanel
3. Verify ghost appears
4. Verify ghost follows cursor
5. Verify ghost disappears on drop

### Manual Testing
1. Visual appearance matches web
2. Cursor positioning is accurate
3. Performance is smooth
4. No memory leaks
5. Works on Windows/macOS/Linux

---

## 📊 Success Criteria

- ✅ Ghost image appears during drag
- ✅ Ghost follows cursor accurately
- ✅ Ghost disappears on drop
- ✅ Styling matches component
- ✅ No performance degradation
- ✅ All tests pass
- ✅ Build succeeds (0 errors)
- ✅ Feature parity with web

---

## 🔗 Related Files

### Files to Create
- `src/RenderX.Plugins.Library/DragAdorner.cs`
- `src/RenderX.Plugins.Library/DragGhostHelper.cs`
- `src/RenderX.Plugins.Library.Tests/DragGhostTests.cs`

### Files to Modify
- `src/RenderX.Plugins.Library/LibraryPreview.axaml.cs`
- `src/RenderX.Plugins.Library/LibraryPanel.axaml.cs`

### Reference Files (Web Implementation)
- `packages/library-component/src/symphonies/drag.symphony.ts`
- `packages/library-component/src/symphonies/drag/drag.preview.stage-crew.ts`
- `packages/library/src/ui/LibraryPreview.tsx`

---

## 📚 Resources

### Avalonia Documentation
- Adorner Layer: https://docs.avaloniaui.net/docs/concepts/adorners
- Drag and Drop: https://docs.avaloniaui.net/docs/concepts/input/drag-and-drop
- Pointer Events: https://docs.avaloniaui.net/docs/concepts/input/pointer

### Web Implementation Reference
- Ghost image creation: `drag.preview.stage-crew.ts` lines 30-60
- Cursor offset calculation: `drag.preview.stage-crew.ts` lines 80-100
- Style application: `drag.preview.stage-crew.ts` lines 110-140

---

## ⏱️ Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Research** | 0.5 days | Study Avalonia architecture |
| **DragAdorner** | 1 day | Create and test adorner |
| **DragGhostHelper** | 1 day | Create and test helper |
| **LibraryPreview** | 1 day | Integrate with preview |
| **LibraryPanel** | 1 day | Integrate with panel |
| **Testing & Polish** | 1-2 days | Manual testing, optimization |
| **Total** | **5-7 days** | |

---

## 🚀 Next Steps

1. ✅ Review this plan
2. ⏳ Start Phase 1: Research
3. ⏳ Create DragAdorner.cs
4. ⏳ Create DragGhostHelper.cs
5. ⏳ Write unit tests
6. ⏳ Integrate with LibraryPreview
7. ⏳ Integrate with LibraryPanel
8. ⏳ Manual testing
9. ⏳ Commit and push

---

**Status:** Ready to start implementation  
**Branch:** `feature/issue-384-log-parity`  
**Related Issue:** #389 (Log Parity)

