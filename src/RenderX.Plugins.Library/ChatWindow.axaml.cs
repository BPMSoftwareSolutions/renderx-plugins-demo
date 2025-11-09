using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.Collections.Generic;

namespace RenderX.Plugins.Library;

/// <summary>
/// Chat window - displays chat messages and input for AI interactions
/// </summary>
public partial class ChatWindow : UserControl
{
    public static readonly RoutedEvent<RoutedEventArgs> MessageSentEvent =
        RoutedEvent.Register<ChatWindow, RoutedEventArgs>(
            nameof(MessageSent),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? MessageSent
    {
        add => AddHandler(MessageSentEvent, value);
        remove => RemoveHandler(MessageSentEvent, value);
    }

    public static readonly StyledProperty<List<(string Author, string Content)>> MessagesProperty =
        AvaloniaProperty.Register<ChatWindow, List<(string, string)>>(
            nameof(Messages),
            new List<(string, string)>());

    public List<(string Author, string Content)> Messages
    {
        get => GetValue(MessagesProperty);
        set => SetValue(MessagesProperty, value);
    }

    public ChatWindow()
    {
        InitializeComponent();
        UpdateMessages();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == MessagesProperty)
        {
            UpdateMessages();
        }
    }

    private void OnSendClick(object? sender, RoutedEventArgs e)
    {
        var input = this.FindControl<TextBox>("MessageInput");
        if (input != null && !string.IsNullOrWhiteSpace(input.Text))
        {
            Messages.Add(("User", input.Text));
            input.Text = "";
            RaiseEvent(new RoutedEventArgs(MessageSentEvent));
        }
    }

    private void UpdateMessages()
    {
        var messagesControl = this.FindControl<ItemsControl>("MessagesItemsControl");
        if (messagesControl != null)
        {
            messagesControl.ItemsSource = Messages;
        }
    }
}

