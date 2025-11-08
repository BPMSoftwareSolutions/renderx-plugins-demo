using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using MusicalConductor.Avalonia.Interfaces;
using System;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header controls plugin - provides control buttons in the header center slot
/// </summary>
public partial class HeaderControlsPlugin : UserControl
{
    private IEventRouter? _eventRouter;
    private IConductorClient? _conductor;
    private ILogger<HeaderControlsPlugin>? _logger;

    public HeaderControlsPlugin()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Initialize the header controls plugin with dependencies
    /// </summary>
    public void Initialize(IEventRouter eventRouter, IConductorClient conductor, ILogger<HeaderControlsPlugin> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        _logger.LogInformation("HeaderControlsPlugin initialized");
    }

    /// <summary>
    /// Handle save button click
    /// </summary>
    private void OnSaveClick(object? sender, RoutedEventArgs e)
    {
        _logger?.LogInformation("Save button clicked");
        // Publish save event
        if (_eventRouter != null)
        {
            _eventRouter.PublishAsync("header.save.requested", new { timestamp = DateTime.UtcNow }, _conductor);
        }
    }

    /// <summary>
    /// Handle export button click
    /// </summary>
    private void OnExportClick(object? sender, RoutedEventArgs e)
    {
        _logger?.LogInformation("Export button clicked");
        // Publish export event
        if (_eventRouter != null)
        {
            _eventRouter.PublishAsync("header.export.requested", new { timestamp = DateTime.UtcNow }, _conductor);
        }
    }

    /// <summary>
    /// Handle import button click
    /// </summary>
    private void OnImportClick(object? sender, RoutedEventArgs e)
    {
        _logger?.LogInformation("Import button clicked");
        // Publish import event
        if (_eventRouter != null)
        {
            _eventRouter.PublishAsync("header.import.requested", new { timestamp = DateTime.UtcNow }, _conductor);
        }
    }
}

