using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Shapes;
using Avalonia.Media;

namespace RenderX.Plugins.Library;

/// <summary>
/// Config status UI - displays configuration status
/// </summary>
public partial class ConfigStatusUI : UserControl
{
    public static readonly StyledProperty<string> StatusProperty =
        AvaloniaProperty.Register<ConfigStatusUI, string>(
            nameof(Status),
            "Ready");

    public static readonly StyledProperty<string> DetailProperty =
        AvaloniaProperty.Register<ConfigStatusUI, string>(
            nameof(Detail),
            "Configuration loaded successfully");

    public static readonly StyledProperty<string> StatusColorProperty =
        AvaloniaProperty.Register<ConfigStatusUI, string>(
            nameof(StatusColor),
            "#10b981");

    public string Status
    {
        get => GetValue(StatusProperty);
        set => SetValue(StatusProperty, value);
    }

    public string Detail
    {
        get => GetValue(DetailProperty);
        set => SetValue(DetailProperty, value);
    }

    public string StatusColor
    {
        get => GetValue(StatusColorProperty);
        set => SetValue(StatusColorProperty, value);
    }

    public ConfigStatusUI()
    {
        InitializeComponent();
        UpdateStatus();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == StatusProperty || change.Property == DetailProperty || change.Property == StatusColorProperty)
        {
            UpdateStatus();
        }
    }

    private void UpdateStatus()
    {
        var statusText = this.FindControl<TextBlock>("StatusText");
        if (statusText != null)
        {
            statusText.Text = Status;
        }

        var detailText = this.FindControl<TextBlock>("DetailText");
        if (detailText != null)
        {
            detailText.Text = Detail;
        }

        var statusDot = this.FindControl<Ellipse>("StatusDot");
        if (statusDot != null)
        {
            statusDot.Fill = new SolidColorBrush(Color.Parse(StatusColor));
        }
    }
}

