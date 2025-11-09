using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Loading state - displays loading indicator while properties are being loaded
/// </summary>
public partial class LoadingState : UserControl
{
    public static readonly StyledProperty<string> MessageProperty =
        AvaloniaProperty.Register<LoadingState, string>(
            nameof(Message),
            "Loading properties...");

    public string Message
    {
        get => GetValue(MessageProperty);
        set => SetValue(MessageProperty, value);
    }

    public LoadingState()
    {
        InitializeComponent();
        UpdateMessage();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == MessageProperty)
        {
            UpdateMessage();
        }
    }

    private void UpdateMessage()
    {
        var messageText = this.FindControl<TextBlock>("MessageText");
        if (messageText != null)
        {
            messageText.Text = Message;
        }
    }
}

