using Avalonia;
using Avalonia.Controls;
using System;
using System.Collections.Generic;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Diagnostics panel - displays plugin loading stats and system information
/// </summary>
public partial class DiagnosticsPanel : UserControl
{
    public static readonly StyledProperty<int> LoadedPluginsProperty =
        AvaloniaProperty.Register<DiagnosticsPanel, int>(
            nameof(LoadedPlugins),
            0);

    public static readonly StyledProperty<int> FailedPluginsProperty =
        AvaloniaProperty.Register<DiagnosticsPanel, int>(
            nameof(FailedPlugins),
            0);

    public static readonly StyledProperty<List<(string Name, string Version)>> PluginsProperty =
        AvaloniaProperty.Register<DiagnosticsPanel, List<(string, string)>>(
            nameof(Plugins),
            new List<(string, string)>());

    public int LoadedPlugins
    {
        get => GetValue(LoadedPluginsProperty);
        set => SetValue(LoadedPluginsProperty, value);
    }

    public int FailedPlugins
    {
        get => GetValue(FailedPluginsProperty);
        set => SetValue(FailedPluginsProperty, value);
    }

    public List<(string Name, string Version)> Plugins
    {
        get => GetValue(PluginsProperty);
        set => SetValue(PluginsProperty, value);
    }

    public DiagnosticsPanel()
    {
        InitializeComponent();
        UpdateDiagnostics();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == LoadedPluginsProperty || change.Property == FailedPluginsProperty || change.Property == PluginsProperty)
        {
            UpdateDiagnostics();
        }
    }

    private void UpdateDiagnostics()
    {
        var loadedCount = this.FindControl<TextBlock>("LoadedPluginsCount");
        if (loadedCount != null)
        {
            loadedCount.Text = LoadedPlugins.ToString();
        }

        var failedCount = this.FindControl<TextBlock>("FailedPluginsCount");
        if (failedCount != null)
        {
            failedCount.Text = FailedPlugins.ToString();
        }

        var totalCount = this.FindControl<TextBlock>("TotalPluginsCount");
        if (totalCount != null)
        {
            totalCount.Text = (LoadedPlugins + FailedPlugins).ToString();
        }

        var pluginsControl = this.FindControl<ItemsControl>("PluginsItemsControl");
        if (pluginsControl != null)
        {
            pluginsControl.ItemsSource = Plugins;
        }

        var runtimeText = this.FindControl<TextBlock>("RuntimeText");
        if (runtimeText != null)
        {
            runtimeText.Text = $".NET {Environment.Version.Major}.{Environment.Version.Minor}";
        }

        var osText = this.FindControl<TextBlock>("OSText");
        if (osText != null)
        {
            osText.Text = Environment.OSVersion.Platform.ToString();
        }
    }
}

