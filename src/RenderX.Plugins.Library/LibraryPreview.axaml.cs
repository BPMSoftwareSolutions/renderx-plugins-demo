using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using RenderX.HostSDK.Avalonia.Services;
using System;
using System.Text.Json.Nodes;

namespace RenderX.Plugins.Library;

/// <summary>
/// Library preview - displays preview of selected component
/// </summary>
public partial class LibraryPreview : UserControl
{
    private DragAdorner? _dragAdorner;
    private bool _isDragging;
    private Point _dragStartPoint;
    private ComponentPreviewModel _previewModel = new();

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

    public static readonly StyledProperty<string> ComponentIconProperty =
        AvaloniaProperty.Register<LibraryPreview, string>(
            nameof(ComponentIcon),
            "🧩");

    public static readonly StyledProperty<string> ComponentJsonProperty =
        AvaloniaProperty.Register<LibraryPreview, string>(
            nameof(ComponentJson),
            "");

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

    public string ComponentIcon
    {
        get => GetValue(ComponentIconProperty);
        set => SetValue(ComponentIconProperty, value);
    }

    public string ComponentJson
    {
        get => GetValue(ComponentJsonProperty);
        set => SetValue(ComponentJsonProperty, value);
    }

    public LibraryPreview()
    {
        InitializeComponent();
        UpdatePreview();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ComponentNameProperty || 
            change.Property == ComponentDescriptionProperty ||
            change.Property == ComponentIconProperty ||
            change.Property == ComponentJsonProperty)
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
        // Parse JSON component data if provided
        if (!string.IsNullOrWhiteSpace(ComponentJson))
        {
            try
            {
                _previewModel = ComponentPreviewModel.ParseComponentJson(ComponentJson);
                
                // Update properties from parsed model if not explicitly set
                if (ComponentName == "Component Name")
                {
                    ComponentName = _previewModel.Name;
                }
                if (ComponentDescription == "Component description")
                {
                    ComponentDescription = _previewModel.Description;
                }
                if (ComponentIcon == "🧩")
                {
                    ComponentIcon = _previewModel.Icon;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error parsing component JSON: {ex.Message}");
            }
        }

        // Update UI elements
        var iconTextBlock = this.FindControl<TextBlock>("IconTextBlock");
        if (iconTextBlock != null)
        {
            iconTextBlock.Text = ComponentIcon;
        }

        var nameTextBlock = this.FindControl<TextBlock>("NameTextBlock");
        if (nameTextBlock != null)
        {
            nameTextBlock.Text = ComponentName;
        }

        var descriptionTextBlock = this.FindControl<TextBlock>("DescriptionTextBlock");
        if (descriptionTextBlock != null)
        {
            descriptionTextBlock.Text = ComponentDescription;
        }

        // Apply CSS variables as dynamic resources
        ApplyCssVariables();
    }

