using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Core.Conductor;
using RenderX.Shell.Avalonia.Core.Events;
using System;
using System.Collections.ObjectModel;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.UI.Views;

/// <summary>
/// Control panel for editing component properties and executing interactions
/// </summary>
public partial class ControlPanelControl : UserControl
{
    private IEventRouter? _eventRouter;
    private IConductor? _conductor;
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
    public void Initialize(IEventRouter eventRouter, IConductor conductor, ILogger<ControlPanelControl> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

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
            _eventRouter.Subscribe<JsonElement>("canvas.component.selection.changed", async (payload) =>
            {
                _logger.LogDebug("Component selection changed event received");
                HandleComponentSelectionChanged(payload);
                await Task.CompletedTask;
            });

            // Subscribe to component updates
            _eventRouter.Subscribe<JsonElement>("canvas.component.updated", async (payload) =>
            {
                _logger.LogDebug("Component updated event received");
                HandleComponentUpdated(payload);
                await Task.CompletedTask;
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

                UpdateSelectedComponentDisplay(name);
                PopulateProperties(payload);
                PopulateInteractions();
                UpdateStatus($"Selected: {name}");
                _logger?.LogDebug("Component selected in control panel: {ComponentId}", _selectedComponentId);
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

            _logger?.LogDebug("Properties populated: {PropertyCount}", _properties.Count);
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
                await _conductor.PlayAsync<object>(
                    interaction.PluginId,
                    interaction.SequenceId,
                    data
                );

                UpdateStatus($"{interaction.Name} completed");
                _logger.LogDebug("Interaction completed: {InteractionName}", interaction.Name);
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

