using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Logging;
using MusicalConductor.Avalonia.Interfaces;
using MusicalConductor.Core.Interfaces;
using System;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header controls plugin - provides control buttons in the header center slot
/// </summary>
public partial class HeaderControlsPlugin : UserControl
{
    private IEventRouter? _eventRouter;
    private MusicalConductor.Avalonia.Interfaces.IConductorClient? _conductor;
    private ILogger<HeaderControlsPlugin>? _logger;

    public HeaderControlsPlugin()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Initialize the header controls plugin with dependencies
    /// </summary>
    public void Initialize(IEventRouter eventRouter, MusicalConductor.Avalonia.Interfaces.IConductorClient conductor, ILogger<HeaderControlsPlugin> logger, IEventBus eventBus)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));

        // Wrap logger with ConductorAwareLogger to emit logs through Musical Conductor event bus
        // This mirrors the web version's ctx.logger behavior with emoji icons (🧩 header)
        _logger = new ConductorAwareLoggerWrapper<HeaderControlsPlugin>(
            logger ?? throw new ArgumentNullException(nameof(logger)),
            eventBus ?? throw new ArgumentNullException(nameof(eventBus)),
            "header");

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

