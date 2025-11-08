using Avalonia;
using Avalonia.Controls;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using MusicalConductor.Avalonia.Interfaces;
using System;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header title plugin - displays application title in the header left slot
/// </summary>
public partial class HeaderTitlePlugin : UserControl
{
    private IEventRouter? _eventRouter;
    private IConductorClient? _conductor;
    private ILogger<HeaderTitlePlugin>? _logger;

    public HeaderTitlePlugin()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Initialize the header title plugin with dependencies
    /// </summary>
    public void Initialize(IEventRouter eventRouter, IConductorClient conductor, ILogger<HeaderTitlePlugin> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        _logger.LogInformation("HeaderTitlePlugin initialized");

        // Set title text
        var titleText = this.FindControl<TextBlock>("TitleText");
        if (titleText != null)
        {
            titleText.Text = "RenderX Design Studio";
        }
    }
}

