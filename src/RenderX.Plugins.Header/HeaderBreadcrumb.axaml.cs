using Avalonia;
using Avalonia.Controls;
using System.Collections.Generic;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header breadcrumb - displays navigation breadcrumb trail
/// </summary>
public partial class HeaderBreadcrumb : UserControl
{
    public static readonly StyledProperty<List<string>> PathProperty =
        AvaloniaProperty.Register<HeaderBreadcrumb, List<string>>(
            nameof(Path),
            new List<string>());

    public List<string> Path
    {
        get => GetValue(PathProperty);
        set => SetValue(PathProperty, value);
    }

    public HeaderBreadcrumb()
    {
        InitializeComponent();
        UpdateBreadcrumb();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == PathProperty)
        {
            UpdateBreadcrumb();
        }
    }

    private void UpdateBreadcrumb()
    {
        var container = this.FindControl<ItemsControl>("BreadcrumbContainer");
        if (container != null)
        {
            container.ItemsSource = Path;
        }
    }
}

