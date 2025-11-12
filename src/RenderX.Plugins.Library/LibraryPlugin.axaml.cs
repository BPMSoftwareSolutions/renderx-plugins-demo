using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Logging;
using MusicalConductor.Avalonia.Interfaces;
using MusicalConductor.Core.Interfaces;
using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Text.Json.Nodes;

namespace RenderX.Plugins.Library;

/// <summary>
/// Library plugin - displays component library in the library slot
/// </summary>
public partial class LibraryPlugin : UserControl
{
    private IEventRouter? _eventRouter;
    private MusicalConductor.Avalonia.Interfaces.IConductorClient? _conductor;
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
        public string Icon { get; set; } = "🧩";
    }

    public LibraryPlugin()
    {
        InitializeComponent();
        _components = new ObservableCollection<ComponentItem>();
    }

    /// <summary>
    /// Initialize the library plugin with dependencies
    /// </summary>
    public void Initialize(IEventRouter eventRouter, MusicalConductor.Avalonia.Interfaces.IConductorClient conductor, ILogger<LibraryPlugin> logger, IEventBus eventBus)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));

        // Wrap logger with ConductorAwareLogger to emit logs through Musical Conductor event bus
        // This mirrors the web version's ctx.logger behavior with emoji icons (🧩 library-component)
        _logger = new ConductorAwareLoggerWrapper<LibraryPlugin>(
            logger ?? throw new ArgumentNullException(nameof(logger)),
            eventBus ?? throw new ArgumentNullException(nameof(eventBus)),
            "library-component");

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
    /// Load components from JSON files in json-components folder
    /// </summary>
    private void LoadSampleComponents()
    {
        // Publish library load requested event
        PublishLibraryLoadRequested();

        try
        {
            // Find json-components folder (in workspace root)
            var currentDir = Directory.GetCurrentDirectory();
            var jsonComponentsPath = Path.Combine(currentDir, "json-components");

            if (!Directory.Exists(jsonComponentsPath))
            {
                _logger?.LogWarning("json-components folder not found at: {Path}", jsonComponentsPath);
                LoadFallbackComponents();
                return;
            }

            // Load all .json files except index.json
            var jsonFiles = Directory.GetFiles(jsonComponentsPath, "*.json", SearchOption.TopDirectoryOnly)
                .Where(f => !Path.GetFileName(f).Equals("index.json", StringComparison.OrdinalIgnoreCase))
                .ToArray();

            _logger?.LogInformation("Found {Count} component JSON files in {Path}", jsonFiles.Length, jsonComponentsPath);

            foreach (var filePath in jsonFiles)
            {
                try
                {
                    var component = LoadComponentFromJson(filePath);
                    if (component != null)
                    {
                        _components.Add(component);
                        _logger?.LogDebug("Loaded component: {Name} ({Icon})", component.Name, component.Icon);
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Failed to load component from {File}", Path.GetFileName(filePath));
                }
            }

            _logger?.LogInformation("Loaded {Count} components from JSON files", _components.Count);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Failed to load components from JSON");
            LoadFallbackComponents();
        }
    }

    /// <summary>
    /// Load a component from a JSON file
    /// </summary>
    private ComponentItem? LoadComponentFromJson(string filePath)
    {
        var json = File.ReadAllText(filePath);
        var doc = JsonNode.Parse(json);

        if (doc == null)
        {
            return null;
        }

        var metadata = doc["metadata"];
        if (metadata == null)
        {
            return null;
        }

        var ui = doc["ui"];
        var icon = ui?["icon"];

        return new ComponentItem
        {
            Id = metadata["type"]?.GetValue<string>() ?? Path.GetFileNameWithoutExtension(filePath),
            Name = metadata["name"]?.GetValue<string>() ?? "Unknown",
            Category = metadata["category"]?.GetValue<string>() ?? "Other",
            Description = metadata["description"]?.GetValue<string>() ?? "",
            Icon = icon?["value"]?.GetValue<string>() ?? "🧩"
        };
    }

    /// <summary>
    /// Load fallback components if JSON loading fails
    /// </summary>
    private void LoadFallbackComponents()
    {
        _logger?.LogWarning("Loading fallback hardcoded components");

        _components.Add(new ComponentItem
        {
            Id = "button",
            Name = "Button",
            Category = "Input",
            Description = "Interactive button component",
            Icon = "🔘"
        });
        _components.Add(new ComponentItem
        {
            Id = "container",
            Name = "Container",
            Category = "Layout",
            Description = "Container panel component",
            Icon = "📦"
        });

        _logger?.LogInformation("Loaded {Count} fallback components", _components.Count);
    }

    /// <summary>
    /// Handle component drag start
    /// </summary>
    private void OnComponentPointerPressed(object? sender, PointerPressedEventArgs e)
    {
        if (sender is Border border && border.DataContext is ComponentItem component)
        {
            _logger?.LogInformation("Library component drag started: {ComponentId}", component.Id);

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
            _logger?.LogInformation("Library component double-clicked: {ComponentId}", component.Id);

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
            _logger.LogInformation("Library requesting component load");
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
            _logger.LogInformation("Library publishing drag started for: {ComponentId}", component.Id);
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

    /// <summary>
    /// Handle AI Chat toggle button click
    /// </summary>
    private void OnAIChatToggle(object? sender, RoutedEventArgs e)
    {
        var aiToggleButton = this.FindControl<Button>("AIToggleButton");
        if (aiToggleButton != null)
        {
            aiToggleButton.Content = "🤖 AI Chat (Opening...)";
            _logger?.LogInformation("AI Chat toggle clicked");
        }
    }

    /// <summary>
    /// Show AI availability hint when AI is not configured
    /// </summary>
    public void ShowAIAvailabilityHint()
    {
        var hint = this.FindControl<Border>("AIAvailabilityHint");
        if (hint != null)
        {
            hint.IsVisible = true;
            _logger?.LogInformation("AI availability hint shown");
        }
    }

    /// <summary>
    /// Hide AI availability hint when AI is configured
    /// </summary>
    public void HideAIAvailabilityHint()
    {
        var hint = this.FindControl<Border>("AIAvailabilityHint");
        if (hint != null)
        {
            hint.IsVisible = false;
            _logger?.LogInformation("AI availability hint hidden");
        }
    }
}

