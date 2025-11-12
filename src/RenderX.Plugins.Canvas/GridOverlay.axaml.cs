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

        // Get canvas dimensions
        var width = canvas.Bounds.Width > 0 ? canvas.Bounds.Width : 2000;
        var height = canvas.Bounds.Height > 0 ? canvas.Bounds.Height : 2000;

        // Create grid lines using dots (similar to web's radial-gradient pattern)
        var dotColor = new SolidColorBrush(Color.Parse("#CCCCCC"));
        var dotSize = 2;
        var opacity = 0.5;

        // Draw grid dots at regular intervals
        for (double x = 0; x < width; x += GridSize)
        {
            for (double y = 0; y < height; y += GridSize)
            {
                var dot = new Avalonia.Controls.Shapes.Ellipse
                {
                    Width = dotSize,
                    Height = dotSize,
                    Fill = dotColor,
                    Opacity = opacity
                };

                Avalonia.Controls.Canvas.SetLeft(dot, x - dotSize / 2);
                Avalonia.Controls.Canvas.SetTop(dot, y - dotSize / 2);

                canvas.Children.Add(dot);
            }
        }
    }
}

