using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.Library;

/// <summary>
/// Library preview - displays preview of selected component
/// </summary>
public partial class LibraryPreview : UserControl
{
    private DragAdorner? _dragAdorner;
    private bool _isDragging;
    private Point _dragStartPoint;

    public static readonly RoutedEvent<RoutedEventArgs> InsertRequestedEvent =
        RoutedEvent.Register<LibraryPreview, RoutedEventArgs>(
            nameof(InsertRequested),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? InsertRequested
    {
        add => AddHandler(InsertRequestedEvent, value);
        remove => RemoveHandler(InsertRequestedEvent, value);
    }

    public static readonly StyledProperty<string> ComponentNameProperty =
        AvaloniaProperty.Register<LibraryPreview, string>(
            nameof(ComponentName),
            "Component Name");

    public static readonly StyledProperty<string> ComponentDescriptionProperty =
        AvaloniaProperty.Register<LibraryPreview, string>(
            nameof(ComponentDescription),
            "Component description");

    public string ComponentName
    {
        get => GetValue(ComponentNameProperty);
        set => SetValue(ComponentNameProperty, value);
    }

    public string ComponentDescription
    {
        get => GetValue(ComponentDescriptionProperty);
        set => SetValue(ComponentDescriptionProperty, value);
    }

    public LibraryPreview()
    {
        InitializeComponent();
        UpdatePreview();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ComponentNameProperty || change.Property == ComponentDescriptionProperty)
        {
            UpdatePreview();
        }
    }

    private void OnInsertClick(object? sender, RoutedEventArgs e)
    {
        RaiseEvent(new RoutedEventArgs(InsertRequestedEvent));
    }

    private void OnEditClick(object? sender, RoutedEventArgs e)
    {
        // Edit logic would be implemented here
    }

    private void UpdatePreview()
    {
        var componentName = this.FindControl<TextBlock>("ComponentName");
        if (componentName != null)
        {
            componentName.Text = ComponentName;
        }

        var componentDescription = this.FindControl<TextBlock>("ComponentDescription");
        if (componentDescription != null)
        {
            componentDescription.Text = ComponentDescription;
        }
    }

    private void OnPreviewPointerPressed(object? sender, PointerPressedEventArgs e)
    {
        if (e.GetCurrentPoint(this).Properties.IsLeftButtonPressed)
        {
            _isDragging = true;
            _dragStartPoint = e.GetPosition(this);
        }
    }

    private void OnPreviewPointerMoved(object? sender, PointerEventArgs e)
    {
        if (!_isDragging)
        {
            return;
        }

        var currentPoint = e.GetPosition(this);
        var distance = Math.Sqrt(
            Math.Pow(currentPoint.X - _dragStartPoint.X, 2) +
            Math.Pow(currentPoint.Y - _dragStartPoint.Y, 2));

        // Start drag if moved more than 5 pixels
        if (distance > 5)
        {
            StartDrag(e);
            _isDragging = false;
        }
    }

    private void OnPreviewPointerReleased(object? sender, PointerReleasedEventArgs e)
    {
        EndDrag();
        _isDragging = false;
    }

    private void StartDrag(PointerEventArgs e)
    {
        try
        {
            // Get the preview area border
            var previewArea = this.FindControl<Border>("PreviewArea");
            if (previewArea == null)
            {
                return;
            }

            // Create drag data
            var data = new DataObject();
            data.Set(DataFormats.Text, ComponentName);

            // Create ghost adorner
            _dragAdorner = DragGhostHelper.CreateGhost(
                previewArea,
                previewArea.Width,
                previewArea.Height);

            // Apply styling
            DragGhostHelper.ApplyComponentStyles(_dragAdorner, previewArea);

            // Show ghost at initial position
            var screenPoint = e.GetPosition(null);
            DragGhostHelper.ShowGhost(_dragAdorner, screenPoint.X, screenPoint.Y);

            // Start drag operation
            DragDrop.DoDragDrop(e, data, DragDropEffects.Copy);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error starting drag: {ex.Message}");
            EndDrag();
        }
    }

    private void EndDrag()
    {
        if (_dragAdorner != null)
        {
            DragGhostHelper.CleanupGhost(_dragAdorner);
            _dragAdorner = null;
        }
    }
}

