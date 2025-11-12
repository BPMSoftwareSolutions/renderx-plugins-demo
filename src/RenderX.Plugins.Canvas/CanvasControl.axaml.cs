using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Logging;
using MusicalConductor.Avalonia.Interfaces;
using MusicalConductor.Core.Interfaces;  // For IEventBus only
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Plugins.Canvas;

/// <summary>
/// Canvas control for rendering and managing components
/// </summary>
public partial class CanvasControl : UserControl
{
    private IEventRouter? _eventRouter;
    private MusicalConductor.Avalonia.Interfaces.IConductorClient? _conductor;
    private ILogger<CanvasControl>? _logger;
    private ObservableCollection<ComponentViewModel> _components;
    private ComponentViewModel? _selectedComponent;
    private Point _dragStartPoint;
    private bool _isDragging;

    /// <summary>
    /// Component view model for display
    /// </summary>
    public class ComponentViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public double X { get; set; }
        public double Y { get; set; }
        public double Width { get; set; } = 100;
        public double Height { get; set; } = 50;
        public JsonElement? Data { get; set; }
    }

    public CanvasControl()
    {
        InitializeComponent();
        _components = new ObservableCollection<ComponentViewModel>();
    }

    /// <summary>
    /// Initialize the canvas control with dependencies
    /// </summary>
    public void Initialize(IEventRouter eventRouter, MusicalConductor.Avalonia.Interfaces.IConductorClient conductor, ILogger<CanvasControl> logger, IEventBus eventBus)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));

        // Wrap logger with ConductorAwareLogger to emit logs through Musical Conductor event bus
        // This mirrors the web version's ctx.logger behavior with emoji icons (🧩 canvas-component)
        _logger = new ConductorAwareLoggerWrapper<CanvasControl>(
            logger ?? throw new ArgumentNullException(nameof(logger)),
            eventBus ?? throw new ArgumentNullException(nameof(eventBus)),
            "canvas-component");

        _logger.LogInformation("CanvasControl initialized");

        // Set up ItemsControl
        var itemsControl = this.FindControl<ItemsControl>("ComponentsItemsControl");
        if (itemsControl != null)
        {
            itemsControl.ItemsSource = _components;
        }

        // Subscribe to canvas events
        SubscribeToCanvasEvents();
    }

    /// <summary>
    /// Subscribe to canvas-related events
    /// </summary>
    private void SubscribeToCanvasEvents()
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            // Subscribe to component creation
            _eventRouter.Subscribe("canvas.component.created", (payload) =>
            {
                _logger.LogDebug("Component created event received");
                if (payload is JsonElement jsonPayload)
                {
                    HandleComponentCreated(jsonPayload);
                }
            });

            // Subscribe to component selection
            _eventRouter.Subscribe("canvas.component.selection.changed", (payload) =>
            {
                _logger.LogDebug("Component selection changed event received");
                if (payload is JsonElement jsonPayload)
                {
                    HandleComponentSelectionChanged(jsonPayload);
                }
            });

            // Subscribe to component deletion
            _eventRouter.Subscribe("canvas.component.deleted", (payload) =>
            {
                _logger.LogDebug("Component deleted event received");
                if (payload is JsonElement jsonPayload)
                {
                    HandleComponentDeleted(jsonPayload);
                }
            });

            // Subscribe to component updates
            _eventRouter.Subscribe("canvas.component.updated", (payload) =>
            {
                _logger.LogDebug("Component updated event received");
                if (payload is JsonElement jsonPayload)
                {
                    HandleComponentUpdated(jsonPayload);
                }
            });

            // Subscribe to control panel update requests
            _eventRouter.Subscribe("control.panel.update.requested", (payload) =>
            {
                _logger.LogDebug("Control panel update requested event received");
                if (payload is JsonElement jsonPayload)
                {
                    HandleControlPanelUpdateRequested(jsonPayload);
                }
            });

            // Subscribe to control panel classes updated
            _eventRouter.Subscribe("control.panel.classes.updated", (payload) =>
            {
                _logger.LogDebug("Control panel classes updated event received");
                if (payload is JsonElement jsonPayload)
                {
                    HandleControlPanelClassesUpdated(jsonPayload);
                }
            });

            // Subscribe to library component add requests
            _eventRouter.Subscribe("library.component.add.requested", (payload) =>
            {
                _logger.LogDebug("Library component add requested event received");
                if (payload is JsonElement jsonPayload)
                {
                    HandleLibraryComponentAddRequested(jsonPayload);
                }
            });

            _logger.LogInformation("Canvas event subscriptions established");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error subscribing to canvas events");
        }
    }

    /// <summary>
    /// Handle component created event
    /// </summary>
    private void HandleComponentCreated(JsonElement payload)
    {
        try
        {
            var component = new ComponentViewModel
            {
                Id = payload.TryGetProperty("id", out var id) ? id.GetString() ?? "unknown" : "unknown",
                Name = payload.TryGetProperty("name", out var name) ? name.GetString() ?? "Component" : "Component",
                Data = payload
            };

            _components.Add(component);
            UpdateComponentCount();
            UpdateStatus($"Component created: {component.Name}");
            _logger?.LogInformation("Component added to canvas: {ComponentId}", component.Id);

            // Publish component created event
            PublishComponentCreated(component);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling component created event");
        }
    }

    /// <summary>
    /// Handle component selection changed event
    /// </summary>
    private void HandleComponentSelectionChanged(JsonElement payload)
    {
        try
        {
            if (payload.TryGetProperty("id", out var idElement))
            {
                var componentId = idElement.GetString();
                _logger?.LogInformation("Canvas received selection changed: {ComponentId}", componentId);

                _selectedComponent = _components.FirstOrDefault(c => c.Id == componentId);
                UpdateStatus($"Component selected: {_selectedComponent?.Name ?? "unknown"}");

                if (_selectedComponent != null)
                {
                    _logger?.LogInformation("Canvas component selected: {ComponentName}", _selectedComponent.Name);
                }
                else
                {
                    _logger?.LogWarning("Canvas component not found for selection: {ComponentId}", componentId);
                }
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling component selection changed event");
        }
    }

    /// <summary>
    /// Handle component deleted event
    /// </summary>
    private void HandleComponentDeleted(JsonElement payload)
    {
        try
        {
            if (payload.TryGetProperty("id", out var idElement))
            {
                var componentId = idElement.GetString();
                _logger?.LogInformation("Canvas received delete request: {ComponentId}", componentId);

                var component = _components.FirstOrDefault(c => c.Id == componentId);
                if (component != null)
                {
                    _components.Remove(component);
                    UpdateComponentCount();
                    UpdateStatus($"Component deleted: {component.Name}");
                    _logger?.LogInformation("Component removed from canvas: {ComponentId}", componentId);

                    // Publish component deleted event
                    PublishComponentDeleted(componentId ?? "unknown");
                }
                else
                {
                    _logger?.LogWarning("Canvas component not found for deletion: {ComponentId}", componentId);
                }
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling component deleted event");
        }
    }

    /// <summary>
    /// Handle component updated event
    /// </summary>
    private void HandleComponentUpdated(JsonElement payload)
    {
        try
        {
            if (payload.TryGetProperty("id", out var idElement))
            {
                var componentId = idElement.GetString();
                _logger?.LogInformation("Canvas received update request: {ComponentId}", componentId);

                var component = _components.FirstOrDefault(c => c.Id == componentId);
                if (component != null)
                {
                    if (payload.TryGetProperty("name", out var nameElement))
                    {
                        component.Name = nameElement.GetString() ?? component.Name;
                    }
                    component.Data = payload;
                    _logger?.LogInformation("Component updated: {ComponentId}", componentId);
                }
                else
                {
                    _logger?.LogWarning("Canvas component not found for update: {ComponentId}", componentId);
                }
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling component updated event");
        }
    }

    /// <summary>
    /// Handle component pointer pressed (selection)
    /// </summary>
    private void OnComponentPointerPressed(object? sender, PointerPressedEventArgs e)
    {
        if (sender is Border border && border.DataContext is ComponentViewModel component)
        {
            _dragStartPoint = e.GetPosition(this);
            _isDragging = true;
            _selectedComponent = component;
            _logger?.LogInformation("Component pointer pressed: {ComponentId}", component.Id);

            // Publish drag start event
            PublishDragStart(component, _dragStartPoint);
        }
    }

    /// <summary>
    /// Handle component pointer released
    /// </summary>
    private void OnComponentPointerReleased(object? sender, PointerReleasedEventArgs e)
    {
        if (_isDragging && _selectedComponent != null)
        {
            _isDragging = false;
            var currentPoint = e.GetPosition(this);

            // Publish drag end event
            PublishDragEnd(_selectedComponent, currentPoint);

            // Publish selection changed event
            PublishSelectionChanged(_selectedComponent);
            _logger?.LogDebug("Component pointer released: {ComponentId}", _selectedComponent.Id);
        }
    }

    /// <summary>
    /// Handle component pointer moved (drag)
    /// </summary>
    private void OnComponentPointerMoved(object? sender, PointerEventArgs e)
    {
        if (_isDragging && _selectedComponent != null)
        {
            var currentPoint = e.GetPosition(this);
            var deltaX = currentPoint.X - _dragStartPoint.X;
            var deltaY = currentPoint.Y - _dragStartPoint.Y;

            _selectedComponent.X += deltaX;
            _selectedComponent.Y += deltaY;
            _dragStartPoint = currentPoint;

            // Publish drag move event
            PublishDragMove(_selectedComponent, currentPoint);
        }
    }

    /// <summary>
    /// Publish selection changed event
    /// </summary>
    private async void PublishSelectionChanged(ComponentViewModel component)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { id = component.Id, name = component.Name };
            await _eventRouter.PublishAsync("canvas.component.selection.changed", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('canvas.component.selection.changed')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing selection changed event");
        }
    }

    /// <summary>
    /// Publish drag start event
    /// </summary>
    private async void PublishDragStart(ComponentViewModel component, Point position)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { id = component.Id, position = new { x = position.X, y = position.Y } };
            await _eventRouter.PublishAsync("canvas.component.drag.start", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('canvas.component.drag.start')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing drag start event");
        }
    }

    /// <summary>
    /// Publish drag move event
    /// </summary>
    private async void PublishDragMove(ComponentViewModel component, Point position)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { id = component.Id, position = new { x = position.X, y = position.Y } };
            await _eventRouter.PublishAsync("canvas.component.drag.move", payload, _conductor);
            _logger.LogDebug("📡 EventRouter.publish('canvas.component.drag.move')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing drag move event");
        }
    }

    /// <summary>
    /// Publish drag end event
    /// </summary>
    private async void PublishDragEnd(ComponentViewModel component, Point position)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { id = component.Id, position = new { x = position.X, y = position.Y } };
            await _eventRouter.PublishAsync("canvas.component.drag.end", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('canvas.component.drag.end')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing drag end event");
        }
    }

    /// <summary>
    /// Publish selections cleared event
    /// </summary>
    private async void PublishSelectionsCleared()
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            await _eventRouter.PublishAsync("canvas.component.selections.cleared", new { }, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('canvas.component.selections.cleared')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing selections cleared event");
        }
    }

    /// <summary>
    /// Publish component created event
    /// </summary>
    private async void PublishComponentCreated(ComponentViewModel component)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { id = component.Id, name = component.Name };
            await _eventRouter.PublishAsync("canvas.component.created", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('canvas.component.created')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing component created event");
        }
    }

    /// <summary>
    /// Publish component deleted event
    /// </summary>
    private async void PublishComponentDeleted(string componentId)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { id = componentId };
            await _eventRouter.PublishAsync("canvas.component.deleted", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('canvas.component.deleted')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing component deleted event");
        }
    }

    /// <summary>
    /// Publish import requested event
    /// </summary>
    private async void PublishImportRequested()
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            await _eventRouter.PublishAsync("canvas.component.import.requested", new { }, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('canvas.component.import.requested')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing import requested event");
        }
    }

    /// <summary>
    /// Handle control panel update requested event
    /// </summary>
    private void HandleControlPanelUpdateRequested(JsonElement payload)
    {
        try
        {
            if (payload.TryGetProperty("id", out var idElement))
            {
                var componentId = idElement.GetString();
                var component = _components.FirstOrDefault(c => c.Id == componentId);
                if (component != null)
                {
                    // Update component properties from payload
                    _logger?.LogDebug("Updating component from control panel: {ComponentId}", componentId);
                    UpdateStatus($"Component updated: {component.Name}");
                }
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling control panel update requested event");
        }
    }

    /// <summary>
    /// Handle control panel classes updated event
    /// </summary>
    private void HandleControlPanelClassesUpdated(JsonElement payload)
    {
        try
        {
            if (payload.TryGetProperty("id", out var idElement))
            {
                var componentId = idElement.GetString();
                var component = _components.FirstOrDefault(c => c.Id == componentId);
                if (component != null)
                {
                    _logger?.LogDebug("Updating component classes from control panel: {ComponentId}", componentId);
                    UpdateStatus($"Classes updated: {component.Name}");
                }
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling control panel classes updated event");
        }
    }

    /// <summary>
    /// Handle library component add requested event
    /// </summary>
    private void HandleLibraryComponentAddRequested(JsonElement payload)
    {
        try
        {
            if (payload.TryGetProperty("componentId", out var idElement))
            {
                var componentId = idElement.GetString();
                var componentName = payload.TryGetProperty("componentName", out var nameElement)
                    ? nameElement.GetString() ?? "Component"
                    : "Component";

                // Create new component from library
                var newComponent = new ComponentViewModel
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = componentName,
                    X = 100,
                    Y = 100,
                    Data = payload
                };

                _components.Add(newComponent);
                UpdateComponentCount();
                UpdateStatus($"Added component: {componentName}");
                _logger?.LogInformation("Component added from library: {ComponentId}", componentId);

                // Publish component created event
                PublishComponentCreated(newComponent);
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling library component add requested event");
        }
    }

    /// <summary>
    /// Update component count display
    /// </summary>
    private void UpdateComponentCount()
    {
        var countText = this.FindControl<TextBlock>("ComponentCountText");
        if (countText != null)
        {
            countText.Text = $"({_components.Count} components)";
        }
    }

    /// <summary>
    /// Update status message
    /// </summary>
    private void UpdateStatus(string message)
    {
        var statusText = this.FindControl<TextBlock>("StatusText");
        if (statusText != null)
        {
            statusText.Text = message;
        }
    }
}

