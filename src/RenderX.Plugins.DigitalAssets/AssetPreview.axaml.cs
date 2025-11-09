using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.DigitalAssets;

/// <summary>
/// Asset preview - displays detailed asset information
/// </summary>
public partial class AssetPreview : UserControl
{
    public static readonly StyledProperty<string> AssetNameProperty =
        AvaloniaProperty.Register<AssetPreview, string>(
            nameof(AssetName),
            "asset.jpg");

    public static readonly StyledProperty<string> AssetTypeProperty =
        AvaloniaProperty.Register<AssetPreview, string>(
            nameof(AssetType),
            "Image");

    public static readonly StyledProperty<string> AssetSizeProperty =
        AvaloniaProperty.Register<AssetPreview, string>(
            nameof(AssetSize),
            "0 MB");

    public static readonly StyledProperty<string> AssetDimensionsProperty =
        AvaloniaProperty.Register<AssetPreview, string>(
            nameof(AssetDimensions),
            "0 x 0");

    public string AssetName
    {
        get => GetValue(AssetNameProperty);
        set => SetValue(AssetNameProperty, value);
    }

    public string AssetType
    {
        get => GetValue(AssetTypeProperty);
        set => SetValue(AssetTypeProperty, value);
    }

    public string AssetSize
    {
        get => GetValue(AssetSizeProperty);
        set => SetValue(AssetSizeProperty, value);
    }

    public string AssetDimensions
    {
        get => GetValue(AssetDimensionsProperty);
        set => SetValue(AssetDimensionsProperty, value);
    }

    public AssetPreview()
    {
        InitializeComponent();
        UpdatePreview();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == AssetNameProperty || change.Property == AssetTypeProperty || 
            change.Property == AssetSizeProperty || change.Property == AssetDimensionsProperty)
        {
            UpdatePreview();
        }
    }

    private void UpdatePreview()
    {
        var assetName = this.FindControl<TextBlock>("AssetName");
        if (assetName != null)
        {
            assetName.Text = AssetName;
        }

        var assetType = this.FindControl<TextBlock>("AssetType");
        if (assetType != null)
        {
            assetType.Text = AssetType;
        }

        var assetSize = this.FindControl<TextBlock>("AssetSize");
        if (assetSize != null)
        {
            assetSize.Text = AssetSize;
        }

        var assetDimensions = this.FindControl<TextBlock>("AssetDimensions");
        if (assetDimensions != null)
        {
            assetDimensions.Text = AssetDimensions;
        }
    }
}

