using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.Header;

/// <summary>
/// Breadcrumb item component - represents a single item in a breadcrumb trail
/// </summary>
public partial class BreadcrumbItem : UserControl
{
    public static readonly StyledProperty<string> TextProperty =
        AvaloniaProperty.Register<BreadcrumbItem, string>(
            nameof(Text),
            "Item");

    public static readonly StyledProperty<bool> IsFirstProperty =
        AvaloniaProperty.Register<BreadcrumbItem, bool>(
            nameof(IsFirst),
            false);

    public string Text
    {
        get => GetValue(TextProperty);
        set => SetValue(TextProperty, value);
    }

    public bool IsFirst
    {
        get => GetValue(IsFirstProperty);
        set => SetValue(IsFirstProperty, value);
    }

    public event EventHandler? ItemClicked;

    public BreadcrumbItem()
    {
        InitializeComponent();
        UpdateDisplay();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == TextProperty || change.Property == IsFirstProperty)
        {
            UpdateDisplay();
        }
    }

    private void UpdateDisplay()
    {
        var itemText = this.FindControl<TextBlock>("ItemText");
        var separator = this.FindControl<TextBlock>("SeparatorText");

        if (itemText != null)
        {
            itemText.Text = Text;
        }

        if (separator != null)
        {
            separator.IsVisible = !IsFirst;
        }
    }

    protected override void OnPointerPressed(PointerPressedEventArgs e)
    {
        base.OnPointerPressed(e);
        ItemClicked?.Invoke(this, new RoutedEventArgs());
    }
}

