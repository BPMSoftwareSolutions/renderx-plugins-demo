using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header theme button view - a reusable sub-component for theme toggle button
/// </summary>
public partial class HeaderThemeButtonView : UserControl
{
    public static readonly RoutedEvent<RoutedEventArgs> ThemeToggleRequestedEvent =
        RoutedEvent.Register<HeaderThemeButtonView, RoutedEventArgs>(
            nameof(ThemeToggleRequested),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? ThemeToggleRequested
    {
        add => AddHandler(ThemeToggleRequestedEvent, value);
        remove => RemoveHandler(ThemeToggleRequestedEvent, value);
    }

    public static readonly StyledProperty<string> ThemeProperty =
        AvaloniaProperty.Register<HeaderThemeButtonView, string>(
            nameof(Theme),
            "light");

    public string Theme
    {
        get => GetValue(ThemeProperty);
        set => SetValue(ThemeProperty, value);
    }

    public HeaderThemeButtonView()
    {
        InitializeComponent();
        UpdateButtonContent();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == ThemeProperty)
        {
            UpdateButtonContent();
        }
    }

    private void OnThemeButtonClick(object? sender, RoutedEventArgs e)
    {
        RaiseEvent(new RoutedEventArgs(ThemeToggleRequestedEvent));
    }

    private void UpdateButtonContent()
    {
        var button = this.FindControl<Button>("ThemeButton");
        if (button != null)
        {
            button.Content = Theme == "light" ? "🌙 Dark" : "☀️ Light";
        }
    }
}

