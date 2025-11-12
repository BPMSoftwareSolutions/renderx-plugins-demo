using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace RenderX.Plugins.CanvasComponent.Handlers;

/// <summary>
/// Handlers for selection/deselection operations on canvas components.
/// Web version reference: packages/canvas-component/src/symphonies/select/*.ts and deselect/*.ts
/// </summary>
public class SelectionHandlers
{
    private readonly ILogger<SelectionHandlers> _logger;
    private readonly IEventBus _eventBus;

    public SelectionHandlers(ILogger<SelectionHandlers> logger, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    #region Selection Handlers

    /// <summary>
    /// Route selection request to appropriate sequence.
    /// Web version: packages/canvas-component/src/symphonies/select/select.stage-crew.ts:14
    /// Topic-first selection handler: routes canvas.component.select.requested to the selection sequence
    /// </summary>
    public async Task<object?> RouteSelectionRequest(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 RouteSelectionRequest");

            // Guard against accidental re-entry loops
            bool isRouted = GetPropertyValue<bool>(data, "_routed");
            if (isRouted) return new { };

            string? id = GetPropertyValue<string>(data, "id");
            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID provided for selection routing");
                return new { };
            }

            // TODO: Get conductor from context and route to canvas-component-select-symphony
            // await ctx.conductor.Play("CanvasComponentPlugin", "canvas-component-select-symphony", 
            //     new { id, _routed = true });

            _logger.LogInformation("Would route selection request for component {Id}", id);

            return new { success = true, id, routed = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RouteSelectionRequest failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Show selection overlay for component.
    /// Web version: packages/canvas-component/src/symphonies/select/select.stage-crew.ts:62
    /// </summary>
    public async Task<object?> ShowSelectionOverlay(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 ShowSelectionOverlay");

            // Derive selected ID from various sources
            string? id = GetPropertyValue<string>(data, "id") 
                ?? GetPropertyValue<string>(data, "elementId");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID provided for selection overlay");
                return new { success = false, error = "No component ID" };
            }

            // TODO: Implement Avalonia-specific overlay logic
            // For now, just log what would happen
            _logger.LogInformation("Would show selection overlay for component {Id}", id);

            // Store ID in context for subsequent beats
            SetPayloadProperty(ctx, "selectedId", id);

            return new { success = true, id };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ShowSelectionOverlay failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Show selection overlay for SVG sub-node.
    /// Web version: packages/canvas-component/src/symphonies/select/select.svg-node.stage-crew.ts:14
    /// </summary>
    public async Task<object?> ShowSvgNodeOverlay(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 ShowSvgNodeOverlay");

            string? id = GetPropertyValue<string>(data, "id");
            string? path = GetPropertyValue<string>(data, "path");

            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(path))
            {
                _logger.LogWarning("Missing ID or path for SVG node overlay");
                return new { success = false, error = "Missing ID or path" };
            }

            // TODO: Implement SVG sub-node overlay
            _logger.LogInformation("Would show SVG node overlay for {Id}, path: {Path}", id, path);

            return new { success = true, id, path };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ShowSvgNodeOverlay failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Notify UI about selection (triggers control panel update).
    /// Web version: packages/canvas-component/src/symphonies/select/select.stage-crew.ts:120
    /// </summary>
    public async Task<object?> NotifyUi(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 NotifyUi (Selection)");

            // Get ID from various sources
            string? id = GetPropertyValue<string>(data, "id") 
                ?? GetPayloadProperty<string>(ctx, "selectedId")
                ?? GetPayloadProperty<string>(ctx, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID available for UI notification");
                return new { };
            }

            // TODO: Trigger control-panel-selection-show-symphony
            // await ctx.conductor.Play("ControlPanelPlugin", "control-panel-selection-show-symphony", 
            //     new { id });

            _logger.LogInformation("Would notify UI about selection: {Id}", id);

            return new { success = true, notified = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "NotifyUi failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Publish selection changed event.
    /// Web version: packages/canvas-component/src/symphonies/select/select.stage-crew.ts:137
    /// </summary>
    public async Task<object?> PublishSelectionChanged(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 PublishSelectionChanged");

            string? id = GetPropertyValue<string>(data, "id")
                ?? GetPayloadProperty<string>(ctx, "selectedId")
                ?? GetPayloadProperty<string>(ctx, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID for selection changed event");
                return new { };
            }

            // TODO: Publish topic event
            // await EventRouter.Publish("canvas.component.selection.changed", new { id }, ctx.conductor);
            
            _logger.LogInformation("Would publish selection changed event for {Id}", id);

            return new { success = true, published = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PublishSelectionChanged failed");
            return new { success = false, error = ex.Message };
        }
    }

    #endregion

    #region Deselection Handlers

    /// <summary>
    /// Route deselection request to appropriate sequence.
    /// Web version: packages/canvas-component/src/symphonies/deselect/deselect.stage-crew.ts:62
    /// </summary>
    public async Task<object?> RouteDeselectionRequest(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 RouteDeselectionRequest");

            string? id = GetPropertyValue<string>(data, "id");
            bool hasId = !string.IsNullOrEmpty(id);

            // TODO: Route to appropriate sequence
            // If has ID: canvas-component-deselect-symphony
            // Otherwise: canvas-component-deselect-all-symphony
            
            string targetSequence = hasId 
                ? "canvas-component-deselect-symphony" 
                : "canvas-component-deselect-all-symphony";

            _logger.LogInformation("Would route to {Sequence}", targetSequence);

            return new { success = true, routed = true, hasId };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RouteDeselectionRequest failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Deselect specific component.
    /// Web version: packages/canvas-component/src/symphonies/deselect/deselect.stage-crew.ts:20
    /// </summary>
    public async Task<object?> DeselectComponent(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 DeselectComponent");

            string? id = GetPropertyValue<string>(data, "id")
                ?? GetPayloadProperty<string>(ctx, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID provided for deselection");
                return new { success = false, error = "No component ID" };
            }

            // TODO: Hide overlays for this specific component
            _logger.LogInformation("Would hide overlay for component {Id}", id);

            // Store ID for next beat
            SetPayloadProperty(ctx, "deselectedId", id);

            return new { success = true, id };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DeselectComponent failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Hide all selection overlays.
    /// Web version: packages/canvas-component/src/symphonies/deselect/deselect.stage-crew.ts:11
    /// </summary>
    public async Task<object?> HideAllOverlays(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 HideAllOverlays");

            // TODO: Hide all selection overlays in Avalonia
            _logger.LogInformation("Would hide all selection overlays");

            return new { success = true, hidden = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "HideAllOverlays failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Publish deselection changed event.
    /// Web version: packages/canvas-component/src/symphonies/deselect/deselect.stage-crew.ts:36
    /// </summary>
    public async Task<object?> PublishDeselectionChanged(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 PublishDeselectionChanged");

            string? id = GetPropertyValue<string>(data, "id")
                ?? GetPayloadProperty<string>(ctx, "deselectedId");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID for deselection changed event");
                return new { };
            }

            // TODO: Publish topic event
            // await EventRouter.Publish("canvas.component.deselection.changed", new { id }, ctx.conductor);

            _logger.LogInformation("Would publish deselection changed event for {Id}", id);

            return new { success = true, published = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PublishDeselectionChanged failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Publish selections cleared event.
    /// Web version: packages/canvas-component/src/symphonies/deselect/deselect.stage-crew.ts:44
    /// </summary>
    public async Task<object?> PublishSelectionsCleared(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 PublishSelectionsCleared");

            // TODO: Publish topic event
            // await EventRouter.Publish("canvas.component.selections.cleared", new { }, ctx.conductor);

            _logger.LogInformation("Would publish selections cleared event");

            return new { success = true, published = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PublishSelectionsCleared failed");
            return new { success = false, error = ex.Message };
        }
    }

    #endregion

    #region Helper Methods

    private T? GetPropertyValue<T>(dynamic obj, string propertyName)
    {
        try
        {
            if (obj == null) return default;
            
            var type = obj.GetType();
            var property = type.GetProperty(propertyName);
            
            if (property != null)
            {
                var value = property.GetValue(obj);
                if (value is T typed)
                    return typed;
            }

            return default;
        }
        catch
        {
            return default;
        }
    }

    private T? GetPayloadProperty<T>(dynamic ctx, string propertyName)
    {
        try
        {
            if (ctx?.payload == null) return default;
            return GetPropertyValue<T>(ctx.payload, propertyName);
        }
        catch
        {
            return default;
        }
    }

    private void SetPayloadProperty(dynamic ctx, string propertyName, object? value)
    {
        try
        {
            if (ctx?.payload == null) return;
            
            var type = ctx.payload.GetType();
            var property = type.GetProperty(propertyName);
            
            if (property != null && property.CanWrite)
            {
                property.SetValue(ctx.payload, value);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to set payload property {PropertyName}", propertyName);
        }
    }

    #endregion
}
