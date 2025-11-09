using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Empty state - displays when no component is selected
/// </summary>
public partial class EmptyState : UserControl
{
    public static readonly StyledProperty<string> TitleProperty =
        AvaloniaProperty.Register<EmptyState, string>(
            nameof(Title),
            "No Component Selected");

    public static readonly StyledProperty<string> MessageProperty =
        AvaloniaProperty.Register<EmptyState, string>(
            nameof(Message),
            "Select a component on the canvas to view its properties");

    public string Title
    {
        get => GetValue(TitleProperty);
        set => SetValue(TitleProperty, value);
    }

    public string Message
    {
        get => GetValue(MessageProperty);
        set => SetValue(MessageProperty, value);
    }

    public EmptyState()
    {
        InitializeComponent();
        UpdateContent();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == TitleProperty || change.Property == MessageProperty)
        {
            UpdateContent();
        }
    }

    private void UpdateContent()
    {
        var titleText = this.FindControl<TextBlock>("TitleText");
        if (titleText != null)
        {
            titleText.Text = Title;
        }

        var messageText = this.FindControl<TextBlock>("MessageText");
        if (messageText != null)
        {
            messageText.Text = Message;
        }
    }
}

