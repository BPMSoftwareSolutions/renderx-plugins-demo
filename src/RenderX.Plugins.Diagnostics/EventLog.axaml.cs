using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.Collections.Generic;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Event log - displays system events and diagnostics logs
/// </summary>
public partial class EventLog : UserControl
{
    public class LogEntry
    {
        public string Timestamp { get; set; } = "";
        public string Level { get; set; } = "";
        public string Message { get; set; } = "";
    }

    public static readonly StyledProperty<List<LogEntry>> EntriesProperty =
        AvaloniaProperty.Register<EventLog, List<LogEntry>>(
            nameof(Entries),
            new List<LogEntry>());

    public List<LogEntry> Entries
    {
        get => GetValue(EntriesProperty);
        set => SetValue(EntriesProperty, value);
    }

    public EventLog()
    {
        InitializeComponent();
        UpdateLog();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == EntriesProperty)
        {
            UpdateLog();
        }
    }

    private void OnClearClick(object? sender, RoutedEventArgs e)
    {
        Entries.Clear();
        UpdateLog();
    }

    private void UpdateLog()
    {
        var logControl = this.FindControl<ItemsControl>("LogItemsControl");
        if (logControl != null)
        {
            logControl.ItemsSource = Entries;
        }

        var entryCount = this.FindControl<TextBlock>("EntryCountText");
        if (entryCount != null)
        {
            entryCount.Text = $"{Entries.Count} entries";
        }
    }
}

