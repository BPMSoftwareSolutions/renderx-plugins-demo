using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Plugin detail - displays detailed information about a plugin
/// </summary>
public partial class PluginDetail : UserControl
{
    public static readonly StyledProperty<string> PluginNameProperty =
        AvaloniaProperty.Register<PluginDetail, string>(
            nameof(PluginName),
            "Unknown");

    public static readonly StyledProperty<string> StatusProperty =
        AvaloniaProperty.Register<PluginDetail, string>(
            nameof(Status),
            "Loaded");

    public static readonly StyledProperty<string> VersionProperty =
        AvaloniaProperty.Register<PluginDetail, string>(
            nameof(Version),
            "1.0.0");

    public static readonly StyledProperty<long> LoadTimeProperty =
        AvaloniaProperty.Register<PluginDetail, long>(
            nameof(LoadTime),
            0);

    public static readonly StyledProperty<string> ErrorMessageProperty =
        AvaloniaProperty.Register<PluginDetail, string>(
            nameof(ErrorMessage),
            "");

    public string PluginName
    {
        get => GetValue(PluginNameProperty);
        set => SetValue(PluginNameProperty, value);
    }

    public string Status
    {
        get => GetValue(StatusProperty);
        set => SetValue(StatusProperty, value);
    }

    public string Version
    {
        get => GetValue(VersionProperty);
        set => SetValue(VersionProperty, value);
    }

    public long LoadTime
    {
        get => GetValue(LoadTimeProperty);
        set => SetValue(LoadTimeProperty, value);
    }

    public string ErrorMessage
    {
        get => GetValue(ErrorMessageProperty);
        set => SetValue(ErrorMessageProperty, value);
    }

    public PluginDetail()
    {
        InitializeComponent();
        UpdateDetail();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == PluginNameProperty || change.Property == StatusProperty || 
            change.Property == VersionProperty || change.Property == LoadTimeProperty || 
            change.Property == ErrorMessageProperty)
        {
            UpdateDetail();
        }
    }

    private void UpdateDetail()
    {
        var pluginName = this.FindControl<TextBlock>("PluginName");
        if (pluginName != null)
        {
            pluginName.Text = PluginName;
        }

        var statusText = this.FindControl<TextBlock>("StatusText");
        if (statusText != null)
        {
            statusText.Text = Status;
        }

        var statusDot = this.FindControl<Ellipse>("StatusDot");
        if (statusDot != null)
        {
            statusDot.Fill = new SolidColorBrush(Status == "Loaded" ? Color.Parse("#10b981") : Color.Parse("#EF5350"));
        }

        var versionText = this.FindControl<TextBlock>("VersionText");
        if (versionText != null)
        {
            versionText.Text = Version;
        }

        var loadTimeText = this.FindControl<TextBlock>("LoadTimeText");
        if (loadTimeText != null)
        {
            loadTimeText.Text = $"{LoadTime}ms";
        }

        var errorBorder = this.FindControl<Border>("ErrorBorder");
        if (errorBorder != null)
        {
            errorBorder.IsVisible = !string.IsNullOrEmpty(ErrorMessage);
        }

        var errorText = this.FindControl<TextBlock>("ErrorText");
        if (errorText != null)
        {
            errorText.Text = ErrorMessage;
        }
    }
}

