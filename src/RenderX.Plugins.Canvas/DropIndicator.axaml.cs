using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.Canvas;

/// <summary>
/// Drop indicator - shows where a component will be dropped
/// </summary>
public partial class DropIndicator : UserControl
{
    public static readonly StyledProperty<bool> IsVisibleProperty =
        AvaloniaProperty.Register<DropIndicator, bool>(
            nameof(IsDropIndicatorVisible),
            false);

    public bool IsDropIndicatorVisible
    {
        get => GetValue(IsVisibleProperty);
        set => SetValue(IsVisibleProperty, value);
    }

    public DropIndicator()
    {
        InitializeComponent();
        UpdateVisibility();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == IsVisibleProperty)
        {
            UpdateVisibility();
        }
    }

    private void UpdateVisibility()
    {
        var dropBorder = this.FindControl<Border>("DropBorder");
        if (dropBorder != null)
        {
            dropBorder.IsVisible = IsDropIndicatorVisible;
        }
    }
}

