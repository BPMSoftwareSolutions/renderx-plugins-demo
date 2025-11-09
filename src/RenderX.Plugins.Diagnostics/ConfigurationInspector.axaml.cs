using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Configuration inspector - displays application configuration settings
/// </summary>
public partial class ConfigurationInspector : UserControl
{
    public class ConfigItem
    {
        public string Key { get; set; } = "";
        public string Value { get; set; } = "";
        public string Type { get; set; } = "";
    }

    public static readonly StyledProperty<List<ConfigItem>> ConfigItemsProperty =
        AvaloniaProperty.Register<ConfigurationInspector, List<ConfigItem>>(
            nameof(ConfigItems),
            new List<ConfigItem>());

    public List<ConfigItem> ConfigItems
    {
        get => GetValue(ConfigItemsProperty);
        set => SetValue(ConfigItemsProperty, value);
    }

    public ConfigurationInspector()
    {
        InitializeComponent();
        UpdateConfiguration();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ConfigItemsProperty)
        {
            UpdateConfiguration();
        }
    }

    private void UpdateConfiguration()
    {
        var configControl = this.FindControl<ItemsControl>("ConfigItemsControl");
        if (configControl != null)
        {
            configControl.ItemsSource = ConfigItems;
        }
    }
}

