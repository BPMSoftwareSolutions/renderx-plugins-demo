using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.Canvas;

/// <summary>
/// Selection indicator - shows selection border and handles around selected component
/// </summary>
public partial class SelectionIndicator : UserControl
{
    public static readonly StyledProperty<bool> IsSelectedProperty =
        AvaloniaProperty.Register<SelectionIndicator, bool>(
            nameof(IsSelected),
            false);

    public bool IsSelected
    {
        get => GetValue(IsSelectedProperty);
        set => SetValue(IsSelectedProperty, value);
    }

    public SelectionIndicator()
    {
        InitializeComponent();
        UpdateSelection();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == IsSelectedProperty)
        {
            UpdateSelection();
        }
    }

    private void UpdateSelection()
    {
        var selectionBorder = this.FindControl<Border>("SelectionBorder");
        if (selectionBorder != null)
        {
            selectionBorder.IsVisible = IsSelected;
        }
    }
}

