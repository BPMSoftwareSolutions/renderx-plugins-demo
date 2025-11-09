using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Plugin loading stats - displays plugin loading statistics
/// </summary>
public partial class PluginLoadingStats : UserControl
{
    public static readonly StyledProperty<int> SuccessCountProperty =
        AvaloniaProperty.Register<PluginLoadingStats, int>(
            nameof(SuccessCount),
            0);

    public static readonly StyledProperty<int> FailedCountProperty =
        AvaloniaProperty.Register<PluginLoadingStats, int>(
            nameof(FailedCount),
            0);

    public static readonly StyledProperty<int> PendingCountProperty =
        AvaloniaProperty.Register<PluginLoadingStats, int>(
            nameof(PendingCount),
            0);

    public static readonly StyledProperty<long> TotalTimeProperty =
        AvaloniaProperty.Register<PluginLoadingStats, long>(
            nameof(TotalTime),
            0);

    public int SuccessCount
    {
        get => GetValue(SuccessCountProperty);
        set => SetValue(SuccessCountProperty, value);
    }

    public int FailedCount
    {
        get => GetValue(FailedCountProperty);
        set => SetValue(FailedCountProperty, value);
    }

    public int PendingCount
    {
        get => GetValue(PendingCountProperty);
        set => SetValue(PendingCountProperty, value);
    }

    public long TotalTime
    {
        get => GetValue(TotalTimeProperty);
        set => SetValue(TotalTimeProperty, value);
    }

    public PluginLoadingStats()
    {
        InitializeComponent();
        UpdateStats();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == SuccessCountProperty || change.Property == FailedCountProperty || 
            change.Property == PendingCountProperty || change.Property == TotalTimeProperty)
        {
            UpdateStats();
        }
    }

    private void UpdateStats()
    {
        var successCount = this.FindControl<TextBlock>("SuccessCount");
        if (successCount != null)
        {
            successCount.Text = SuccessCount.ToString();
        }

        var failedCount = this.FindControl<TextBlock>("FailedCount");
        if (failedCount != null)
        {
            failedCount.Text = FailedCount.ToString();
        }

        var pendingCount = this.FindControl<TextBlock>("PendingCount");
        if (pendingCount != null)
        {
            pendingCount.Text = PendingCount.ToString();
        }

        var totalTime = this.FindControl<TextBlock>("TotalTime");
        if (totalTime != null)
        {
            totalTime.Text = $"{TotalTime}ms";
        }

        var progress = this.FindControl<ProgressBar>("LoadingProgress");
        if (progress != null)
        {
            int total = SuccessCount + FailedCount + PendingCount;
            progress.Value = total > 0 ? (double)SuccessCount / total * 100 : 0;
        }
    }
}

