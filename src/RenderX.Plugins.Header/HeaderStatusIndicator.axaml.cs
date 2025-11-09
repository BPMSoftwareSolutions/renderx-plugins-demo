using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Shapes;
using Avalonia.Media;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header status indicator - displays application status with visual indicator
/// </summary>
public partial class HeaderStatusIndicator : UserControl
{
    public static readonly StyledProperty<string> StatusProperty =
        AvaloniaProperty.Register<HeaderStatusIndicator, string>(
            nameof(Status),
            "Ready");

    public static readonly StyledProperty<string> StatusColorProperty =
        AvaloniaProperty.Register<HeaderStatusIndicator, string>(
            nameof(StatusColor),
            "#10b981");

    public string Status
    {
        get => GetValue(StatusProperty);
        set => SetValue(StatusProperty, value);
    }

    public string StatusColor
    {
        get => GetValue(StatusColorProperty);
        set => SetValue(StatusColorProperty, value);
    }

    public HeaderStatusIndicator()
    {
        InitializeComponent();
        UpdateStatus();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == StatusProperty || change.Property == StatusColorProperty)
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

        var statusDot = this.FindControl<Ellipse>("StatusDot");
        if (statusDot != null)
        {
            try
            {
                statusDot.Fill = new SolidColorBrush(Color.Parse(StatusColor));
            }
            catch
            {
                // Fallback to green if color parsing fails
                statusDot.Fill = new SolidColorBrush(Color.Parse("#10b981"));
            }
        }
    }
}

