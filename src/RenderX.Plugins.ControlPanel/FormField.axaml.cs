using Avalonia;
using Avalonia.Controls;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Form field component for input with label and validation
/// </summary>
public partial class FormField : UserControl
{
    public static readonly StyledProperty<string> LabelProperty =
        AvaloniaProperty.Register<FormField, string>(
            nameof(Label),
            "Field Label");

    public static readonly StyledProperty<string> ValueProperty =
        AvaloniaProperty.Register<FormField, string>(
            nameof(Value),
            string.Empty);

    public static readonly StyledProperty<string> PlaceholderProperty =
        AvaloniaProperty.Register<FormField, string>(
            nameof(Placeholder),
            "Enter value...");

    public static readonly StyledProperty<string> ErrorProperty =
        AvaloniaProperty.Register<FormField, string>(
            nameof(Error),
            string.Empty);

    public string Label
    {
        get => GetValue(LabelProperty);
        set => SetValue(LabelProperty, value);
    }

    public string Value
    {
        get => GetValue(ValueProperty);
        set => SetValue(ValueProperty, value);
    }

    public string Placeholder
    {
        get => GetValue(PlaceholderProperty);
        set => SetValue(PlaceholderProperty, value);
    }

    public string Error
    {
        get => GetValue(ErrorProperty);
        set => SetValue(ErrorProperty, value);
    }

    public FormField()
    {
        InitializeComponent();
        UpdateDisplay();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == LabelProperty || change.Property == PlaceholderProperty || change.Property == ErrorProperty)
        {
            UpdateDisplay();
        }
    }

    private void UpdateDisplay()
    {
        var label = this.FindControl<TextBlock>("LabelText");
        var input = this.FindControl<TextBox>("InputControl");
        var error = this.FindControl<TextBlock>("ErrorMessage");

        if (label != null)
        {
            label.Text = Label;
        }

        if (input != null)
        {
            input.Watermark = Placeholder;
        }

        if (error != null)
        {
            error.Text = Error;
            error.IsVisible = !string.IsNullOrEmpty(Error);
        }
    }
}

