using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.DigitalAssets;

/// <summary>
/// Asset library - displays organized asset collections
/// </summary>
public partial class AssetLibrary : UserControl
{
    public class Collection
    {
        public string Name { get; set; } = "";
    }

    public class Asset
    {
        public string Name { get; set; } = "";
        public string Type { get; set; } = "";
    }

    public static readonly StyledProperty<List<Collection>> CollectionsProperty =
        AvaloniaProperty.Register<AssetLibrary, List<Collection>>(
            nameof(Collections),
            new List<Collection>());

    public static readonly StyledProperty<List<Asset>> AssetsProperty =
        AvaloniaProperty.Register<AssetLibrary, List<Asset>>(
            nameof(Assets),
            new List<Asset>());

    public List<Collection> Collections
    {
        get => GetValue(CollectionsProperty);
        set => SetValue(CollectionsProperty, value);
    }

    public List<Asset> Assets
    {
        get => GetValue(AssetsProperty);
        set => SetValue(AssetsProperty, value);
    }

    public AssetLibrary()
    {
        InitializeComponent();
        UpdateLibrary();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == CollectionsProperty || change.Property == AssetsProperty)
        {
            UpdateLibrary();
        }
    }

    private void UpdateLibrary()
    {
        var collectionsControl = this.FindControl<ItemsControl>("CollectionsControl");
        if (collectionsControl != null)
        {
            collectionsControl.ItemsSource = Collections;
        }

        var assetsControl = this.FindControl<ItemsControl>("AssetsControl");
        if (assetsControl != null)
        {
            assetsControl.ItemsSource = Assets;
        }
    }
}

