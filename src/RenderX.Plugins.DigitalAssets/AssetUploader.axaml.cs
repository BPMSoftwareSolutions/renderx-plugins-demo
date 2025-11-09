using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.DigitalAssets;

/// <summary>
/// Asset uploader - handles file uploads for digital assets
/// </summary>
public partial class AssetUploader : UserControl
{
    public static readonly StyledProperty<int> UploadProgressProperty =
        AvaloniaProperty.Register<AssetUploader, int>(
            nameof(UploadProgress),
            0);

    public static readonly StyledProperty<bool> IsUploadingProperty =
        AvaloniaProperty.Register<AssetUploader, bool>(
            nameof(IsUploading),
            false);

    public int UploadProgress
    {
        get => GetValue(UploadProgressProperty);
        set => SetValue(UploadProgressProperty, value);
    }

    public bool IsUploading
    {
        get => GetValue(IsUploadingProperty);
        set => SetValue(IsUploadingProperty, value);
    }

    public AssetUploader()
    {
        InitializeComponent();
        UpdateProgress();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == UploadProgressProperty || change.Property == IsUploadingProperty)
        {
            UpdateProgress();
        }
    }

    private void UpdateProgress()
    {
        var progressPanel = this.FindControl<StackPanel>("ProgressPanel");
        if (progressPanel != null)
        {
            progressPanel.IsVisible = IsUploading;
        }

        var progressBar = this.FindControl<ProgressBar>("UploadProgress");
        if (progressBar != null)
        {
            progressBar.Value = UploadProgress;
        }

        var progressText = this.FindControl<TextBlock>("ProgressText");
        if (progressText != null)
        {
            progressText.Text = $"{UploadProgress}%";
        }
    }
}

