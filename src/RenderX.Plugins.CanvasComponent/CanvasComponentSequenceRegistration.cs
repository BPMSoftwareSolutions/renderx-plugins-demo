using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.CanvasComponent.Handlers;

namespace RenderX.Plugins.CanvasComponent;

/// <summary>
/// Sequence registration helpers for CanvasComponent plugin.
/// Contains all 30 sequence registration methods.
/// </summary>
public static class CanvasComponentSequenceRegistration
{
    public static void RegisterAllSequences(
        List<ISequence> sequences,
        CopyPasteHandlers copyPasteHandlers,
        SelectionHandlers selectionHandlers,
        DragHandlers dragHandlers,
        ResizeHandlers resizeHandlers,
        CrudHandlers crudHandlers,
        LineManipHandlers lineManipHandlers,
        ImportExportHandlers importExportHandlers)
    {
        RegisterCopySequence(sequences, copyPasteHandlers);
        RegisterPasteSequence(sequences, copyPasteHandlers);
        RegisterSelectSequence(sequences, selectionHandlers);
        RegisterSelectRequestedSequence(sequences, selectionHandlers);
        RegisterSelectSvgNodeSequence(sequences, selectionHandlers);
        RegisterDeselectSequence(sequences, selectionHandlers);
        RegisterDeselectAllSequence(sequences, selectionHandlers);
        RegisterDeselectRequestedSequence(sequences, selectionHandlers);
        RegisterDragStartSequence(sequences, dragHandlers);
        RegisterDragMoveSequence(sequences, dragHandlers);
        RegisterDragEndSequence(sequences, dragHandlers);
        RegisterResizeStartSequence(sequences, resizeHandlers);
        RegisterResizeMoveSequence(sequences, resizeHandlers);
        RegisterResizeEndSequence(sequences, resizeHandlers);
        RegisterLineResizeStartSequence(sequences, resizeHandlers);
        RegisterLineResizeMoveSequence(sequences, resizeHandlers);
        RegisterLineResizeEndSequence(sequences, resizeHandlers);
        RegisterCreateSequence(sequences, crudHandlers);
        RegisterUpdateSequence(sequences, crudHandlers);
        RegisterUpdateSvgNodeSequence(sequences, crudHandlers);
        RegisterDeleteSequence(sequences, crudHandlers);
        RegisterDeleteRequestedSequence(sequences, crudHandlers);
        RegisterLineManipStartSequence(sequences, lineManipHandlers);
        RegisterLineManipMoveSequence(sequences, lineManipHandlers);
        RegisterLineManipEndSequence(sequences, lineManipHandlers);
        RegisterImportSequence(sequences, importExportHandlers);
        RegisterExportSequence(sequences, importExportHandlers);
        RegisterExportGifSequence(sequences, importExportHandlers);
        RegisterExportMp4Sequence(sequences, importExportHandlers);
    }

    private static void RegisterCopySequence(List<ISequence> sequences, CopyPasteHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "canvas-component-copy-symphony",
            Name = "Canvas Component Copy",
            Category = "canvas-component",
            Description = "Copy selected component to clipboard"
        };

