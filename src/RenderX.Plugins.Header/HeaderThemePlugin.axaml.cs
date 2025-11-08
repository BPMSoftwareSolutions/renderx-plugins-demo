using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using MusicalConductor.Avalonia.Interfaces;
using System;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header theme plugin - provides theme toggle in the header right slot
/// </summary>
public partial class HeaderThemePlugin : UserControl
{
    private IEventRouter? _eventRouter;
    private IConductorClient? _conductor;
    private ILogger<HeaderThemePlugin>? _logger;
    private bool _isDarkMode = false;

    public HeaderThemePlugin()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Initialize the header theme plugin with dependencies
    /// </summary>
    public void Initialize(IEventRouter eventRouter, IConductorClient conductor, ILogger<HeaderThemePlugin> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        _logger.LogInformation("HeaderThemePlugin initialized");

        // Update button text
        UpdateThemeButtonText();
    }

    /// <summary>
    /// Handle theme toggle button click
    /// </summary>
    private void OnThemeToggleClick(object? sender, RoutedEventArgs e)
    {
        _isDarkMode = !_isDarkMode;
        _logger?.LogInformation("Theme toggled to {Theme}", _isDarkMode ? "dark" : "light");
        
        UpdateThemeButtonText();

        // Publish theme changed event
        if (_eventRouter != null)
        {
            _eventRouter.PublishAsync("header.theme.changed", 
                new { isDarkMode = _isDarkMode, timestamp = DateTime.UtcNow }, 
                _conductor);
        }
    }

    /// <summary>
    /// Update theme button text
    /// </summary>
    private void UpdateThemeButtonText()
    {
        var button = this.FindControl<Button>("ThemeToggleButton");
        if (button != null)
        {
            button.Content = _isDarkMode ? "☀️ Light" : "🌙 Dark";
        }
    }
}

