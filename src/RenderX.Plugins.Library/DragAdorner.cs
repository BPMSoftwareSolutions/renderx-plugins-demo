using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Media;
using Avalonia.Threading;
using System;

namespace RenderX.Plugins.Library;

/// <summary>
/// Drag ghost/preview overlay that displays a custom drag image during drag operations.
/// Uses a Popup to render a component preview that follows the cursor.
/// Note: Avalonia doesn't have WPF's Adorner layer, so we use Popup instead.
/// </summary>
public class DragAdorner : IDisposable
{
    private readonly Popup _popup;
    private readonly Border _container;
    private Control? _content;
    private double _leftOffset;
    private double _topOffset;
    private bool _isDisposed;

    /// <summary>
    /// Gets or sets the content control to render as the drag preview.
    /// </summary>
    public Control? Content
    {
        get => _content;
        set
        {
            _content = value;
            _container.Child = value;
        }
    }

    /// <summary>
    /// Gets or sets the horizontal offset from the screen origin.
    /// </summary>
    public double LeftOffset
    {
        get => _leftOffset;
        set
        {
            _leftOffset = value;
            UpdatePosition();
        }
    }

    /// <summary>
    /// Gets or sets the vertical offset from the screen origin.
    /// </summary>
    public double TopOffset
    {
        get => _topOffset;
        set
        {
            _topOffset = value;
            UpdatePosition();
        }
    }

    /// <summary>
    /// Gets whether the popup is currently open.
    /// </summary>
    public bool IsOpen => _popup.IsOpen;

    /// <summary>
    /// Initializes a new instance of the DragAdorner class.
    /// </summary>
    /// <param name="target">The target control (used for placement).</param>
    /// <param name="width">The width of the drag preview.</param>
    /// <param name="height">The height of the drag preview.</param>
    public DragAdorner(Control target, double width, double height)
    {
        // Create container with styling
        _container = new Border
        {
            Width = width,
            Height = height,
            Background = new SolidColorBrush(Colors.White, 0.95),
            BorderBrush = new SolidColorBrush(Colors.Gray, 0.5),
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(4),
            Padding = new Thickness(4),
            BoxShadow = new BoxShadows(new BoxShadow
            {
                Blur = 10,
                Spread = 2,
                OffsetX = 2,
                OffsetY = 2,
                Color = Colors.Black,
            })
        };

        // Create popup
        _popup = new Popup
        {
            Child = _container,
            PlacementTarget = target,
            IsLightDismissEnabled = false,
            Topmost = true
        };
    }

    /// <summary>
    /// Shows the drag preview at the specified screen position.
    /// </summary>
    /// <param name="screenX">The X coordinate in screen space.</param>
    /// <param name="screenY">The Y coordinate in screen space.</param>
    public void Show(double screenX, double screenY)
    {
        if (_isDisposed) return;

        _leftOffset = screenX;
        _topOffset = screenY;
        
        Dispatcher.UIThread.Post(() =>
        {
            if (!_isDisposed && !_popup.IsOpen)
            {
                UpdatePosition();
                _popup.Open();
            }
        });
    }

    /// <summary>
    /// Updates the position of the drag preview.
    /// </summary>
    /// <param name="screenX">The X coordinate in screen space.</param>
    /// <param name="screenY">The Y coordinate in screen space.</param>
    public void UpdatePosition(double screenX, double screenY)
    {
        if (_isDisposed) return;

        _leftOffset = screenX;
        _topOffset = screenY;
        UpdatePosition();
    }

    /// <summary>
    /// Updates the popup position based on current offsets.
    /// </summary>
    private void UpdatePosition()
    {
        if (_isDisposed) return;

        Dispatcher.UIThread.Post(() =>
        {
            if (!_isDisposed)
            {
                _popup.HorizontalOffset = _leftOffset;
                _popup.VerticalOffset = _topOffset;
            }
        });
    }

    /// <summary>
    /// Hides the drag preview.
    /// </summary>
    public void Hide()
    {
        if (_isDisposed) return;

        Dispatcher.UIThread.Post(() =>
        {
            if (!_isDisposed && _popup.IsOpen)
            {
                _popup.Close();
            }
        });
    }

    /// <summary>
    /// Disposes the drag adorner and releases resources.
    /// </summary>
    public void Dispose()
    {
        if (_isDisposed) return;

        _isDisposed = true;

        Dispatcher.UIThread.Post(() =>
        {
            try
            {
                if (_popup.IsOpen)
                {
                    _popup.Close();
                }
                _container.Child = null;
                _content = null;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error disposing drag adorner: {ex.Message}");
            }
        });
    }
}

