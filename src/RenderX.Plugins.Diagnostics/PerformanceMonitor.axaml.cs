using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.Diagnostics;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Performance monitor - displays system performance metrics
/// </summary>
public partial class PerformanceMonitor : UserControl
{
    private Process? _currentProcess;
    private DateTime _startTime;

    public static readonly StyledProperty<double> CPUUsageProperty =
        AvaloniaProperty.Register<PerformanceMonitor, double>(
            nameof(CPUUsage),
            0);

    public static readonly StyledProperty<double> MemoryUsageProperty =
        AvaloniaProperty.Register<PerformanceMonitor, double>(
            nameof(MemoryUsage),
            0);

    public double CPUUsage
    {
        get => GetValue(CPUUsageProperty);
        set => SetValue(CPUUsageProperty, value);
    }

    public double MemoryUsage
    {
        get => GetValue(MemoryUsageProperty);
        set => SetValue(MemoryUsageProperty, value);
    }

    public PerformanceMonitor()
    {
        InitializeComponent();
        _currentProcess = Process.GetCurrentProcess();
        _startTime = DateTime.Now;
        UpdateMetrics();
    }

    private void OnRefreshClick(object? sender, RoutedEventArgs e)
    {
        UpdateMetrics();
    }

    private void UpdateMetrics()
    {
        if (_currentProcess == null)
            return;

        // Update CPU usage
        var cpuValue = this.FindControl<TextBlock>("CPUValue");
        if (cpuValue != null)
        {
            cpuValue.Text = $"{CPUUsage:F1}%";
        }

        var cpuBar = this.FindControl<ProgressBar>("CPUBar");
        if (cpuBar != null)
        {
            cpuBar.Value = CPUUsage;
        }

        // Update memory usage
        long memoryMB = _currentProcess.WorkingSet64 / (1024 * 1024);
        var memoryValue = this.FindControl<TextBlock>("MemoryValue");
        if (memoryValue != null)
        {
            memoryValue.Text = $"{memoryMB} MB";
        }

        var memoryBar = this.FindControl<ProgressBar>("MemoryBar");
        if (memoryBar != null)
        {
            memoryBar.Value = Math.Min(MemoryUsage, 100);
        }

        // Update uptime
        var uptime = DateTime.Now - _startTime;
        var uptimeValue = this.FindControl<TextBlock>("UptimeValue");
        if (uptimeValue != null)
        {
            uptimeValue.Text = $"{uptime.Hours}h {uptime.Minutes}m {uptime.Seconds}s";
        }
    }
}

