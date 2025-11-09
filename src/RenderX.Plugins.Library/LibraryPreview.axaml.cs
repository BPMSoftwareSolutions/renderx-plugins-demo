using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.Library;

/// <summary>
/// Library preview - displays preview of selected component
/// </summary>
public partial class LibraryPreview : UserControl
{
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
}

