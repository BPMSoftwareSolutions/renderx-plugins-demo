using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Logging;
using MusicalConductor.Avalonia.Interfaces;
using System;
using System.Collections.ObjectModel;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Control panel for editing component properties and executing interactions
/// </summary>
public partial class ControlPanelControl : UserControl
{
    private IEventRouter? _eventRouter;
    private IConductorClient? _conductor;
    private ILogger<ControlPanelControl>? _logger;
    private ObservableCollection<PropertyItem> _properties;
    private ObservableCollection<InteractionItem> _interactions;
    private string? _selectedComponentId;

    /// <summary>
    /// Property item for display in property grid
    /// </summary>
    public class PropertyItem
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    /// <summary>
    /// Interaction item for display in interactions list
    /// </summary>
    public class InteractionItem
    {
        public string Name { get; set; } = string.Empty;
        public string SequenceId { get; set; } = string.Empty;
        public string PluginId { get; set; } = string.Empty;
    }

    public ControlPanelControl()
    {
        InitializeComponent();
        _properties = new ObservableCollection<PropertyItem>();
        _interactions = new ObservableCollection<InteractionItem>();
    }

    /// <summary>
    /// Initialize the control panel with dependencies
    /// </summary>
    public void Initialize(IEventRouter eventRouter, IConductorClient conductor, ILogger<ControlPanelControl> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));

        // Wrap logger with ConductorAwareLogger to emit logs through Musical Conductor event bus
        // This mirrors the web version's ctx.logger behavior with emoji icons (🧩 control-panel)
        _logger = new ConductorAwareLoggerWrapper<ControlPanelControl>(
            logger ?? throw new ArgumentNullException(nameof(logger)),
            eventRouter,
            conductor,
            "control-panel");

        _logger.LogInformation("ControlPanelControl initialized");

        // Set up ItemsControls
        var propertiesControl = this.FindControl<ItemsControl>("PropertiesItemsControl");
        if (propertiesControl != null)
        {
            propertiesControl.ItemsSource = _properties;
        }

        var interactionsControl = this.FindControl<ItemsControl>("InteractionsItemsControl");
        if (interactionsControl != null)
        {
            interactionsControl.ItemsSource = _interactions;
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
            // Subscribe to component selection
            _eventRouter.Subscribe("canvas.component.selection.changed", (payload) =>
            {
                _logger.LogDebug("Component selection changed event received");
                if (payload is JsonElement jsonPayload)
                {
                    HandleComponentSelectionChanged(jsonPayload);
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

            // Subscribe to selections cleared
            _eventRouter.Subscribe("canvas.component.selections.cleared", (payload) =>
            {
                _logger.LogDebug("Canvas selections cleared event received");
                HandleSelectionsCleared();
            });

            _logger.LogInformation("Control panel event subscriptions established");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error subscribing to canvas events");
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
                _selectedComponentId = idElement.GetString();
                var name = payload.TryGetProperty("name", out var nameElement)
                    ? nameElement.GetString() ?? "Unknown"
                    : "Unknown";

                _logger?.LogInformation("[cp] Control Panel received selection changed: {ComponentId}", _selectedComponentId);

                UpdateSelectedComponentDisplay(name);
                PopulateProperties(payload);
                PopulateInteractions();
                UpdateStatus($"Selected: {name}");

                _logger?.LogInformation("[cp] Control Panel updated for component: {ComponentName}", name);

                // Publish control panel update requested event
                PublishUpdateRequested(payload);
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling component selection changed event");
        }
    }

    /// <summary>
    /// Handle component updated event
    /// </summary>
    private void HandleComponentUpdated(JsonElement payload)
    {
        try
        {
            if (payload.TryGetProperty("id", out var idElement) && idElement.GetString() == _selectedComponentId)
            {
                PopulateProperties(payload);
                UpdateStatus("Component updated");
                _logger?.LogDebug("Component updated in control panel: {ComponentId}", _selectedComponentId);
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling component updated event");
        }
    }

    /// <summary>
    /// Update selected component display
    /// </summary>
    private void UpdateSelectedComponentDisplay(string componentName)
    {
        var selectedText = this.FindControl<TextBlock>("SelectedComponentText");
        if (selectedText != null)
        {
            selectedText.Text = $"({componentName})";
        }
    }

    /// <summary>
    /// Populate properties from component data
    /// </summary>
    private void PopulateProperties(JsonElement componentData)
    {
        _properties.Clear();
        _logger?.LogInformation("[cp] Populating properties for component");

        try
        {
            // Add basic properties
            if (componentData.TryGetProperty("id", out var id))
            {
                _properties.Add(new PropertyItem { Key = "ID", Value = id.GetString() ?? "" });
            }

            if (componentData.TryGetProperty("name", out var name))
            {
                _properties.Add(new PropertyItem { Key = "Name", Value = name.GetString() ?? "" });
            }

            if (componentData.TryGetProperty("type", out var type))
            {
                _properties.Add(new PropertyItem { Key = "Type", Value = type.GetString() ?? "" });
            }

            _logger?.LogInformation("[cp] Populated {PropertyCount} properties", _properties.Count);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error populating properties");
        }
    }

    /// <summary>
    /// Populate interactions for the selected component
    /// </summary>
    private void PopulateInteractions()
    {
        _interactions.Clear();

        try
        {
            // Add common interactions
            _interactions.Add(new InteractionItem 
            { 
                Name = "Edit", 
                SequenceId = "edit", 
                PluginId = "ControlPanelPlugin" 
            });
            _interactions.Add(new InteractionItem 
            { 
                Name = "Delete", 
                SequenceId = "delete", 
                PluginId = "CanvasComponentPlugin" 
            });
            _interactions.Add(new InteractionItem 
            { 
                Name = "Duplicate", 
                SequenceId = "duplicate", 
                PluginId = "CanvasComponentPlugin" 
            });

            _logger?.LogDebug("Interactions populated: {InteractionCount}", _interactions.Count);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error populating interactions");
        }
    }

    /// <summary>
    /// Handle interaction button click
    /// </summary>
    private async void OnInteractionButtonClicked(object? sender, RoutedEventArgs e)
    {
        if (_conductor == null || _logger == null)
            return;

        if (sender is Button button && button.DataContext is InteractionItem interaction)
        {
            try
            {
                _logger.LogDebug("Executing interaction: {InteractionName}", interaction.Name);
                UpdateStatus($"Executing {interaction.Name}...");

                var data = new { componentId = _selectedComponentId };
                _conductor.Play(
                    interaction.PluginId,
                    interaction.SequenceId,
                    data
                );

                UpdateStatus($"{interaction.Name} completed");
                _logger.LogDebug("Interaction completed: {InteractionName}", interaction.Name);
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                UpdateStatus($"Error: {ex.Message}");
                _logger.LogError(ex, "Error executing interaction: {InteractionName}", interaction.Name);
            }
        }
    }

    /// <summary>
    /// Handle apply CSS classes button click
    /// </summary>
    private async void OnApplyCssClassesClicked(object? sender, RoutedEventArgs e)
    {
        if (_eventRouter == null || _conductor == null || _logger == null)
            return;

        try
        {
            var cssInput = this.FindControl<TextBox>("CssClassesInput");
            if (cssInput != null && !string.IsNullOrWhiteSpace(cssInput.Text) && _selectedComponentId != null)
            {
                _logger.LogDebug("Applying CSS classes: {CssClasses}", cssInput.Text);
                UpdateStatus("Applying CSS classes...");

                var payload = new
                {
                    componentId = _selectedComponentId,
                    cssClasses = cssInput.Text
                };

                await _eventRouter.PublishAsync("control.panel.css.classes.applied", payload, _conductor);
                UpdateStatus("CSS classes applied");
                _logger.LogDebug("CSS classes applied successfully");
            }
        }
        catch (Exception ex)
        {
            UpdateStatus($"Error: {ex.Message}");
            _logger.LogError(ex, "Error applying CSS classes");
        }
    }

    /// <summary>
    /// Handle selections cleared event
    /// </summary>
    private void HandleSelectionsCleared()
    {
        try
        {
            _logger?.LogInformation("[cp] Control Panel received selections cleared");

            _selectedComponentId = null;
            _properties.Clear();
            _interactions.Clear();
            UpdateSelectedComponentDisplay("None");
            UpdateStatus("Selection cleared");

            _logger?.LogInformation("[cp] Control panel cleared");
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error handling selections cleared event");
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

    /// <summary>
    /// Publish control panel update requested event
    /// </summary>
    private async void PublishUpdateRequested(JsonElement payload)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            await _eventRouter.PublishAsync("control.panel.update.requested", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('control.panel.update.requested')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing update requested event");
        }
    }

    /// <summary>
    /// Publish control panel selection updated event
    /// </summary>
    private async void PublishSelectionUpdated(object selectionModel)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            await _eventRouter.PublishAsync("control.panel.selection.updated", selectionModel, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('control.panel.selection.updated')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing selection updated event");
        }
    }

    /// <summary>
    /// Publish control panel classes updated event
    /// </summary>
    private async void PublishClassesUpdated(string componentId, string[] classes)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { id = componentId, classes = classes };
            await _eventRouter.PublishAsync("control.panel.classes.updated", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('control.panel.classes.updated')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing classes updated event");
        }
    }

    /// <summary>
    /// Publish control panel CSS registry updated event
    /// </summary>
    private async void PublishCssRegistryUpdated(string className, string content)
    {
        if (_eventRouter == null || _logger == null)
            return;

        try
        {
            var payload = new { className = className, content = content, timestamp = DateTime.UtcNow };
            await _eventRouter.PublishAsync("control.panel.css.registry.updated", payload, _conductor);
            _logger.LogInformation("📡 EventRouter.publish('control.panel.css.registry.updated')");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing CSS registry updated event");
        }
    }
}

