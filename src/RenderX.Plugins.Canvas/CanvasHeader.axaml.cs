using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.Canvas;

/// <summary>
/// Canvas header - displays canvas controls and zoom options
/// </summary>
public partial class CanvasHeader : UserControl
{
    public static readonly RoutedEvent<RoutedEventArgs> ZoomChangedEvent =
        RoutedEvent.Register<CanvasHeader, RoutedEventArgs>(
            nameof(ZoomChanged),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? ZoomChanged
    {
        add => AddHandler(ZoomChangedEvent, value);
        remove => RemoveHandler(ZoomChangedEvent, value);
    }

    public static readonly StyledProperty<double> ZoomLevelProperty =
        AvaloniaProperty.Register<CanvasHeader, double>(
            nameof(ZoomLevel),
            1.0);

    public static readonly StyledProperty<int> ComponentCountProperty =
        AvaloniaProperty.Register<CanvasHeader, int>(
            nameof(ComponentCount),
            0);

    public double ZoomLevel
    {
        get => GetValue(ZoomLevelProperty);
        set => SetValue(ZoomLevelProperty, value);
    }

    public int ComponentCount
    {
        get => GetValue(ComponentCountProperty);
        set => SetValue(ComponentCountProperty, value);
    }

    public CanvasHeader()
    {
        InitializeComponent();
        UpdateHeader();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ZoomLevelProperty || change.Property == ComponentCountProperty)
        {
            UpdateHeader();
        }
    }

    private void OnZoomInClick(object? sender, RoutedEventArgs e)
    {
        ZoomLevel = Math.Min(ZoomLevel + 0.1, 3.0);
        RaiseEvent(new RoutedEventArgs(ZoomChangedEvent));
    }

    private void OnZoomOutClick(object? sender, RoutedEventArgs e)
    {
        ZoomLevel = Math.Max(ZoomLevel - 0.1, 0.1);
        RaiseEvent(new RoutedEventArgs(ZoomChangedEvent));
    }

    private void OnGridToggleClick(object? sender, RoutedEventArgs e)
    {
        // Grid toggle logic would be implemented here
    }

    private void OnFitToViewClick(object? sender, RoutedEventArgs e)
    {
        // Fit to view logic would be implemented here
    }

    private void UpdateHeader()
    {
        var zoomLevelText = this.FindControl<TextBlock>("ZoomLevelText");
        if (zoomLevelText != null)
        {
            zoomLevelText.Text = $"{(int)(ZoomLevel * 100)}%";
        }

        var infoText = this.FindControl<TextBlock>("InfoText");
        if (infoText != null)
        {
            infoText.Text = $"({ComponentCount} components)";
        }
    }
}

