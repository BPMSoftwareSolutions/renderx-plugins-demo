using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header button - a reusable button component for header actions
/// </summary>
public partial class HeaderButton : UserControl
{
    public static readonly StyledProperty<string> ContentTextProperty =
        AvaloniaProperty.Register<HeaderButton, string>(
            nameof(ContentText),
            "Button");

    public static readonly StyledProperty<string> BackgroundColorProperty =
        AvaloniaProperty.Register<HeaderButton, string>(
            nameof(BackgroundColor),
            "#007ACC");

    public static readonly RoutedEvent<RoutedEventArgs> ClickEvent =
        RoutedEvent.Register<HeaderButton, RoutedEventArgs>(
            nameof(Click),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? Click
    {
        add => AddHandler(ClickEvent, value);
        remove => RemoveHandler(ClickEvent, value);
    }

    public string ContentText
    {
        get => GetValue(ContentTextProperty);
        set => SetValue(ContentTextProperty, value);
    }

    public string BackgroundColor
    {
        get => GetValue(BackgroundColorProperty);
        set => SetValue(BackgroundColorProperty, value);
    }

    public HeaderButton()
    {
        InitializeComponent();
        UpdateButton();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ContentTextProperty || change.Property == BackgroundColorProperty)
        {
            UpdateButton();
        }
    }

    private void UpdateButton()
    {
        var button = this.FindControl<Button>("ActionButton");
        if (button != null)
        {
            button.Content = ContentText;
            // Note: Background color binding would be done via style in production
        }
    }
}

