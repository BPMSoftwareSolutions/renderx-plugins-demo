using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using System;
using System.Collections.Generic;

namespace RenderX.Plugins.Library;

/// <summary>
/// Library panel - displays available components for insertion
/// </summary>
public partial class LibraryPanel : UserControl
{
    private DragAdorner? _dragAdorner;
    private bool _isDragging;
    private Point _dragStartPoint;
    private Border? _dragSourceBorder;

    public static readonly RoutedEvent<RoutedEventArgs> ComponentSelectedEvent =
        RoutedEvent.Register<LibraryPanel, RoutedEventArgs>(
            nameof(ComponentSelected),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? ComponentSelected
    {
        add => AddHandler(ComponentSelectedEvent, value);
        remove => RemoveHandler(ComponentSelectedEvent, value);
    }

    public static readonly StyledProperty<List<(string Name, string Category, string Description)>> ComponentsProperty =
        AvaloniaProperty.Register<LibraryPanel, List<(string, string, string)>>(
            nameof(Components),
            new List<(string, string, string)>());

    public List<(string Name, string Category, string Description)> Components
    {
        get => GetValue(ComponentsProperty);
        set => SetValue(ComponentsProperty, value);
    }

    public LibraryPanel()
    {
        InitializeComponent();
        UpdateComponents();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ComponentsProperty)
        {
            UpdateComponents();
        }
    }

    private void OnComponentPointerPressed(object? sender, PointerPressedEventArgs e)
    {
        if (sender is Border border && e.GetCurrentPoint(border).Properties.IsLeftButtonPressed)
        {
            _isDragging = true;
            _dragStartPoint = e.GetPosition(border);
            _dragSourceBorder = border;
        }
    }

    private void OnComponentPointerMoved(object? sender, PointerEventArgs e)
    {
        if (!_isDragging || _dragSourceBorder == null)
        {
            return;
        }

        var currentPoint = e.GetPosition(_dragSourceBorder);
        var distance = Math.Sqrt(
            Math.Pow(currentPoint.X - _dragStartPoint.X, 2) +
            Math.Pow(currentPoint.Y - _dragStartPoint.Y, 2));

        // Start drag if moved more than 5 pixels
        if (distance > 5)
        {
            StartComponentDrag(e, _dragSourceBorder);
            _isDragging = false;
        }
    }

    private void OnComponentPointerReleased(object? sender, PointerReleasedEventArgs e)
    {
        EndComponentDrag();
        _isDragging = false;
    }

    private void OnComponentDoubleClick(object? sender, TappedEventArgs e)
    {
        RaiseEvent(new RoutedEventArgs(ComponentSelectedEvent));
    }

    private void StartComponentDrag(PointerEventArgs e, Border componentBorder)
    {
        try
        {
            // Get component data from the border
            var componentName = "Component";
            if (componentBorder.Child is StackPanel stack)
            {
                if (stack.Children.Count > 0 && stack.Children[0] is TextBlock nameBlock)
                {
                    componentName = nameBlock.Text ?? "Component";
                }
            }

            // Create drag data
            var data = new DataObject();
            data.Set(DataFormats.Text, componentName);

            // Create ghost adorner
            _dragAdorner = DragGhostHelper.CreateGhost(
                componentBorder,
                componentBorder.Width,
                componentBorder.Height);

            // Apply styling
            DragGhostHelper.ApplyComponentStyles(_dragAdorner, componentBorder);

            // Show ghost at initial position
            var screenPoint = e.GetPosition(null);
            DragGhostHelper.ShowGhost(_dragAdorner, screenPoint.X, screenPoint.Y);

            // Start drag operation
            DragDrop.DoDragDrop(e, data, DragDropEffects.Copy);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error starting component drag: {ex.Message}");
            EndComponentDrag();
        }
    }

    private void EndComponentDrag()
    {
        if (_dragAdorner != null)
        {
            DragGhostHelper.CleanupGhost(_dragAdorner);
            _dragAdorner = null;
        }
        _dragSourceBorder = null;
    }

    private void UpdateComponents()
    {
        try
        {
            var componentsControl = this.FindControl<ItemsControl>("ComponentsItemsControl");
            if (componentsControl != null)
            {
                componentsControl.ItemsSource = Components;
            }
            HideError();
        }
        catch (Exception ex)
        {
            ShowError($"Failed to load components: {ex.Message}");
        }
    }

    private void ShowError(string message)
    {
        var errorState = this.FindControl<Border>("ErrorState");
        var errorMessage = this.FindControl<TextBlock>("ErrorMessage");

        if (errorState != null)
        {
            errorState.IsVisible = true;
        }

        if (errorMessage != null)
        {
            errorMessage.Text = message;
        }

        var componentsControl = this.FindControl<ItemsControl>("ComponentsItemsControl");
        if (componentsControl != null)
        {
            componentsControl.IsVisible = false;
        }
    }

    private void HideError()
    {
        var errorState = this.FindControl<Border>("ErrorState");
        if (errorState != null)
        {
            errorState.IsVisible = false;
        }

        var componentsControl = this.FindControl<ItemsControl>("ComponentsItemsControl");
        if (componentsControl != null)
        {
            componentsControl.IsVisible = true;
        }
    }

    private void OnRetryClick(object? sender, RoutedEventArgs e)
    {
        try
        {
            UpdateComponents();
        }
        catch (Exception ex)
        {
            ShowError($"Retry failed: {ex.Message}");
        }
    }
}

