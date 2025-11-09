using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;

namespace RenderX.Plugins.Library;

/// <summary>
/// Chat message - displays a single chat message
/// </summary>
public partial class ChatMessage : UserControl
{
    public static readonly StyledProperty<string> AuthorProperty =
        AvaloniaProperty.Register<ChatMessage, string>(
            nameof(Author),
            "User");

    public static readonly StyledProperty<string> ContentProperty =
        AvaloniaProperty.Register<ChatMessage, string>(
            nameof(Content),
            "");

    public static readonly StyledProperty<bool> IsUserMessageProperty =
        AvaloniaProperty.Register<ChatMessage, bool>(
            nameof(IsUserMessage),
            true);

    public string Author
    {
        get => GetValue(AuthorProperty);
        set => SetValue(AuthorProperty, value);
    }

    public string Content
    {
        get => GetValue(ContentProperty);
        set => SetValue(ContentProperty, value);
    }

    public bool IsUserMessage
    {
        get => GetValue(IsUserMessageProperty);
        set => SetValue(IsUserMessageProperty, value);
    }

    public ChatMessage()
    {
        InitializeComponent();
        UpdateMessage();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == AuthorProperty || change.Property == ContentProperty || change.Property == IsUserMessageProperty)
        {
            UpdateMessage();
        }
    }

    private void UpdateMessage()
    {
        var authorText = this.FindControl<TextBlock>("AuthorText");
        if (authorText != null)
        {
            authorText.Text = Author;
        }

        var contentText = this.FindControl<TextBlock>("ContentText");
        if (contentText != null)
        {
            contentText.Text = Content;
        }

        var messageBorder = this.FindControl<Border>("MessageBorder");
        if (messageBorder != null)
        {
            messageBorder.Background = IsUserMessage 
                ? new SolidColorBrush(Color.Parse("#E3F2FD"))
                : new SolidColorBrush(Color.Parse("#F5F5F5"));
        }
    }
}

