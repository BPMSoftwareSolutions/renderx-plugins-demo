using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Validation error display - shows validation errors to the user
/// </summary>
public partial class ValidationErrorDisplay : UserControl
{
    public static readonly StyledProperty<string> ErrorTitleProperty =
        AvaloniaProperty.Register<ValidationErrorDisplay, string>(
            nameof(ErrorTitle),
            "Validation Error");

    public static readonly StyledProperty<string> ErrorMessageProperty =
        AvaloniaProperty.Register<ValidationErrorDisplay, string>(
            nameof(ErrorMessage),
            "");

    public static readonly StyledProperty<bool> HasErrorProperty =
        AvaloniaProperty.Register<ValidationErrorDisplay, bool>(
            nameof(HasError),
            false);

    public string ErrorTitle
    {
        get => GetValue(ErrorTitleProperty);
        set => SetValue(ErrorTitleProperty, value);
    }

    public string ErrorMessage
    {
        get => GetValue(ErrorMessageProperty);
        set => SetValue(ErrorMessageProperty, value);
    }

    public bool HasError
    {
        get => GetValue(HasErrorProperty);
        set => SetValue(HasErrorProperty, value);
    }

    public ValidationErrorDisplay()
    {
        InitializeComponent();
        UpdateError();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ErrorTitleProperty || change.Property == ErrorMessageProperty || change.Property == HasErrorProperty)
        {
            UpdateError();
        }
    }

    private void UpdateError()
    {
        var errorBorder = this.FindControl<Border>("ErrorBorder");
        if (errorBorder != null)
        {
            errorBorder.IsVisible = HasError;
        }
    }
}

