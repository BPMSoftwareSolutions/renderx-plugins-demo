using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System.Collections.Generic;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Property section - an expandable section for displaying component properties
/// </summary>
public partial class PropertySection : UserControl
{
    private bool _isExpanded = true;

    public static readonly StyledProperty<string> TitleProperty =
        AvaloniaProperty.Register<PropertySection, string>(
            nameof(Title),
            "Properties");

    public static readonly StyledProperty<List<(string Key, string Value)>> PropertiesProperty =
        AvaloniaProperty.Register<PropertySection, List<(string, string)>>(
            nameof(Properties),
            new List<(string, string)>());

    public string Title
    {
        get => GetValue(TitleProperty);
        set => SetValue(TitleProperty, value);
    }

    public List<(string Key, string Value)> Properties
    {
        get => GetValue(PropertiesProperty);
        set => SetValue(PropertiesProperty, value);
    }

    public PropertySection()
    {
        InitializeComponent();
        UpdateSection();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == TitleProperty || change.Property == PropertiesProperty)
        {
            UpdateSection();
        }
    }

    private void OnToggleClick(object? sender, RoutedEventArgs e)
    {
        _isExpanded = !_isExpanded;
        UpdateToggleIcon();
        
        var contentPanel = this.FindControl<StackPanel>("ContentPanel");
        if (contentPanel != null)
        {
            contentPanel.IsVisible = _isExpanded;
        }
    }

    private void UpdateSection()
    {
        var sectionTitle = this.FindControl<TextBlock>("SectionTitle");
        if (sectionTitle != null)
        {
            sectionTitle.Text = Title;
        }

        var propertiesControl = this.FindControl<ItemsControl>("PropertiesItemsControl");
        if (propertiesControl != null)
        {
            propertiesControl.ItemsSource = Properties;
        }

        UpdateToggleIcon();
    }

    private void UpdateToggleIcon()
    {
        var toggleIcon = this.FindControl<TextBlock>("ToggleIcon");
        if (toggleIcon != null)
        {
            toggleIcon.Text = _isExpanded ? "▼" : "▶";
        }
    }
}

