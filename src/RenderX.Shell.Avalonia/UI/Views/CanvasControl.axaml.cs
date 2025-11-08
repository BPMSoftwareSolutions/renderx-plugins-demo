using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using MusicalConductor.Avalonia.Interfaces;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.UI.Views;

/// <summary>
/// Canvas control for rendering and managing components
/// </summary>
public partial class CanvasControl : UserControl
{
    private IEventRouter? _eventRouter;
    private IConductorClient? _conductor;
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
    public void Initialize(IEventRouter eventRouter, IConductorClient conductor, ILogger<CanvasControl> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

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
            _logger?.LogDebug("Component added to canvas: {ComponentId}", component.Id);
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
                _selectedComponent = _components.FirstOrDefault(c => c.Id == componentId);
                UpdateStatus($"Component selected: {_selectedComponent?.Name ?? "unknown"}");
                _logger?.LogDebug("Component selected: {ComponentId}", componentId);
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
                var component = _components.FirstOrDefault(c => c.Id == componentId);
                if (component != null)
                {
                    _components.Remove(component);
                    UpdateComponentCount();
                    UpdateStatus($"Component deleted: {component.Name}");
                    _logger?.LogDebug("Component removed from canvas: {ComponentId}", componentId);
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
                var component = _components.FirstOrDefault(c => c.Id == componentId);
                if (component != null)
                {
                    if (payload.TryGetProperty("name", out var nameElement))
                    {
                        component.Name = nameElement.GetString() ?? component.Name;
                    }
                    component.Data = payload;
                    _logger?.LogDebug("Component updated: {ComponentId}", componentId);
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
            _logger?.LogDebug("Component pointer pressed: {ComponentId}", component.Id);
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
            _logger.LogDebug("Selection changed event published: {ComponentId}", component.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing selection changed event");
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

