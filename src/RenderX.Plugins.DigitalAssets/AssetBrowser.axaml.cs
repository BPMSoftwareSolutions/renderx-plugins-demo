using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.DigitalAssets;

/// <summary>
/// Asset browser - displays digital assets in a grid
/// </summary>
public partial class AssetBrowser : UserControl
{
    public class AssetItem
    {
        public string Name { get; set; } = "";
        public string Size { get; set; } = "";
        public string Type { get; set; } = "";
    }

    public static readonly StyledProperty<List<AssetItem>> AssetsProperty =
        AvaloniaProperty.Register<AssetBrowser, List<AssetItem>>(
            nameof(Assets),
            new List<AssetItem>());

    public List<AssetItem> Assets
    {
        get => GetValue(AssetsProperty);
        set => SetValue(AssetsProperty, value);
    }

    public AssetBrowser()
    {
        InitializeComponent();
        UpdateAssets();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == AssetsProperty)
        {
            UpdateAssets();
        }
    }

    private void UpdateAssets()
    {
        var assetsControl = this.FindControl<ItemsControl>("AssetsItemsControl");
        if (assetsControl != null)
        {
            assetsControl.ItemsSource = Assets;
        }
    }
}

