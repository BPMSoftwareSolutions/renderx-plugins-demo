using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;

namespace RenderX.Plugins.Canvas;

/// <summary>
/// Grid overlay - displays grid lines on canvas for alignment
/// </summary>
public partial class GridOverlay : UserControl
{
    public static readonly StyledProperty<bool> IsVisibleProperty =
        AvaloniaProperty.Register<GridOverlay, bool>(
            nameof(GridVisible),
            false);

    public static readonly StyledProperty<int> GridSizeProperty =
        AvaloniaProperty.Register<GridOverlay, int>(
            nameof(GridSize),
            20);

    public bool GridVisible
    {
        get => GetValue(IsVisibleProperty);
        set => SetValue(IsVisibleProperty, value);
    }

    public int GridSize
    {
        get => GetValue(GridSizeProperty);
        set => SetValue(GridSizeProperty, value);
    }

    public GridOverlay()
    {
        InitializeComponent();
        UpdateGrid();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == IsVisibleProperty || change.Property == GridSizeProperty)
        {
            UpdateGrid();
        }
    }

    private void UpdateGrid()
    {
        var gridCanvas = this.FindControl<Avalonia.Controls.Canvas>("GridCanvas");
        if (gridCanvas != null)
        {
            gridCanvas.IsVisible = GridVisible;
            if (GridVisible)
            {
                DrawGrid(gridCanvas);
            }
        }
    }

    private void DrawGrid(Avalonia.Controls.Canvas canvas)
    {
        canvas.Children.Clear();
        var pen = new Pen(new SolidColorBrush(Color.Parse("#E0E0E0")), 1);

        // Grid drawing would be implemented here
        // This is a simplified version - actual implementation would draw lines
    }
}

