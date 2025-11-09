using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using System.Collections.Generic;

namespace RenderX.Plugins.Diagnostics;

/// <summary>
/// Manifest validator - validates plugin manifests and configuration
/// </summary>
public partial class ManifestValidator : UserControl
{
    public class ValidationResult
    {
        public string Message { get; set; } = "";
        public bool IsValid { get; set; } = true;
    }

    public static readonly StyledProperty<List<ValidationResult>> ResultsProperty =
        AvaloniaProperty.Register<ManifestValidator, List<ValidationResult>>(
            nameof(Results),
            new List<ValidationResult>());

    public static readonly StyledProperty<bool> IsValidProperty =
        AvaloniaProperty.Register<ManifestValidator, bool>(
            nameof(IsValid),
            true);

    public List<ValidationResult> Results
    {
        get => GetValue(ResultsProperty);
        set => SetValue(ResultsProperty, value);
    }

    public bool IsValid
    {
        get => GetValue(IsValidProperty);
        set => SetValue(IsValidProperty, value);
    }

    public ManifestValidator()
    {
        InitializeComponent();
        UpdateValidation();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ResultsProperty || change.Property == IsValidProperty)
        {
            UpdateValidation();
        }
    }

    private void OnValidateClick(object? sender, RoutedEventArgs e)
    {
        // Trigger validation
        UpdateValidation();
    }

    private void UpdateValidation()
    {
        var validationStatus = this.FindControl<TextBlock>("ValidationStatus");
        if (validationStatus != null)
        {
            validationStatus.Text = IsValid ? "Valid" : "Invalid";
            validationStatus.Foreground = new SolidColorBrush(IsValid ? Color.Parse("#10b981") : Color.Parse("#EF5350"));
        }

        var validationDot = this.FindControl<Ellipse>("ValidationDot");
        if (validationDot != null)
        {
            validationDot.Fill = new SolidColorBrush(IsValid ? Color.Parse("#10b981") : Color.Parse("#EF5350"));
        }

        var resultsControl = this.FindControl<ItemsControl>("ValidationResultsControl");
        if (resultsControl != null)
        {
            resultsControl.ItemsSource = Results;
        }
    }
}

