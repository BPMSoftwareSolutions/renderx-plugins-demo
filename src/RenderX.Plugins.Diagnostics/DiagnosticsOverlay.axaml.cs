using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Diagnostics overlay - modal dialog for detailed diagnostics
/// </summary>
public partial class DiagnosticsOverlay : UserControl
{
    public static readonly RoutedEvent<RoutedEventArgs> ClosedEvent =
        RoutedEvent.Register<DiagnosticsOverlay, RoutedEventArgs>(
            nameof(Closed),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? Closed
    {
        add => AddHandler(ClosedEvent, value);
        remove => RemoveHandler(ClosedEvent, value);
    }

    public static readonly StyledProperty<bool> IsOpenProperty =
        AvaloniaProperty.Register<DiagnosticsOverlay, bool>(
            nameof(IsOpen),
            false);

    public bool IsOpen
    {
        get => GetValue(IsOpenProperty);
        set => SetValue(IsOpenProperty, value);
    }

    public DiagnosticsOverlay()
    {
        InitializeComponent();
        UpdateVisibility();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == IsOpenProperty)
        {
            UpdateVisibility();
        }
    }

    private void OnCloseClick(object? sender, RoutedEventArgs e)
    {
        IsOpen = false;
        RaiseEvent(new RoutedEventArgs(ClosedEvent));
    }

    private void UpdateVisibility()
    {
        var overlayGrid = this.FindControl<Grid>("OverlayGrid");
        if (overlayGrid != null)
        {
            overlayGrid.IsVisible = IsOpen;
        }
    }
}

