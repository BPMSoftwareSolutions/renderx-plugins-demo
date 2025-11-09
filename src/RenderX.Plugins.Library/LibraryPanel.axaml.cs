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
        // Component selection logic
    }

    private void OnComponentDoubleClick(object? sender, TappedEventArgs e)
    {
        RaiseEvent(new RoutedEventArgs(ComponentSelectedEvent));
    }

    private void UpdateComponents()
    {
        var componentsControl = this.FindControl<ItemsControl>("ComponentsItemsControl");
        if (componentsControl != null)
        {
            componentsControl.ItemsSource = Components;
        }
    }
}

