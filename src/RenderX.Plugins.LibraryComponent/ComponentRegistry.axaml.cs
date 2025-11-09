using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.LibraryComponent;

/// <summary>
/// Component registry - displays registered components
/// </summary>
public partial class ComponentRegistry : UserControl
{
    public class ComponentInfo
    {
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string Version { get; set; } = "";
        public string Status { get; set; } = "";
    }

    public static readonly StyledProperty<List<ComponentInfo>> ComponentsProperty =
        AvaloniaProperty.Register<ComponentRegistry, List<ComponentInfo>>(
            nameof(Components),
            new List<ComponentInfo>());

    public List<ComponentInfo> Components
    {
        get => GetValue(ComponentsProperty);
        set => SetValue(ComponentsProperty, value);
    }

    public ComponentRegistry()
    {
        InitializeComponent();
        UpdateRegistry();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ComponentsProperty)
        {
            UpdateRegistry();
        }
    }

    private void UpdateRegistry()
    {
        var componentsControl = this.FindControl<ItemsControl>("ComponentsControl");
        if (componentsControl != null)
        {
            componentsControl.ItemsSource = Components;
        }
    }
}

