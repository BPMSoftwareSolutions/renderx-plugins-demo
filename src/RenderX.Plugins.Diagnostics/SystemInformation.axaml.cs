using Avalonia;
using Avalonia.Controls;
using System;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// System information - displays system and runtime information
/// </summary>
public partial class SystemInformation : UserControl
{
    public static readonly StyledProperty<string> OSProperty =
        AvaloniaProperty.Register<SystemInformation, string>(
            nameof(OS),
            "Unknown");

    public static readonly StyledProperty<string> RuntimeProperty =
        AvaloniaProperty.Register<SystemInformation, string>(
            nameof(Runtime),
            "Unknown");

    public static readonly StyledProperty<int> ProcessorCoresProperty =
        AvaloniaProperty.Register<SystemInformation, int>(
            nameof(ProcessorCores),
            0);

    public static readonly StyledProperty<long> TotalMemoryProperty =
        AvaloniaProperty.Register<SystemInformation, long>(
            nameof(TotalMemory),
            0);

    public static readonly StyledProperty<string> ApplicationVersionProperty =
        AvaloniaProperty.Register<SystemInformation, string>(
            nameof(ApplicationVersion),
            "1.0.0");

    public string OS
    {
        get => GetValue(OSProperty);
        set => SetValue(OSProperty, value);
    }

    public string Runtime
    {
        get => GetValue(RuntimeProperty);
        set => SetValue(RuntimeProperty, value);
    }

    public int ProcessorCores
    {
        get => GetValue(ProcessorCoresProperty);
        set => SetValue(ProcessorCoresProperty, value);
    }

    public long TotalMemory
    {
        get => GetValue(TotalMemoryProperty);
        set => SetValue(TotalMemoryProperty, value);
    }

    public string ApplicationVersion
    {
        get => GetValue(ApplicationVersionProperty);
        set => SetValue(ApplicationVersionProperty, value);
    }

    public SystemInformation()
    {
        InitializeComponent();
        UpdateSystemInfo();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == OSProperty || change.Property == RuntimeProperty || 
            change.Property == ProcessorCoresProperty || change.Property == TotalMemoryProperty || 
            change.Property == ApplicationVersionProperty)
        {
            UpdateSystemInfo();
        }
    }

    private void UpdateSystemInfo()
    {
        var osText = this.FindControl<TextBlock>("OSText");
        if (osText != null)
        {
            osText.Text = OS;
        }

        var runtimeText = this.FindControl<TextBlock>("RuntimeText");
        if (runtimeText != null)
        {
            runtimeText.Text = Runtime;
        }

        var processorText = this.FindControl<TextBlock>("ProcessorText");
        if (processorText != null)
        {
            processorText.Text = $"{ProcessorCores} cores";
        }

        var memoryText = this.FindControl<TextBlock>("MemoryText");
        if (memoryText != null)
        {
            memoryText.Text = $"{TotalMemory / (1024 * 1024 * 1024)} GB";
        }

        var versionText = this.FindControl<TextBlock>("VersionText");
        if (versionText != null)
        {
            versionText.Text = ApplicationVersion;
        }
    }
}

