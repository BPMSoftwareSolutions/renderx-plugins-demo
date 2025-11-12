using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.MusicalConductor;

/// <summary>
/// Event bus monitor - displays event bus activity
/// </summary>
public partial class EventBusMonitor : UserControl
{
    public class EventInfo
    {
        public string Timestamp { get; set; } = "";
        public string Topic { get; set; } = "";
        public string Payload { get; set; } = "";
    }

    public static readonly StyledProperty<List<EventInfo>> EventsProperty =
        AvaloniaProperty.Register<EventBusMonitor, List<EventInfo>>(
            nameof(Events),
            new List<EventInfo>());

    public List<EventInfo> Events
    {
        get => GetValue(EventsProperty);
        set => SetValue(EventsProperty, value);
    }

    public EventBusMonitor()
    {
        InitializeComponent();
        UpdateMonitor();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == EventsProperty)
        {
            UpdateMonitor();
        }
    }

    private void UpdateMonitor()
    {
        var eventsControl = this.FindControl<ItemsControl>("EventsControl");
        if (eventsControl != null)
        {
            eventsControl.ItemsSource = Events;
        }

        var eventCountText = this.FindControl<TextBlock>("EventCountText");
        if (eventCountText != null)
        {
            eventCountText.Text = $"{Events.Count} events";
        }
    }
}

