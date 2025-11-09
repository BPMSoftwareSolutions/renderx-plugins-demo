using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Controls.Shapes;
using Avalonia.Input;
using Avalonia.Layout;
using Avalonia.Media;
using System;

namespace RenderX.Plugins.Canvas
{
    public partial class CanvasRuler : UserControl
    {
        // Properties
        public static readonly StyledProperty<Orientation> OrientationProperty =
            AvaloniaProperty.Register<CanvasRuler, Orientation>(nameof(Orientation), Orientation.Horizontal);

        public static readonly StyledProperty<double> ZoomProperty =
            AvaloniaProperty.Register<CanvasRuler, double>(nameof(Zoom), 1.0);

        public static readonly StyledProperty<double> OffsetProperty =
            AvaloniaProperty.Register<CanvasRuler, double>(nameof(Offset), 0.0);

        public Orientation Orientation
        {
            get => GetValue(OrientationProperty);
            set => SetValue(OrientationProperty, value);
        }

        public double Zoom
        {
            get => GetValue(ZoomProperty);
            set => SetValue(ZoomProperty, value);
        }

        public double Offset
        {
            get => GetValue(OffsetProperty);
            set => SetValue(OffsetProperty, value);
        }

        // Ruler settings
        private const int MajorTickInterval = 100;  // Major tick every 100 pixels
        private const int MinorTickInterval = 10;   // Minor tick every 10 pixels
        private const int MajorTickHeight = 12;
        private const int MinorTickHeight = 6;

        public CanvasRuler()
        {
            InitializeComponent();

            // Subscribe to property changes
            ZoomProperty.Changed.AddClassHandler<CanvasRuler>((ruler, e) => ruler.InvalidateRuler());
            OffsetProperty.Changed.AddClassHandler<CanvasRuler>((ruler, e) => ruler.InvalidateRuler());

            // Subscribe to pointer events for position indicator
            PointerMoved += OnPointerMoved;
            PointerEntered += OnPointerEntered;
            PointerExited += OnPointerExited;

            // Subscribe to loaded event
            Loaded += (s, e) => InvalidateRuler();
        }

        private void InvalidateRuler()
        {
            if (RulerCanvas == null || !IsLoaded) return;
            
            RulerCanvas.Children.Clear();
            DrawRulerTicks();
        }

        private void DrawRulerTicks()
        {
            if (RulerCanvas == null) return;

            var width = Orientation == Orientation.Horizontal ? Bounds.Width : Bounds.Height;
            if (width <= 0) return;

            var zoom = Math.Max(0.1, Zoom);
            var offset = Offset;

            // Calculate visible range
            var startPixel = -offset;
            var endPixel = startPixel + width / zoom;

            // Round to nearest interval
            var startTick = (int)(Math.Floor(startPixel / MinorTickInterval) * MinorTickInterval);
            var endTick = (int)(Math.Ceiling(endPixel / MinorTickInterval) * MinorTickInterval);

            for (int pixel = startTick; pixel <= endTick; pixel += MinorTickInterval)
            {
                var isMajorTick = (pixel % MajorTickInterval) == 0;
                var tickHeight = isMajorTick ? MajorTickHeight : MinorTickHeight;
                
                // Calculate screen position
                var screenPos = (pixel + offset) * zoom;

                // Create tick mark
                var tick = new Line
                {
                    StartPoint = Orientation == Orientation.Horizontal 
                        ? new Point(screenPos, Bounds.Height - tickHeight)
                        : new Point(Bounds.Width - tickHeight, screenPos),
                    EndPoint = Orientation == Orientation.Horizontal
                        ? new Point(screenPos, Bounds.Height)
                        : new Point(Bounds.Width, screenPos),
                    Stroke = Brushes.Gray,
                    StrokeThickness = 1
                };

                RulerCanvas.Children.Add(tick);

                // Add label for major ticks
                if (isMajorTick)
                {
                    var label = new TextBlock
                    {
                        Text = pixel.ToString(),
                        FontSize = 9,
                        Foreground = Brushes.DarkGray
                    };

                    if (Orientation == Orientation.Horizontal)
                    {
                        Avalonia.Controls.Canvas.SetLeft(label, screenPos + 2);
                        Avalonia.Controls.Canvas.SetTop(label, 2);
                    }
                    else
                    {
                        Avalonia.Controls.Canvas.SetLeft(label, 2);
                        Avalonia.Controls.Canvas.SetTop(label, screenPos + 2);
                    }

                    RulerCanvas.Children.Add(label);
                }
            }
        }

        private void OnPointerMoved(object? sender, PointerEventArgs e)
        {
            if (PositionIndicator == null || PositionLabel == null || PositionText == null) return;

            var position = e.GetPosition(this);
            var zoom = Math.Max(0.1, Zoom);
            var canvasPosition = (position.X - Offset) / zoom;

            if (Orientation == Orientation.Horizontal)
            {
                PositionIndicator.Margin = new Thickness(position.X, 0, 0, 0);
                PositionLabel.Margin = new Thickness(position.X - 20, 0, 0, 0);
            }
            else
            {
                PositionIndicator.Margin = new Thickness(0, position.Y, 0, 0);
                PositionLabel.Margin = new Thickness(0, position.Y - 10, 0, 0);
            }

            PositionText.Text = $"{(int)canvasPosition}px";
        }

        private void OnPointerEntered(object? sender, PointerEventArgs e)
        {
            if (PositionIndicator != null) PositionIndicator.IsVisible = true;
            if (PositionLabel != null) PositionLabel.IsVisible = true;
        }

        private void OnPointerExited(object? sender, PointerEventArgs e)
        {
            if (PositionIndicator != null) PositionIndicator.IsVisible = false;
            if (PositionLabel != null) PositionLabel.IsVisible = false;
        }
    }
}