        var movement = new Movement { Id = "copy-movement", Name = "Copy Movement" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "canvas:component:copy:serialize",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.SerializeSelectedComponent(data, ctx))
        });
        movement.AddBeat(new Beat
        {
            Id = "beat-2",
            Event = "canvas:component:copy:clipboard",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.CopyToClipboard(data, ctx))
        });
        movement.AddBeat(new Beat
        {
            Id = "beat-3",
            Event = "canvas:component:copy:notify",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.NotifyCopyComplete(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterPasteSequence(List<ISequence> sequences, CopyPasteHandlers handlers)
    {
        var sequence = new Sequence
        {
            Id = "canvas-component-paste-symphony",
            Name = "Canvas Component Paste",
            Category = "canvas-component",
            Description = "Paste component from clipboard"
        };

        var movement = new Movement { Id = "paste-movement", Name = "Paste Movement" };
        movement.AddBeat(new Beat
        {
            Id = "beat-1",
            Event = "canvas:component:paste:clipboard",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ReadFromClipboard(data, ctx))
        });
        movement.AddBeat(new Beat
        {
            Id = "beat-2",
            Event = "canvas:component:paste:deserialize",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.DeserializeComponentData(data, ctx))
        });
        movement.AddBeat(new Beat
        {
            Id = "beat-3",
            Event = "canvas:component:paste:position",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.CalculatePastePosition(data, ctx))
        });
        movement.AddBeat(new Beat
        {
            Id = "beat-4",
            Event = "canvas:component:paste:create",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.CreatePastedComponent(data, ctx))
        });
        movement.AddBeat(new Beat
        {
            Id = "beat-5",
            Event = "canvas:component:paste:notify",
            Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.NotifyPasteComplete(data, ctx))
        });

        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    // Continue with the remaining 28 sequences...
    // NOTE: Due to file size, implement remaining registration methods following the same pattern

    private static void RegisterSelectSequence(List<ISequence> sequences, SelectionHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-select-symphony", Name = "Canvas Component Select", Category = "canvas-component" };
        var movement = new Movement { Id = "select-movement", Name = "Select Movement" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:select", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ShowSelectionOverlay(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:select:notify", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.NotifyUi(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-3", Event = "canvas:component:selection:changed", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.PublishSelectionChanged(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterSelectRequestedSequence(List<ISequence> sequences, SelectionHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-select-requested-symphony", Name = "Canvas Component Select Requested", Category = "canvas-component" };
        var movement = new Movement { Id = "route-selection", Name = "Route Selection" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:select:route", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RouteSelectionRequest(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterSelectSvgNodeSequence(List<ISequence> sequences, SelectionHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-select-svg-node-symphony", Name = "Canvas Component Select SVG Node", Category = "canvas-component" };
        var movement = new Movement { Id = "select-svg-node", Name = "Select SVG Node" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:select:svg-node", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ShowSvgNodeOverlay(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDeselectSequence(List<ISequence> sequences, SelectionHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-deselect-symphony", Name = "Canvas Component Deselect", Category = "canvas-component" };
        var movement = new Movement { Id = "deselect-movement", Name = "Deselect Movement" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:deselect", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.DeselectComponent(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:deselection:changed", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.PublishDeselectionChanged(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDeselectAllSequence(List<ISequence> sequences, SelectionHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-deselect-all-symphony", Name = "Canvas Component Deselect All", Category = "canvas-component" };
        var movement = new Movement { Id = "deselect-all", Name = "Deselect All" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:deselect:all", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.HideAllOverlays(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:selections:cleared", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.PublishSelectionsCleared(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDeselectRequestedSequence(List<ISequence> sequences, SelectionHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-deselect-requested-symphony", Name = "Canvas Component Deselect Requested", Category = "canvas-component" };
        var movement = new Movement { Id = "route-deselection", Name = "Route Deselection" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:deselect:route", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RouteDeselectionRequest(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDragStartSequence(List<ISequence> sequences, DragHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-drag-start-symphony", Name = "Canvas Component Drag Start", Category = "canvas-component" };
        var movement = new Movement { Id = "drag-start", Name = "Drag Start" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:drag:start", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.StartDrag(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDragMoveSequence(List<ISequence> sequences, DragHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-drag-move-symphony", Name = "Canvas Component Drag Move", Category = "canvas-component" };
        var movement = new Movement { Id = "drag-move", Name = "Drag Move" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:drag:move", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.UpdatePosition(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:drag:forward", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ForwardToControlPanel(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDragEndSequence(List<ISequence> sequences, DragHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-drag-end-symphony", Name = "Canvas Component Drag End", Category = "canvas-component" };
        var movement = new Movement { Id = "drag-end", Name = "Drag End" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:drag:end", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.EndDrag(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterResizeStartSequence(List<ISequence> sequences, ResizeHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-resize-start-symphony", Name = "Canvas Component Resize Start", Category = "canvas-component" };
        var movement = new Movement { Id = "resize-start", Name = "Resize Start" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:resize:start", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.StartResize(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterResizeMoveSequence(List<ISequence> sequences, ResizeHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-resize-move-symphony", Name = "Canvas Component Resize Move", Category = "canvas-component" };
        var movement = new Movement { Id = "resize-move", Name = "Resize Move" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:resize:move", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.UpdateSize(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterResizeEndSequence(List<ISequence> sequences, ResizeHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-resize-end-symphony", Name = "Canvas Component Resize End", Category = "canvas-component" };
        var movement = new Movement { Id = "resize-end", Name = "Resize End" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:resize:end", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.EndResize(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterLineResizeStartSequence(List<ISequence> sequences, ResizeHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-line-resize-start-symphony", Name = "Canvas Line Resize Start", Category = "canvas-component" };
        var movement = new Movement { Id = "line-resize-start", Name = "Line Resize Start" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:resize:line:start", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.StartLineResize(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterLineResizeMoveSequence(List<ISequence> sequences, ResizeHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-line-resize-move-symphony", Name = "Canvas Line Resize Move", Category = "canvas-component" };
        var movement = new Movement { Id = "line-resize-move", Name = "Line Resize Move" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:resize:line:move", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.UpdateLine(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterLineResizeEndSequence(List<ISequence> sequences, ResizeHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-line-resize-end-symphony", Name = "Canvas Line Resize End", Category = "canvas-component" };
        var movement = new Movement { Id = "line-resize-end", Name = "Line Resize End" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:resize:line:end", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.EndLineResize(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterCreateSequence(List<ISequence> sequences, CrudHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-create-symphony", Name = "Canvas Component Create", Category = "canvas-component" };
        var movement = new Movement { Id = "create-movement", Name = "Create Movement" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:create:resolve", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ResolveTemplate(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:create:register", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RegisterInstance(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-3", Event = "canvas:component:create:node", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.CreateNode(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-4", Event = "canvas:component:create:react", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RenderReact(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-5", Event = "canvas:component:create:notify", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.NotifyUi(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-6", Event = "canvas:component:augment:line", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.EnhanceLine(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUpdateSequence(List<ISequence> sequences, CrudHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-update-symphony", Name = "Canvas Component Update", Category = "canvas-component" };
        var movement = new Movement { Id = "update-movement", Name = "Update Movement" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:update:attribute", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.UpdateAttribute(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:update:refresh", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RefreshControlPanel(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterUpdateSvgNodeSequence(List<ISequence> sequences, CrudHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-update-svg-node-symphony", Name = "Canvas Component Update SVG Node", Category = "canvas-component" };
        var movement = new Movement { Id = "update-svg-node", Name = "Update SVG Node" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:update:svg-node:attribute", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.UpdateSvgNodeAttribute(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:update:svg-node:refresh", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RefreshControlPanel(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDeleteSequence(List<ISequence> sequences, CrudHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-delete-symphony", Name = "Canvas Component Delete", Category = "canvas-component" };
        var movement = new Movement { Id = "delete-movement", Name = "Delete Movement" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:delete", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.DeleteComponent(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:deleted", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.PublishDeleted(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterDeleteRequestedSequence(List<ISequence> sequences, CrudHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-delete-requested-symphony", Name = "Canvas Component Delete Requested", Category = "canvas-component" };
        var movement = new Movement { Id = "route-delete", Name = "Route Delete" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:delete:route", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.RouteDeleteRequest(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterLineManipStartSequence(List<ISequence> sequences, LineManipHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-line-manip-start-symphony", Name = "Canvas Line Manipulation Start", Category = "canvas-component" };
        var movement = new Movement { Id = "line-manip-start", Name = "Line Manip Start" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:manip:line:start", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.StartLineManip(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterLineManipMoveSequence(List<ISequence> sequences, LineManipHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-line-manip-move-symphony", Name = "Canvas Line Manipulation Move", Category = "canvas-component" };
        var movement = new Movement { Id = "line-manip-move", Name = "Line Manip Move" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:manip:line:move", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.MoveLineManip(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterLineManipEndSequence(List<ISequence> sequences, LineManipHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-line-manip-end-symphony", Name = "Canvas Line Manipulation End", Category = "canvas-component" };
        var movement = new Movement { Id = "line-manip-end", Name = "Line Manip End" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:manip:line:end", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.EndLineManip(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterImportSequence(List<ISequence> sequences, ImportExportHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-import-symphony", Name = "Canvas Component Import", Category = "canvas-component" };
        var movement = new Movement { Id = "import-movement", Name = "Import Movement" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:ui:open", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.OpenUiFile(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:ui:parse", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ParseUiFile(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-3", Event = "canvas:component:css:inject", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.InjectCssClasses(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-4", Event = "canvas:component:nodes:create", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.CreateComponentsSequentially(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-5", Event = "canvas:component:hierarchy:apply", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ApplyHierarchyAndOrder(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterExportSequence(List<ISequence> sequences, ImportExportHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-export-symphony", Name = "Canvas Component Export", Category = "canvas-component" };
        var movement = new Movement { Id = "export-movement", Name = "Export Movement" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:query-all", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.QueryAllComponents(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-2", Event = "canvas:component:discover-components", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.DiscoverComponentsFromDom(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-3", Event = "canvas:component:collect-css", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.CollectCssClasses(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-4", Event = "canvas:component:collect-layout", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.CollectLayoutData(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-5", Event = "canvas:component:build-ui-file", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.BuildUiFileContent(data, ctx)) });
        movement.AddBeat(new Beat { Id = "beat-6", Event = "canvas:component:download-file", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.DownloadUiFile(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterExportGifSequence(List<ISequence> sequences, ImportExportHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-export-gif-symphony", Name = "Canvas Component Export GIF", Category = "canvas-component" };
        var movement = new Movement { Id = "export-gif", Name = "Export GIF" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:export-gif:rasterize-and-encode", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ExportGif(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }

    private static void RegisterExportMp4Sequence(List<ISequence> sequences, ImportExportHandlers handlers)
    {
        var sequence = new Sequence { Id = "canvas-component-export-mp4-symphony", Name = "Canvas Component Export MP4", Category = "canvas-component" };
        var movement = new Movement { Id = "export-mp4", Name = "Export MP4" };
        movement.AddBeat(new Beat { Id = "beat-1", Event = "canvas:component:export-mp4:rasterize-and-encode", Handler = new Func<dynamic, dynamic, Task<object?>>((data, ctx) => handlers.ExportMp4(data, ctx)) });
        sequence.AddMovement(movement);
        sequences.Add(sequence);
    }
}