    private void ApplyCssVariables()
    {
        if (_previewModel.CssVars.Count == 0)
        {
            return;
        }

        try
        {
            // Find the main border to apply styles
            var mainBorder = this.FindControl<Border>("PreviewArea");
            if (mainBorder == null)
            {
                return;
            }

            // Apply common CSS variables to Avalonia properties
            foreach (var kvp in _previewModel.CssVars)
            {
                var key = kvp.Key.ToLower().TrimStart('-');
                var value = kvp.Value;

                // Map CSS variables to Avalonia properties
                switch (key)
                {
                    case "background":
                    case "bg":
                    case "background-color":
                        if (TryParseBrush(value, out var bgBrush))
                        {
                            mainBorder.Background = bgBrush;
                        }
                        break;

                    case "color":
                    case "foreground":
                        // Apply to child TextBlock if present
                        if (mainBorder.Child is TextBlock tb && TryParseBrush(value, out var fgBrush))
                        {
                            tb.Foreground = fgBrush;
                        }
                        break;

                    case "border-radius":
                    case "borderradius":
                        if (TryParseCornerRadius(value, out var cornerRadius))
                        {
                            mainBorder.CornerRadius = cornerRadius;
                        }
                        break;

                    case "padding":
                        if (TryParseThickness(value, out var padding))
                        {
                            mainBorder.Padding = padding;
                        }
                        break;
                }

                // Store all variables in Resources for custom use
                var resourceKey = key;
                Resources[resourceKey] = value;
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error applying CSS variables: {ex.Message}");
        }
    }

    private bool TryParseBrush(string value, out Avalonia.Media.IBrush? brush)
    {
        brush = null;
        try
        {
            // Handle gradients
            if (value.Contains("linear-gradient"))
            {
                // Extract colors from linear-gradient
                var colors = System.Text.RegularExpressions.Regex.Matches(value, @"#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}");
                if (colors.Count >= 2)
                {
                    var startColor = Avalonia.Media.Color.Parse(colors[0].Value);
                    var endColor = Avalonia.Media.Color.Parse(colors[colors.Count - 1].Value);
                    brush = new Avalonia.Media.LinearGradientBrush
                    {
                        StartPoint = new Avalonia.RelativePoint(0, 0, Avalonia.RelativeUnit.Relative),
                        EndPoint = new Avalonia.RelativePoint(1, 1, Avalonia.RelativeUnit.Relative),
                        GradientStops = new Avalonia.Media.GradientStops
                        {
                            new Avalonia.Media.GradientStop(startColor, 0),
                            new Avalonia.Media.GradientStop(endColor, 1)
                        }
                    };
                    return true;
                }
            }
            // Handle solid colors
            else if (value.StartsWith("#") || value.StartsWith("rgb"))
            {
                var color = Avalonia.Media.Color.Parse(value);
                brush = new Avalonia.Media.SolidColorBrush(color);
                return true;
            }
        }
        catch
        {
            // Ignore parse errors
        }
        return false;
    }

    private bool TryParseCornerRadius(string value, out Avalonia.CornerRadius cornerRadius)
    {
        cornerRadius = default;
        try
        {
            var numStr = value.Replace("px", "").Replace("rem", "").Trim();
            if (double.TryParse(numStr, out var radius))
            {
                cornerRadius = new Avalonia.CornerRadius(radius);
                return true;
            }
        }
        catch
        {
            // Ignore parse errors
        }
        return false;
    }

    private bool TryParseThickness(string value, out Avalonia.Thickness thickness)
    {
        thickness = default;
        try
        {
            var parts = value.Replace("px", "").Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1 && double.TryParse(parts[0], out var all))
            {
                thickness = new Avalonia.Thickness(all);
                return true;
            }
            else if (parts.Length == 2 && 
                     double.TryParse(parts[0], out var vertical) && 
                     double.TryParse(parts[1], out var horizontal))
            {
                thickness = new Avalonia.Thickness(horizontal, vertical);
                return true;
            }
            else if (parts.Length == 4 && 
                     double.TryParse(parts[0], out var top) && 
                     double.TryParse(parts[1], out var right) &&
                     double.TryParse(parts[2], out var bottom) && 
                     double.TryParse(parts[3], out var left))
            {
                thickness = new Avalonia.Thickness(left, top, right, bottom);
                return true;
            }
        }
        catch
        {
            // Ignore parse errors
        }
        return false;
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
            ConductorLogService.Instance.LogInfo($"Drag started for component: {ComponentName}", "LibraryPreview");

            // Get the preview area border
            var previewArea = this.FindControl<Border>("PreviewArea");
            if (previewArea == null)
            {
                ConductorLogService.Instance.LogWarning("PreviewArea control not found", "LibraryPreview");
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
            ConductorLogService.Instance.LogDebug($"Drag ghost position: ({screenPoint.X:F0}, {screenPoint.Y:F0})", "LibraryPreview");
            DragGhostHelper.ShowGhost(_dragAdorner, screenPoint.X, screenPoint.Y);

            // Start drag operation
            ConductorLogService.Instance.LogDebug("Starting DragDrop operation", "LibraryPreview");
            DragDrop.DoDragDrop(e, data, DragDropEffects.Copy);
            ConductorLogService.Instance.LogInfo("Drag operation completed", "LibraryPreview");
        }
        catch (Exception ex)
        {
            ConductorLogService.Instance.LogError($"Error starting drag: {ex.Message}", "LibraryPreview");
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

