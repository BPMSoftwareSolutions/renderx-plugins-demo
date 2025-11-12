using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.LibraryComponent;

/// <summary>
/// Component editor - allows editing component properties
/// </summary>
public partial class ComponentEditor : UserControl
{
    public class PropertyInfo
    {
        public string Name { get; set; } = "";
        public string Type { get; set; } = "";
    }

    public static readonly StyledProperty<string> ComponentNameProperty =
        AvaloniaProperty.Register<ComponentEditor, string>(
            nameof(ComponentName),
            "");

    public static readonly StyledProperty<List<PropertyInfo>> PropertiesProperty =
        AvaloniaProperty.Register<ComponentEditor, List<PropertyInfo>>(
            nameof(Properties),
            new List<PropertyInfo>());

    public string ComponentName
    {
        get => GetValue(ComponentNameProperty);
        set => SetValue(ComponentNameProperty, value);
    }

    public List<PropertyInfo> Properties
    {
        get => GetValue(PropertiesProperty);
        set => SetValue(PropertiesProperty, value);
    }

    public ComponentEditor()
    {
        InitializeComponent();
        UpdateEditor();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ComponentNameProperty || change.Property == PropertiesProperty)
        {
            UpdateEditor();
        }
    }

    private void UpdateEditor()
    {
        var nameBox = this.FindControl<TextBox>("ComponentNameBox");
        if (nameBox != null)
        {
            nameBox.Text = ComponentName;
        }

        var propertiesControl = this.FindControl<ItemsControl>("PropertiesControl");
        if (propertiesControl != null)
        {
            propertiesControl.ItemsSource = Properties;
        }
    }
}

