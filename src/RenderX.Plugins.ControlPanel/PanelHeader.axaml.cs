using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Panel header - displays title and subtitle for control panel sections
/// </summary>
public partial class PanelHeader : UserControl
{
    public static readonly StyledProperty<string> TitleProperty =
        AvaloniaProperty.Register<PanelHeader, string>(
            nameof(Title),
            "Properties");

    public static readonly StyledProperty<string> SubtitleProperty =
        AvaloniaProperty.Register<PanelHeader, string>(
            nameof(Subtitle),
            "(none selected)");

    public string Title
    {
        get => GetValue(TitleProperty);
        set => SetValue(TitleProperty, value);
    }

    public string Subtitle
    {
        get => GetValue(SubtitleProperty);
        set => SetValue(SubtitleProperty, value);
    }

    public PanelHeader()
    {
        InitializeComponent();
        UpdateHeader();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == TitleProperty || change.Property == SubtitleProperty)
        {
            UpdateHeader();
        }
    }

    private void UpdateHeader()
    {
        var titleText = this.FindControl<TextBlock>("TitleText");
        if (titleText != null)
        {
            titleText.Text = Title;
        }

        var subtitleText = this.FindControl<TextBlock>("SubtitleText");
        if (subtitleText != null)
        {
            subtitleText.Text = Subtitle;
        }
    }
}

