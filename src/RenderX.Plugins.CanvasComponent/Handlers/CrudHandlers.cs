using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace RenderX.Plugins.CanvasComponent.Handlers;

/// <summary>
/// Handlers for Create, Update, Delete operations on canvas components.
/// Web version reference: packages/canvas-component/src/symphonies/create/*.ts,
/// update/*.ts, and delete/*.ts
/// </summary>
public class CrudHandlers
{
    private readonly ILogger<CrudHandlers> _logger;
    private readonly IEventBus _eventBus;

    public CrudHandlers(ILogger<CrudHandlers> logger, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    #region Create Handlers

    /// <summary>
    /// Resolve component template and generate node ID.
    /// Web version: packages/canvas-component/src/symphonies/create/create.arrangement.ts:1
    /// </summary>
    public async Task<object?> ResolveTemplate(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 ResolveTemplate");

            var component = GetPropertyValue<dynamic>(data, "component");
            var template = GetPropertyValue<dynamic>(component, "template");

            if (template == null)
            {
                _logger.LogError("Missing component template");
                return new { success = false, error = "Missing component template" };
            }

            // Store template in context
            SetPayloadProperty(ctx, "template", template);

            // Support ID override for import scenarios
            string? overrideId = GetPropertyValue<string>(data, "_overrideNodeId");
            string nodeId = overrideId ?? $"rx-node-{Guid.NewGuid():N}".Substring(0, 14);

            SetPayloadProperty(ctx, "nodeId", nodeId);

            // Detect React rendering strategy
            var render = GetPropertyValue<dynamic>(template, "render");
            string? strategy = GetPropertyValue<string>(render, "strategy");
            
            if (strategy == "react")
            {
                SetPayloadProperty(ctx, "kind", "react");
            }

            _logger.LogInformation("Resolved template for node {NodeId}", nodeId);

            return new { success = true, nodeId, template };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ResolveTemplate failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Register component instance in storage/KV store.
    /// Web version: packages/canvas-component/src/symphonies/create/create.io.ts:1
    /// </summary>
    public async Task<object?> RegisterInstance(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 RegisterInstance");

            string? nodeId = GetPayloadProperty<string>(ctx, "nodeId");
            var template = GetPayloadProperty<dynamic>(ctx, "template");

            if (string.IsNullOrEmpty(nodeId) || template == null)
            {
                _logger.LogWarning("Missing nodeId or template for registration");
                return new { success = false, error = "Missing nodeId or template" };
            }

            // TODO: Store component instance in KV store or database
            _logger.LogInformation("Would register instance {NodeId} in storage", nodeId);

            return new { success = true, registered = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RegisterInstance failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Create the actual node/control in the canvas.
    /// Web version: packages/canvas-component/src/symphonies/create/create.stage-crew.ts:39
    /// </summary>
    public async Task<object?> CreateNode(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 CreateNode");

            string? nodeId = GetPayloadProperty<string>(ctx, "nodeId");
            var template = GetPayloadProperty<dynamic>(ctx, "template");
            var position = GetPropertyValue<dynamic>(data, "position");

            if (string.IsNullOrEmpty(nodeId) || template == null)
            {
                _logger.LogError("Missing nodeId or template for node creation");
                return new { success = false, error = "Missing nodeId or template" };
            }

            // TODO: Create Avalonia control based on template
            // - Create element with correct type (tag)
            // - Apply CSS classes and inline styles
            // - Set position (Canvas.Left, Canvas.Top or RenderTransform)
            // - Inject CSS if template has css property
            // - Apply content properties
            // - Add to canvas panel

            _logger.LogInformation("Would create node {NodeId} on canvas", nodeId);

            SetPayloadProperty(ctx, "createdNode", new { id = nodeId });

            return new { success = true, id = nodeId };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateNode failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Render React component (if template uses React strategy).
    /// Web version: packages/canvas-component/src/symphonies/create/create.react.stage-crew.ts:11
    /// </summary>
    public async Task<object?> RenderReact(dynamic data, dynamic ctx)
    {
        try
        {
            string? kind = GetPayloadProperty<string>(ctx, "kind");

            if (kind != "react")
            {
                // Not a React component, skip
                return new { success = true, skipped = true };
            }

            _logger.LogInformation("🎯 RenderReact");

            // TODO: Implement React rendering for .NET (likely not applicable in Avalonia)
            // This is a browser-specific feature - may need different approach in .NET
            _logger.LogWarning("React rendering not yet implemented in .NET version");

            return new { success = true, rendered = false, note = "React not supported" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RenderReact failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Notify UI that component was created.
    /// Web version: packages/canvas-component/src/symphonies/create/create.notify.ts:3
    /// </summary>
    public async Task<object?> NotifyUi(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 NotifyUi (Create)");

            var createdNode = GetPayloadProperty<dynamic>(ctx, "createdNode");
            
            // TODO: Publish topic event
            // await EventRouter.Publish("canvas.component.created", createdNode, ctx.conductor);

            return new { success = true, notified = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "NotifyUi failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Enhance line component with advanced features.
    /// Web version: packages/canvas-component/src/symphonies/augment/augment.line.stage-crew.ts:30
    /// </summary>
    public async Task<object?> EnhanceLine(dynamic data, dynamic ctx)
    {
        try
        {
            var template = GetPayloadProperty<dynamic>(ctx, "template");
            string? tag = GetPropertyValue<string>(template, "tag");

            if (tag != "svg" && !tag?.Contains("line") == true)
            {
                // Not a line component, skip
                return new { success = true, skipped = true };
            }

            _logger.LogInformation("🎯 EnhanceLine");

            // TODO: Apply line-specific enhancements (endpoints, control points, etc.)
            
            return new { success = true, enhanced = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "EnhanceLine failed");
            return new { success = false, error = ex.Message };
        }
    }

    #endregion

    #region Update Handlers

    /// <summary>
    /// Update component attribute.
    /// Web version: packages/canvas-component/src/symphonies/update/update.stage-crew.ts:8
    /// </summary>
    public async Task<object?> UpdateAttribute(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 UpdateAttribute");

            string? id = GetPropertyValue<string>(data, "id");
            string? attribute = GetPropertyValue<string>(data, "attribute");
            var value = GetPropertyValue<dynamic>(data, "value");

            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(attribute) || value == null)
            {
                _logger.LogWarning("Canvas component update requires id, attribute, and value");
                return new { success = false, error = "Missing required parameters" };
            }

            // TODO: Apply attribute update using component rule engine
            // The rule engine handles different attribute types (style, content, etc.)
            
            string attrStr = attribute?.ToString() ?? "";
            string valueStr = value?.ToString() ?? "";
            string idStr = id?.ToString() ?? "";
            _logger.LogInformation("Would update attribute {Attribute}={Value} on component {Id}", 
                attrStr, valueStr, idStr);

            // Store updated info for next beat
            SetPayloadProperty(ctx, "updatedAttribute", new { id, attribute, value });
            SetPayloadProperty(ctx, "elementId", id);

            return new { success = true, id, attribute, value };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateAttribute failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Update SVG node attribute (for SVG sub-elements).
    /// Web version: packages/canvas-component/src/symphonies/update/update.svg-node.stage-crew.ts:44
    /// </summary>
    public async Task<object?> UpdateSvgNodeAttribute(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 UpdateSvgNodeAttribute");

            string? id = GetPropertyValue<string>(data, "id");
            string? path = GetPropertyValue<string>(data, "path");
            string? attribute = GetPropertyValue<string>(data, "attribute");
            var value = GetPropertyValue<dynamic>(data, "value");

            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(path) || 
                string.IsNullOrEmpty(attribute) || value == null)
            {
                _logger.LogWarning("SVG node update requires id, path, attribute, and value");
                return new { success = false, error = "Missing required parameters" };
            }

            // TODO: Update SVG sub-node attribute
            
            string pathStr = path?.ToString() ?? "";
            string attrStr = attribute?.ToString() ?? "";
            string valueStr = value?.ToString() ?? "";
            string idStr = id?.ToString() ?? "";
            _logger.LogInformation("Would update SVG node {Path} attribute {Attribute}={Value} on {Id}", 
                pathStr, attrStr, valueStr, idStr);

            SetPayloadProperty(ctx, "elementId", id);

            return new { success = true, id, path, attribute, value };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateSvgNodeAttribute failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Refresh control panel after attribute update.
    /// Web version: packages/canvas-component/src/symphonies/update/update.stage-crew.ts:39
    /// </summary>
    public async Task<object?> RefreshControlPanel(dynamic data, dynamic ctx)
    {
        try
        {
            string? elementId = GetPayloadProperty<string>(ctx, "elementId");

            if (string.IsNullOrEmpty(elementId))
            {
                return new { success = true, skipped = true };
            }

            _logger.LogInformation("🎯 RefreshControlPanel for {ElementId}", elementId);

            // TODO: Trigger control panel update
            // await EventRouter.Publish("control.panel.update.requested", new { id = elementId }, ctx.conductor);

            return new { success = true, refreshed = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RefreshControlPanel failed");
            return new { success = false, error = ex.Message };
        }
    }

    #endregion

    #region Delete Handlers

    /// <summary>
    /// Route delete request to delete sequence.
    /// Web version: packages/canvas-component/src/symphonies/delete/delete.stage-crew.ts:47
    /// </summary>
    public async Task<object?> RouteDeleteRequest(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 RouteDeleteRequest");

            string? id = ResolveId(data, ctx);

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID for delete routing");
                return new { success = false, error = "No component ID" };
            }

            // TODO: Route to canvas-component-delete-symphony
            _logger.LogInformation("Would route delete request for {Id}", id);

            return new { success = true, id, routed = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RouteDeleteRequest failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Delete component from canvas.
    /// Web version: packages/canvas-component/src/symphonies/delete/delete.stage-crew.ts:31
    /// </summary>
    public async Task<object?> DeleteComponent(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 DeleteComponent");

            string? id = ResolveId(data, ctx);

            if (string.IsNullOrEmpty(id))
            {
                _logger.LogWarning("No component ID for deletion");
                return new { success = false, error = "No component ID" };
            }

            // TODO: Remove component from canvas
            // - Find and remove Avalonia control
            // - Hide any overlays for this component
            // - Remove from storage/KV store

            _logger.LogInformation("Would delete component {Id}", id);

            SetPayloadProperty(ctx, "deletedId", id);

            return new { success = true, id };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DeleteComponent failed");
            return new { success = false, error = ex.Message };
        }
    }

    /// <summary>
    /// Publish deleted event.
    /// Web version: packages/canvas-component/src/symphonies/delete/delete.stage-crew.ts:14
    /// </summary>
    public async Task<object?> PublishDeleted(dynamic data, dynamic ctx)
    {
        try
        {
            _logger.LogInformation("🎯 PublishDeleted");

            string? id = ResolveId(data, ctx);

            if (string.IsNullOrEmpty(id))
            {
                return new { };
            }

            // TODO: Publish topic event
            // await EventRouter.Publish("canvas.component.deleted", new { id }, ctx.conductor);

            _logger.LogInformation("Would publish deleted event for {Id}", id);

            return new { success = true, published = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PublishDeleted failed");
            return new { success = false, error = ex.Message };
        }
    }

    #endregion

    #region Helper Methods

    private string? ResolveId(dynamic data, dynamic ctx)
    {
        // Try to get ID from multiple sources
        string? id = GetPropertyValue<string>(data, "id")
            ?? GetPayloadProperty<string>(ctx, "id")
            ?? GetPayloadProperty<string>(ctx, "elementId")
            ?? GetPayloadProperty<string>(ctx, "selectedId");

        return id;
    }

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
