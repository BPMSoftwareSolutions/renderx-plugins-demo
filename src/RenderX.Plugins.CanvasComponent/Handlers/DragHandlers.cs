using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace RenderX.Plugins.CanvasComponent.Handlers;

/// <summary>
/// Handlers for drag operations on canvas components.
/// Web version reference: packages/canvas-component/src/symphonies/drag/drag.stage-crew.ts
/// </summary>
public class DragHandlers
{
    private readonly ILogger<DragHandlers> _logger;
    private readonly IEventBus _eventBus;
    private bool _dragInProgress;

    public DragHandlers(ILogger<DragHandlers> logger, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    /// <summary>
    /// Start drag operation for a component.
    /// Web version: packages/canvas-component/src/symphonies/drag/drag.stage-crew.ts:62
    /// </summary>
    public async Task<object?> StartDrag(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 StartDrag");

            string? id = GetPropertyValue<string>(data, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Missing id for drag start");
                return new { success = false, error = "Missing id" };
            }

            // Mark drag in progress
            _dragInProgress = true;

            // Store drag start info in context
            SetPayloadProperty(ctx, "dragStarted", true);
            SetPayloadProperty(ctx, "elementId", id);

            _logger.LogInformation("Drag started for component {Id}", id);

            return new 
            { 
                success = true, 
                elementId = id, 
                phase = "start" 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "StartDrag failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Update component position during drag.
    /// Web version: packages/canvas-component/src/symphonies/drag/drag.stage-crew.ts:6
    /// High-frequency handler - optimized for performance
    /// </summary>
    public async Task<object?> UpdatePosition(dynamic data, dynamic ctx)
    {
        try
        {
            // Minimal logging for high-frequency operation
            string? id = GetPropertyValue<string>(data, "id");
            var position = GetPropertyValue<dynamic>(data, "position");

            if (string.IsNullOrEmpty(id) || position == null)
            {
                _logger.LogWarning("Missing required drag data: id and position");
                return new { success = false, error = "Missing id or position" };
            }

            // Extract position coordinates
            double x = GetPropertyValue<double>(position, "x");
            double y = GetPropertyValue<double>(position, "y");

            // TODO: Implement Avalonia-specific position update
            // Update Canvas.Left and Canvas.Top properties, or use RenderTransform
            // For now, just log at debug level to avoid spam
            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug("Update position for {Id}: ({X}, {Y})", id, x, y);
            }

            // Store updated position in context for potential use by other handlers
            SetPayloadProperty(ctx, "updatedPosition", position);
            SetPayloadProperty(ctx, "elementId", id);

            return new 
            { 
                success = true, 
                elementId = id, 
                newPosition = new { x, y } 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdatePosition failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// End drag operation.
    /// Web version: packages/canvas-component/src/symphonies/drag/drag.stage-crew.ts:86
    /// </summary>
    public async Task<object?> EndDrag(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 EndDrag");

            string? id = GetPropertyValue<string>(data, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Missing id for drag end");
                return new { success = false, error = "Missing id" };
            }

            // Clear drag in progress flag
            _dragInProgress = false;

            // Store drag end info in context
            SetPayloadProperty(ctx, "dragEnded", true);
            SetPayloadProperty(ctx, "elementId", id);

            _logger.LogInformation("Drag ended for component {Id}", id);

            return new 
            { 
                success = true, 
                elementId = id, 
                phase = "end" 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "EndDrag failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Forward drag info to control panel (stub for now).
    /// Web version: packages/canvas-component/src/symphonies/drag/drag.stage-crew.ts:111
    /// </summary>
    public async Task<object?> ForwardToControlPanel(dynamic data, dynamic ctx)
    {
        try
        {
            // Placeholder to satisfy handler presence checks
            // In the web version, this would trigger control panel updates
            
            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug("🎯 ForwardToControlPanel (stub)");
            }

            return new { success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ForwardToControlPanel failed");
            return new { success = false, error = ex.Message };
        }
    }

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
