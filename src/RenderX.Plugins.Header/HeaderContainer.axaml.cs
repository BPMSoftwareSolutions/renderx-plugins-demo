using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Presenters;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header container - a layout component for organizing header content into left, center, and right slots
/// </summary>
public partial class HeaderContainer : UserControl
{
    public static readonly StyledProperty<Control?> LeftContentProperty =
        AvaloniaProperty.Register<HeaderContainer, Control?>(
            nameof(LeftContent),
            null);

    public static readonly StyledProperty<Control?> CenterContentProperty =
        AvaloniaProperty.Register<HeaderContainer, Control?>(
            nameof(CenterContent),
            null);

    public static readonly StyledProperty<Control?> RightContentProperty =
        AvaloniaProperty.Register<HeaderContainer, Control?>(
            nameof(RightContent),
            null);

    public Control? LeftContent
    {
        get => GetValue(LeftContentProperty);
        set => SetValue(LeftContentProperty, value);
    }

    public Control? CenterContent
    {
        get => GetValue(CenterContentProperty);
        set => SetValue(CenterContentProperty, value);
    }

    public Control? RightContent
    {
        get => GetValue(RightContentProperty);
        set => SetValue(RightContentProperty, value);
    }

    public HeaderContainer()
    {
        InitializeComponent();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);

        if (change.Property == LeftContentProperty)
        {
            var leftSlot = this.FindControl<ContentPresenter>("LeftSlot");
            if (leftSlot != null)
            {
                leftSlot.Content = LeftContent;
            }
        }
        else if (change.Property == CenterContentProperty)
        {
            var centerSlot = this.FindControl<ContentPresenter>("CenterSlot");
            if (centerSlot != null)
            {
                centerSlot.Content = CenterContent;
            }
        }
        else if (change.Property == RightContentProperty)
        {
            var rightSlot = this.FindControl<ContentPresenter>("RightSlot");
            if (rightSlot != null)
            {
                rightSlot.Content = RightContent;
            }
        }
    }
}

