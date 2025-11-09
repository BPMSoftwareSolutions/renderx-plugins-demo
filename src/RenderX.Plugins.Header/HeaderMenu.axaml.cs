using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Interactivity;
using System;
using System.Collections.Generic;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header menu - a dropdown menu component for header navigation
/// </summary>
public partial class HeaderMenu : UserControl
{
    public static readonly StyledProperty<List<(string Label, Action Handler)>> MenuItemsProperty =
        AvaloniaProperty.Register<HeaderMenu, List<(string, Action)>>(
            nameof(MenuItems),
            new List<(string, Action)>());

    public List<(string Label, Action Handler)> MenuItems
    {
        get => GetValue(MenuItemsProperty);
        set => SetValue(MenuItemsProperty, value);
    }

    public HeaderMenu()
    {
        InitializeComponent();
    }

    protected override void OnLoaded(RoutedEventArgs e)
    {
        base.OnLoaded(e);
        var menuButton = this.FindControl<Button>("MenuButton");
        if (menuButton != null)
        {
            menuButton.Click += OnMenuButtonClick;
        }
    }

    private void OnMenuButtonClick(object? sender, RoutedEventArgs e)
    {
        var popup = this.FindControl<Popup>("MenuPopup");
        if (popup != null)
        {
            popup.IsOpen = !popup.IsOpen;
        }
    }
}

