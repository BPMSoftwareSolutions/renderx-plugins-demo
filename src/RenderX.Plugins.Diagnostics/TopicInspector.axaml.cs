using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Topic inspector - displays registered topics and subscriber information
/// </summary>
public partial class TopicInspector : UserControl
{
    public class TopicInfo
    {
        public string Name { get; set; } = "";
        public string SubscriberCount { get; set; } = "";
        public string LastPublished { get; set; } = "";
    }

    public static readonly StyledProperty<List<TopicInfo>> TopicsProperty =
        AvaloniaProperty.Register<TopicInspector, List<TopicInfo>>(
            nameof(Topics),
            new List<TopicInfo>());

    public List<TopicInfo> Topics
    {
        get => GetValue(TopicsProperty);
        set => SetValue(TopicsProperty, value);
    }

    public TopicInspector()
    {
        InitializeComponent();
        UpdateTopics();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == TopicsProperty)
        {
            UpdateTopics();
        }
    }

    private void UpdateTopics()
    {
        var topicsControl = this.FindControl<ItemsControl>("TopicsItemsControl");
        if (topicsControl != null)
        {
            topicsControl.ItemsSource = Topics;
        }
    }
}

