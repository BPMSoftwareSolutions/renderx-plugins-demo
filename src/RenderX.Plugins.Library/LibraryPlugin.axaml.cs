using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using MusicalConductor.Avalonia.Interfaces;
using System;
using System.Collections.ObjectModel;

namespace RenderX.Plugins.Library;

/// <summary>
/// Library plugin - displays component library in the library slot
/// </summary>
public partial class LibraryPlugin : UserControl
{
    private IEventRouter? _eventRouter;
    private IConductorClient? _conductor;
    private ILogger<LibraryPlugin>? _logger;
    private ObservableCollection<ComponentItem> _components;

    /// <summary>
    /// Component item for display in library
    /// </summary>
    public class ComponentItem
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public LibraryPlugin()
    {
        InitializeComponent();
        _components = new ObservableCollection<ComponentItem>();
    }

    /// <summary>
    /// Initialize the library plugin with dependencies
    /// </summary>
    public void Initialize(IEventRouter eventRouter, IConductorClient conductor, ILogger<LibraryPlugin> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        _logger.LogInformation("LibraryPlugin initialized");

        // Set up ItemsControl
        var itemsControl = this.FindControl<ItemsControl>("ComponentsItemsControl");
        if (itemsControl != null)
        {
            itemsControl.ItemsSource = _components;
        }

        // Load sample components
        LoadSampleComponents();
    }

    /// <summary>
    /// Load sample components for demonstration
    /// </summary>
    private void LoadSampleComponents()
    {
        // Publish library load requested event
        PublishLibraryLoadRequested();

        _components.Add(new ComponentItem
        {
            Id = "button",
            Name = "Button",
            Category = "Input",
            Description = "Interactive button component"
        });
        _components.Add(new ComponentItem
        {
            Id = "textbox",
            Name = "TextBox",
            Category = "Input",
            Description = "Text input component"
        });
        _components.Add(new ComponentItem
        {
            Id = "label",
            Name = "Label",
            Category = "Display",
            Description = "Text label component"
        });
        _components.Add(new ComponentItem
        {
            Id = "panel",
            Name = "Panel",
            Category = "Layout",
            Description = "Container panel component"
        });

        _logger?.LogInformation("Loaded {ComponentCount} sample components", _components.Count);
    }

    /// <summary>
    /// Handle component drag start
    /// </summary>
    private void OnComponentPointerPressed(object? sender, PointerPressedEventArgs e)
    {
        if (sender is Border border && border.DataContext is ComponentItem component)
        {
            _logger?.LogDebug("Component drag started: {ComponentId}", component.Id);

            // Publish component drag started event
            PublishComponentDragStarted(component);

            // Publish drag start requested event
            PublishDragStartRequested(component);
        }
    }

    /// <summary>
    /// Handle component double-click (add to canvas)
    /// </summary>
    private void OnComponentDoubleClick(object? sender, TappedEventArgs e)
    {
        if (sender is Border border && border.DataContext is ComponentItem component)
        {
            _logger?.LogInformation("Component double-clicked: {ComponentId}", component.Id);

            // Publish component add requested event
            PublishComponentAddRequested(component);
        }
    }

    /// <summary>
    /// Publish library load requested event
    /// </summary>
    private async void PublishLibraryLoadRequested()
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            await _eventRouter.PublishAsync("library.load.requested", new { }, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('library.load.requested')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing library load requested event");
        }
    }

    /// <summary>
    /// Publish component drag started event
    /// </summary>
    private async void PublishComponentDragStarted(ComponentItem component)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { componentId = component.Id, componentName = component.Name };
            await _eventRouter.PublishAsync("library.component.drag.started", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('library.component.drag.started')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing component drag started event");
        }
    }

    /// <summary>
    /// Publish drag start requested event
    /// </summary>
    private async void PublishDragStartRequested(ComponentItem component)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { componentId = component.Id, componentName = component.Name };
            await _eventRouter.PublishAsync("library.component.drag.start.requested", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('library.component.drag.start.requested')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing drag start requested event");
        }
    }

    /// <summary>
    /// Publish component add requested event
    /// </summary>
    private async void PublishComponentAddRequested(ComponentItem component)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { componentId = component.Id, componentName = component.Name };
            await _eventRouter.PublishAsync("library.component.add.requested", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('library.component.add.requested')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing component add requested event");
        }
    }
}

