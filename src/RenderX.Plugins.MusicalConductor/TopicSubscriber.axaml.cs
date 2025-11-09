using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;
using System.Collections.Generic;

namespace RenderX.Plugins.MusicalConductor;

/// <summary>
/// Topic subscriber - allows subscribing to topics
/// </summary>
public partial class TopicSubscriber : UserControl
{
    public class Message
    {
        public string Message { get; set; } = "";
    }

    public static readonly StyledProperty<bool> IsSubscribedProperty =
        AvaloniaProperty.Register<TopicSubscriber, bool>(
            nameof(IsSubscribed),
            false);

    public static readonly StyledProperty<List<Message>> MessagesProperty =
        AvaloniaProperty.Register<TopicSubscriber, List<Message>>(
            nameof(Messages),
            new List<Message>());

    public bool IsSubscribed
    {
        get => GetValue(IsSubscribedProperty);
        set => SetValue(IsSubscribedProperty, value);
    }

    public List<Message> Messages
    {
        get => GetValue(MessagesProperty);
        set => SetValue(MessagesProperty, value);
    }

    public TopicSubscriber()
    {
        InitializeComponent();
        UpdateSubscriber();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == IsSubscribedProperty || change.Property == MessagesProperty)
        {
            UpdateSubscriber();
        }
    }

    private void UpdateSubscriber()
    {
        var statusDot = this.FindControl<Ellipse>("StatusDot");
        if (statusDot != null)
        {
            statusDot.Fill = IsSubscribed ? new SolidColorBrush(Color.Parse("#10B981")) : new SolidColorBrush(Color.Parse("#999"));
        }

        var statusText = this.FindControl<TextBlock>("StatusText");
        if (statusText != null)
        {
            statusText.Text = IsSubscribed ? "Subscribed" : "Not subscribed";
        }

        var messagesControl = this.FindControl<ItemsControl>("MessagesControl");
        if (messagesControl != null)
        {
            messagesControl.ItemsSource = Messages;
        }
    }
}

