using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.Components;

/// <summary>
/// Component catalog - displays available components
/// </summary>
public partial class ComponentCatalog : UserControl
{
    public class CatalogItem
    {
        public string Name { get; set; } = "";
        public string Category { get; set; } = "";
        public string Description { get; set; } = "";
    }

    public static readonly StyledProperty<List<CatalogItem>> CatalogItemsProperty =
        AvaloniaProperty.Register<ComponentCatalog, List<CatalogItem>>(
            nameof(CatalogItems),
            new List<CatalogItem>());

    public List<CatalogItem> CatalogItems
    {
        get => GetValue(CatalogItemsProperty);
        set => SetValue(CatalogItemsProperty, value);
    }

    public ComponentCatalog()
    {
        InitializeComponent();
        UpdateCatalog();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == CatalogItemsProperty)
        {
            UpdateCatalog();
        }
    }

    private void UpdateCatalog()
    {
        var catalogControl = this.FindControl<ItemsControl>("CatalogControl");
        if (catalogControl != null)
        {
            catalogControl.ItemsSource = CatalogItems;
        }
    }
}

