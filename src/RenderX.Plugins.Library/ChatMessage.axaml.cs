using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using System;
using System.Text.Json;
using System.Threading.Tasks;

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

    public static readonly StyledProperty<DateTime> TimestampProperty =
        AvaloniaProperty.Register<ChatMessage, DateTime>(
            nameof(Timestamp),
            DateTime.Now);

    public static readonly StyledProperty<string> ComponentTagsProperty =
        AvaloniaProperty.Register<ChatMessage, string>(
            nameof(ComponentTags),
            "");

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

    public DateTime Timestamp
    {
        get => GetValue(TimestampProperty);
        set => SetValue(TimestampProperty, value);
    }

    public string ComponentTags
    {
        get => GetValue(ComponentTagsProperty);
        set => SetValue(ComponentTagsProperty, value);
    }

    public ChatMessage()
    {
        InitializeComponent();
        UpdateMessage();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == AuthorProperty || change.Property == ContentProperty || change.Property == IsUserMessageProperty || change.Property == TimestampProperty || change.Property == ComponentTagsProperty)
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

        var timestampText = this.FindControl<TextBlock>("TimestampText");
        if (timestampText != null)
        {
            timestampText.Text = Timestamp.ToString("h:mm tt");
        }

        // Update component tags
        var tagsPanel = this.FindControl<StackPanel>("ComponentTagsPanel");
        if (tagsPanel != null && !string.IsNullOrEmpty(ComponentTags))
        {
            tagsPanel.Children.Clear();
            var tags = ComponentTags.Split(',');
            foreach (var tag in tags)
            {
                var trimmedTag = tag.Trim();
                if (!string.IsNullOrEmpty(trimmedTag))
                {
                    var tagBorder = new Border
                    {
                        Background = new SolidColorBrush(Color.Parse("#E0E7FF")),
                        BorderBrush = new SolidColorBrush(Color.Parse("#818CF8")),
                        BorderThickness = new Thickness(1),
                        CornerRadius = new CornerRadius(4),
                        Padding = new Thickness(6, 2)
                    };
                    var tagText = new TextBlock
                    {
                        Text = trimmedTag,
                        FontSize = 9,
                        Foreground = new SolidColorBrush(Color.Parse("#4F46E5"))
                    };
                    tagBorder.Child = tagText;
                    tagsPanel.Children.Add(tagBorder);
                }
            }
        }

        var messageBorder = this.FindControl<Border>("MessageBorder");
        if (messageBorder != null)
        {
            messageBorder.Background = IsUserMessage
                ? new SolidColorBrush(Color.Parse("#E3F2FD"))
                : new SolidColorBrush(Color.Parse("#F5F5F5"));
        }
    }

    private void OnViewJSONClick(object? sender, RoutedEventArgs e)
    {
        var jsonDisplayBorder = this.FindControl<Border>("JSONDisplayBorder");
        var viewJSONButton = this.FindControl<Button>("ViewJSONButton");

        if (jsonDisplayBorder != null)
        {
            bool isVisible = jsonDisplayBorder.IsVisible;
            jsonDisplayBorder.IsVisible = !isVisible;

            // Update button text to reflect state
            if (viewJSONButton != null)
            {
                viewJSONButton.Content = isVisible ? "📄 View JSON" : "👁️ Hide JSON";
            }
        }
    }

    private void OnCloseJSONClick(object? sender, RoutedEventArgs e)
    {
        var jsonDisplayBorder = this.FindControl<Border>("JSONDisplayBorder");
        if (jsonDisplayBorder != null)
        {
            jsonDisplayBorder.IsVisible = false;

            // Reset button text
            var viewJSONButton = this.FindControl<Button>("ViewJSONButton");
            if (viewJSONButton != null)
            {
                viewJSONButton.Content = "📄 View JSON";
            }
        }
    }

    private async void OnCopyJSONClick(object? sender, RoutedEventArgs e)
    {
        try
        {
            var jsonContentText = this.FindControl<TextBlock>("JSONContentText");
            if (jsonContentText != null && !string.IsNullOrEmpty(jsonContentText.Text))
            {
                var jsonText = jsonContentText.Text;

                // Copy to clipboard
                var clipboard = TopLevel.GetTopLevel(this)?.Clipboard;
                if (clipboard != null)
                {
                    await clipboard.SetTextAsync(jsonText);

                    // Show feedback
                    var copyButton = this.FindControl<Button>("CopyJSONButton");
                    if (copyButton != null)
                    {
                        var originalContent = copyButton.Content;
                        copyButton.Content = "✓ Copied!";

                        // Reset after 2 seconds
                        await Task.Delay(2000);
                        copyButton.Content = originalContent;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error copying JSON: {ex.Message}");
        }
    }
}

