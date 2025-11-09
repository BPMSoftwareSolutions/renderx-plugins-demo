using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace RenderX.Plugins.CanvasComponent.Handlers;

/// <summary>
/// Handlers for copy/paste operations on canvas components.
/// Web version reference: packages/canvas-component/src/symphonies/copy/*.ts and paste/*.ts
/// </summary>
public class CopyPasteHandlers
{
    private readonly ILogger<CopyPasteHandlers> _logger;
    private readonly IEventBus _eventBus;

    public CopyPasteHandlers(ILogger<CopyPasteHandlers> logger, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    #region Copy Handlers

    /// <summary>
    /// Serialize selected component for clipboard.
    /// Web version: packages/canvas-component/src/symphonies/copy/copy.stage-crew.ts:50
    /// </summary>
    public async Task<object?> SerializeSelectedComponent(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 SerializeSelectedComponent");

            // Get selected component ID from data or context
            string? id = GetPropertyValue<string>(data, "id") 
                ?? GetPropertyValue<string>(data, "selectedId");

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID provided for serialization");
                return new { success = false, error = "No component ID" };
            }

            // TODO: Implement actual component serialization
            // For now, return a stub that indicates where the implementation should go
            var component = new
            {
                id,
                type = "component",
                // Add component properties here
            };

            var payload = new
            {
                type = "renderx-component",
                version = "1.0",
                component,
                metadata = new
                {
                    copiedAt = DateTime.UtcNow.ToString("o")
                }
            };

            // Store in context for next beat
            SetPayloadProperty(ctx, "clipboardData", payload);

            return new { success = true, clipboardData = payload };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SerializeSelectedComponent failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Copy component data to clipboard.
    /// Web version: packages/canvas-component/src/symphonies/copy/copy.stage-crew.ts:67
    /// </summary>
    public async Task<object?> CopyToClipboard(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 CopyToClipboard");

            var clipboardData = GetPropertyValue<object>(data, "clipboardData");
            
            if (clipboardData == null)
            {
                _logger.LogWarning("No clipboard data to copy");
                return new { success = false, error = "No clipboard data" };
            }

            // Serialize to JSON
            string json = JsonSerializer.Serialize(clipboardData, new JsonSerializerOptions 
            { 
                WriteIndented = false 
            });

            // TODO: Implement Avalonia clipboard API
            // await Application.Current.Clipboard.SetTextAsync(json);
            _logger.LogInformation("Clipboard operation would copy {Length} characters", json.Length);

            return new { success = true, length = json.Length };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CopyToClipboard failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Notify that copy operation is complete.
    /// Web version: packages/canvas-component/src/symphonies/copy/copy.stage-crew.ts:79
    /// </summary>
    public async Task<object?> NotifyCopyComplete(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 NotifyCopyComplete");

            // TODO: Publish topic event when topic system is ready
            // await EventRouter.Publish("canvas.component.copied", data, ctx.conductor);

            return new { success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "NotifyCopyComplete failed");
            return new { success = false, error = ex.Message };
        }
    }

    #endregion

    #region Paste Handlers

    /// <summary>
    /// Read component data from clipboard.
    /// Web version: packages/canvas-component/src/symphonies/paste/paste.stage-crew.ts:30
    /// </summary>
    public async Task<object?> ReadFromClipboard(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 ReadFromClipboard");

            // TODO: Implement Avalonia clipboard API
            // string? text = await Application.Current.Clipboard.GetTextAsync();
            string? text = null; // Stub

            if (string.IsNullOrEmpty(text))
            {
                _logger.LogWarning("Clipboard is empty");
                return new { success = false, error = "Clipboard empty" };
            }

            // Store in context for next beat
            SetPayloadProperty(ctx, "clipboardText", text);

            return new { success = true, clipboardText = text };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ReadFromClipboard failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Deserialize component data from clipboard text.
    /// Web version: packages/canvas-component/src/symphonies/paste/paste.stage-crew.ts:50
    /// </summary>
    public async Task<object?> DeserializeComponentData(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 DeserializeComponentData");

            string? clipboardText = GetPayloadProperty<string>(ctx, "clipboardText");

            if (string.IsNullOrEmpty(clipboardText))
            {
                _logger.LogWarning("No clipboard text to deserialize");
                return new { success = false, error = "No clipboard text" };
            }

            // Deserialize JSON
            var componentData = JsonSerializer.Deserialize<dynamic>(clipboardText);

            if (componentData == null)
            {
                _logger.LogWarning("Failed to deserialize clipboard data");
                return new { success = false, error = "Invalid JSON" };
            }

            // Store in context for next beat
            SetPayloadProperty(ctx, "componentData", componentData);

            return new { success = true, componentData };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DeserializeComponentData failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Calculate position for pasted component (offset from original).
    /// Web version: packages/canvas-component/src/symphonies/paste/paste.stage-crew.ts:64
    /// </summary>
    public async Task<object?> CalculatePastePosition(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 CalculatePastePosition");

            var componentData = GetPayloadProperty<dynamic>(ctx, "componentData");
            
            // Default offset for pasted items
            const int offsetX = 20;
            const int offsetY = 20;

            // TODO: Extract original position and add offset
            var position = new { x = 100 + offsetX, y = 100 + offsetY };

            // Store in context for next beat
            SetPayloadProperty(ctx, "pastePosition", position);

            return new { success = true, position };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CalculatePastePosition failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Create the pasted component on the canvas.
    /// Web version: packages/canvas-component/src/symphonies/paste/paste.stage-crew.ts:72
    /// </summary>
    public async Task<object?> CreatePastedComponent(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 CreatePastedComponent");

            var componentData = GetPayloadProperty<dynamic>(ctx, "componentData");
            var position = GetPayloadProperty<dynamic>(ctx, "pastePosition");

            // TODO: Call canvas-component-create-symphony via conductor
            // await ctx.conductor.Play("CanvasComponentPlugin", "canvas-component-create-symphony", new {
            //     component = componentData.component,
            //     position
            // });

            _logger.LogInformation("Would create pasted component at position {Position}", 
                JsonSerializer.Serialize(position));

            return new { success = true, created = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreatePastedComponent failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Notify that paste operation is complete.
    /// Web version: packages/canvas-component/src/symphonies/paste/paste.stage-crew.ts:133
    /// </summary>
    public async Task<object?> NotifyPasteComplete(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 NotifyPasteComplete");

            // TODO: Publish topic event when topic system is ready
            // await EventRouter.Publish("canvas.component.pasted", data, ctx.conductor);

            return new { success = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "NotifyPasteComplete failed");
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
            
            // Try to get property value using reflection
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
