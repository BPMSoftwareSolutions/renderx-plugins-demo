using Avalonia.Controls;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace RenderX.Shell.Avalonia.UI;

/// <summary>
/// Manages layout configuration and responsive layout logic for the main window
/// </summary>
public class LayoutManager
{
    private readonly ILogger<LayoutManager> _logger;
    private LayoutConfiguration _configuration;

    /// <summary>
    /// Layout configuration settings
    /// </summary>
    public class LayoutConfiguration
    {
        /// <summary>
        /// Width of the canvas panel (in pixels or percentage)
        /// </summary>
        public double CanvasWidth { get; set; } = 600;

        /// <summary>
        /// Width of the control panel (in pixels or percentage)
        /// </summary>
        public double ControlPanelWidth { get; set; } = 300;

        /// <summary>
        /// Minimum width for canvas panel
        /// </summary>
        public double MinCanvasWidth { get; set; } = 200;

        /// <summary>
        /// Minimum width for control panel
        /// </summary>
        public double MinControlPanelWidth { get; set; } = 150;

        /// <summary>
        /// Splitter thickness
        /// </summary>
        public double SplitterThickness { get; set; } = 4;

        /// <summary>
        /// Whether to persist layout preferences
        /// </summary>
        public bool PersistLayout { get; set; } = true;

        /// <summary>
        /// Layout persistence key
        /// </summary>
        public string PersistenceKey { get; set; } = "renderx_layout_config";

        /// <summary>
        /// Whether to use responsive layout
        /// </summary>
        public bool UseResponsiveLayout { get; set; } = true;

        /// <summary>
        /// Breakpoint width for responsive layout (switches to single column below this)
        /// </summary>
        public double ResponsiveBreakpoint { get; set; } = 800;
    }

    /// <summary>
    /// Layout state
    /// </summary>
    public class LayoutState
    {
        public double CanvasWidth { get; set; }
        public double ControlPanelWidth { get; set; }
        public bool IsResponsiveMode { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public LayoutManager(ILogger<LayoutManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _configuration = new LayoutConfiguration();
        _logger.LogInformation("LayoutManager initialized");
    }

    /// <summary>
    /// Initialize layout manager with configuration
    /// </summary>
    public void Initialize(LayoutConfiguration? configuration = null)
    {
        if (configuration != null)
        {
            _configuration = configuration;
        }

        _logger.LogInformation(
            "LayoutManager configured: CanvasWidth={CanvasWidth}, ControlPanelWidth={ControlPanelWidth}, " +
            "ResponsiveBreakpoint={ResponsiveBreakpoint}",
            _configuration.CanvasWidth,
            _configuration.ControlPanelWidth,
            _configuration.ResponsiveBreakpoint
        );
    }

    /// <summary>
    /// Get the current layout configuration
    /// </summary>
    public LayoutConfiguration GetConfiguration() => _configuration;

    /// <summary>
    /// Calculate layout dimensions based on available width
    /// </summary>
    public LayoutState CalculateLayout(double availableWidth, double availableHeight)
    {
        var state = new LayoutState
        {
            LastUpdated = DateTime.UtcNow
        };

        // Check if responsive mode should be activated
        if (_configuration.UseResponsiveLayout && availableWidth < _configuration.ResponsiveBreakpoint)
        {
            state.IsResponsiveMode = true;
            state.CanvasWidth = availableWidth;
            state.ControlPanelWidth = 0; // Hidden in responsive mode
            _logger.LogDebug("Responsive layout activated: AvailableWidth={AvailableWidth}", availableWidth);
        }
        else
        {
            state.IsResponsiveMode = false;

            // Calculate proportional widths
            var totalWidth = availableWidth - _configuration.SplitterThickness;
            var canvasWidth = Math.Max(_configuration.CanvasWidth, _configuration.MinCanvasWidth);
            var controlPanelWidth = Math.Max(_configuration.ControlPanelWidth, _configuration.MinControlPanelWidth);

            // If total requested width exceeds available, scale proportionally
            var totalRequested = canvasWidth + controlPanelWidth;
            if (totalRequested > totalWidth)
            {
                var scale = totalWidth / totalRequested;
                canvasWidth *= scale;
                controlPanelWidth *= scale;
            }

            state.CanvasWidth = canvasWidth;
            state.ControlPanelWidth = controlPanelWidth;
        }

        return state;
    }

    /// <summary>
    /// Update canvas width
    /// </summary>
    public void SetCanvasWidth(double width)
    {
        var newWidth = Math.Max(width, _configuration.MinCanvasWidth);
        if (Math.Abs(newWidth - _configuration.CanvasWidth) > 0.1)
        {
            _configuration.CanvasWidth = newWidth;
            _logger.LogDebug("Canvas width updated: {CanvasWidth}", newWidth);
        }
    }

    /// <summary>
    /// Update control panel width
    /// </summary>
    public void SetControlPanelWidth(double width)
    {
        var newWidth = Math.Max(width, _configuration.MinControlPanelWidth);
        if (Math.Abs(newWidth - _configuration.ControlPanelWidth) > 0.1)
        {
            _configuration.ControlPanelWidth = newWidth;
            _logger.LogDebug("Control panel width updated: {ControlPanelWidth}", newWidth);
        }
    }

    /// <summary>
    /// Reset layout to defaults
    /// </summary>
    public void ResetLayout()
    {
        _configuration.CanvasWidth = 600;
        _configuration.ControlPanelWidth = 300;
        _logger.LogInformation("Layout reset to defaults");
    }

    /// <summary>
    /// Get layout state as dictionary for persistence
    /// </summary>
    public Dictionary<string, object> GetLayoutState()
    {
        return new Dictionary<string, object>
        {
            { "canvasWidth", _configuration.CanvasWidth },
            { "controlPanelWidth", _configuration.ControlPanelWidth },
            { "timestamp", DateTime.UtcNow.Ticks }
        };
    }

    /// <summary>
    /// Restore layout state from dictionary
    /// </summary>
    public void RestoreLayoutState(Dictionary<string, object> state)
    {
        try
        {
            if (state.TryGetValue("canvasWidth", out var canvasWidth) && canvasWidth is double cw)
            {
                _configuration.CanvasWidth = cw;
            }

            if (state.TryGetValue("controlPanelWidth", out var controlPanelWidth) && controlPanelWidth is double cpw)
            {
                _configuration.ControlPanelWidth = cpw;
            }

            _logger.LogInformation("Layout state restored");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring layout state");
        }
    }

    /// <summary>
    /// Validate layout configuration
    /// </summary>
    public bool ValidateConfiguration()
    {
        var isValid = true;

        if (_configuration.CanvasWidth < _configuration.MinCanvasWidth)
        {
            _logger.LogWarning("Canvas width is less than minimum");
            isValid = false;
        }

        if (_configuration.ControlPanelWidth < _configuration.MinControlPanelWidth)
        {
            _logger.LogWarning("Control panel width is less than minimum");
            isValid = false;
        }

        if (_configuration.SplitterThickness < 1)
        {
            _logger.LogWarning("Splitter thickness is invalid");
            isValid = false;
        }

        return isValid;
    }
}

