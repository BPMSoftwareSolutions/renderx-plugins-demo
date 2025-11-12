using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.ManifestTools;

/// <summary>
/// Manifest validator - validates manifest files
/// </summary>
public partial class ManifestValidator : UserControl
{
    public class ValidationResult
    {
        public string Message { get; set; } = "";
        public string Details { get; set; } = "";
        public bool IsValid { get; set; } = true;
    }

    public static readonly StyledProperty<List<ValidationResult>> ResultsProperty =
        AvaloniaProperty.Register<ManifestValidator, List<ValidationResult>>(
            nameof(Results),
            new List<ValidationResult>());

    public List<ValidationResult> Results
    {
        get => GetValue(ResultsProperty);
        set => SetValue(ResultsProperty, value);
    }

    public ManifestValidator()
    {
        InitializeComponent();
        UpdateValidator();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ResultsProperty)
        {
            UpdateValidator();
        }
    }

    private void UpdateValidator()
    {
        var resultsControl = this.FindControl<ItemsControl>("ResultsControl");
        if (resultsControl != null)
        {
            resultsControl.ItemsSource = Results;
        }

        int validCount = 0;
        int errorCount = 0;
        foreach (var result in Results)
        {
            if (result.IsValid)
                validCount++;
            else
                errorCount++;
        }

        var validCountText = this.FindControl<TextBlock>("ValidCountText");
        if (validCountText != null)
        {
            validCountText.Text = $"{validCount} valid";
        }

        var errorCountText = this.FindControl<TextBlock>("ErrorCountText");
        if (errorCountText != null)
        {
            errorCountText.Text = $"{errorCount} errors";
        }
    }
}

