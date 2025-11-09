using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace RenderX.Plugins.CanvasComponent.Handlers;

/// <summary>
/// Handlers for resize operations on canvas components and lines.
/// Web version reference: packages/canvas-component/src/symphonies/resize/resize.stage-crew.ts
/// and resize-line/resize.line.stage-crew.ts
/// </summary>
public class ResizeHandlers
{
    private readonly ILogger<ResizeHandlers> _logger;
    private readonly IEventBus _eventBus;

    public ResizeHandlers(ILogger<ResizeHandlers> logger, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    #region Component Resize Handlers

    /// <summary>
    /// Start resize operation for a component.
    /// Web version: packages/canvas-component/src/symphonies/resize/resize.stage-crew.ts:41
    /// </summary>
    public async Task<object?> StartResize(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 StartResize");

            string? id = GetPropertyValue<string>(data, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Missing id for resize start");
                return new { success = false, error = "Missing id" };
            }

            // TODO: Capture base dimensions for line components if needed
            // Store resize start info in context
            SetPayloadProperty(ctx, "resizeStarted", true);
            SetPayloadProperty(ctx, "elementId", id);

            _logger.LogInformation("Resize started for component {Id}", id);

            return new 
            { 
                success = true, 
                id,
                phase = "start" 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "StartResize failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Update component size during resize.
    /// Web version: packages/canvas-component/src/symphonies/resize/resize.stage-crew.ts:81
    /// High-frequency handler - optimized for performance
    /// </summary>
    public async Task<object?> UpdateSize(dynamic data, dynamic ctx)
    {
        try
        {
            string? id = GetPropertyValue<string>(data, "id");
            string? dir = GetPropertyValue<string>(data, "dir");
            double dx = GetPropertyValue<double>(data, "dx");
            double dy = GetPropertyValue<double>(data, "dy");
            double startWidth = GetPropertyValue<double>(data, "startWidth");
            double startHeight = GetPropertyValue<double>(data, "startHeight");
            double startLeft = GetPropertyValue<double>(data, "startLeft");
            double startTop = GetPropertyValue<double>(data, "startTop");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Missing id for resize update");
                return new { success = false, error = "Missing id" };
            }

            // Calculate new dimensions based on direction
            double newWidth = startWidth;
            double newHeight = startHeight;
            double newLeft = startLeft;
            double newTop = startTop;

            // TODO: Implement direction-specific resize logic (n, s, e, w, nw, ne, sw, se)
            // Apply minimum constraints and update Avalonia control size/position

            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug("Resize update for {Id}: dir={Dir}, dx={Dx}, dy={Dy}", id, dir, dx, dy);
            }

            // Store updated dimensions in context
            SetPayloadProperty(ctx, "updatedWidth", newWidth);
            SetPayloadProperty(ctx, "updatedHeight", newHeight);
            SetPayloadProperty(ctx, "elementId", id);

            return new 
            { 
                success = true, 
                id, 
                newWidth, 
                newHeight,
                newLeft,
                newTop
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateSize failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// End resize operation.
    /// Web version: packages/canvas-component/src/symphonies/resize/resize.stage-crew.ts:253
    /// </summary>
    public async Task<object?> EndResize(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 EndResize");

            string? id = GetPropertyValue<string>(data, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Missing id for resize end");
                return new { success = false, error = "Missing id" };
            }

            // TODO: Clean up any temporary resize state
            // Update final dimensions and sync overlay

            SetPayloadProperty(ctx, "resizeEnded", true);
            SetPayloadProperty(ctx, "elementId", id);

            _logger.LogInformation("Resize ended for component {Id}", id);

            return new 
            { 
                success = true, 
                id,
                phase = "end" 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "EndResize failed");
            return new { success = false, error = ex.Message };
        }
    }

    #endregion

    #region Line Resize Handlers

    /// <summary>
    /// Start line resize operation.
    /// Web version: packages/canvas-component/src/symphonies/resize-line/resize.line.stage-crew.ts:2
    /// </summary>
    public async Task<object?> StartLineResize(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 StartLineResize");

            string? id = GetPropertyValue<string>(data, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Missing id for line resize start");
                return new { success = false, error = "Missing id" };
            }

            // TODO: Capture base line endpoints for proportional scaling
            SetPayloadProperty(ctx, "lineResizeStarted", true);
            SetPayloadProperty(ctx, "elementId", id);

            _logger.LogInformation("Line resize started for {Id}", id);

            return new 
            { 
                success = true, 
                id,
                phase = "start" 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "StartLineResize failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Update line during resize.
    /// Web version: packages/canvas-component/src/symphonies/resize-line/resize.line.stage-crew.ts:9
    /// </summary>
    public async Task<object?> UpdateLine(dynamic data, dynamic ctx)
    {
        try
        {
            string? id = GetPropertyValue<string>(data, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Missing id for line update");
                return new { success = false, error = "Missing id" };
            }

            // TODO: Update line endpoints based on resize deltas
            // Apply proportional scaling to maintain line shape

            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug("Line update for {Id}", id);
            }

            SetPayloadProperty(ctx, "elementId", id);

            return new { success = true, id };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateLine failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// End line resize operation.
    /// Web version: packages/canvas-component/src/symphonies/resize-line/resize.line.stage-crew.ts:29
    /// </summary>
    public async Task<object?> EndLineResize(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 EndLineResize");

            string? id = GetPropertyValue<string>(data, "id");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("Missing id for line resize end");
                return new { success = false, error = "Missing id" };
            }

            // TODO: Clean up temporary line resize state

            SetPayloadProperty(ctx, "lineResizeEnded", true);
            SetPayloadProperty(ctx, "elementId", id);

            _logger.LogInformation("Line resize ended for {Id}", id);

            return new 
            { 
                success = true, 
                id,
                phase = "end" 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "EndLineResize failed");
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
