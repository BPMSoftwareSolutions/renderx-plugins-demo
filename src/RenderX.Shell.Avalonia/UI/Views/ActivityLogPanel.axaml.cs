using Avalonia;
using Avalonia.Controls;
using Avalonia.Data;
using Avalonia.Interactivity;
using RenderX.HostSDK.Avalonia.Services;

namespace RenderX.Shell.Avalonia.UI.Views;

/// <summary>
/// ActivityLogPanel displays real-time conductor log messages.
/// Shows all activity from startup onwards with filtering and clearing capabilities.
/// </summary>
public partial class ActivityLogPanel : UserControl
{
    public ActivityLogPanel()
    {
        InitializeComponent();
        DataContext = ConductorLogService.Instance;

        // Set up bindings programmatically to avoid XAML compilation issues
        var logCountText = this.FindControl<TextBlock>("LogCountText");
        if (logCountText != null)
        {
            logCountText.Bind(TextBlock.TextProperty,
                new Binding("Logs.Count") { Source = ConductorLogService.Instance });
        }

        var logListBox = this.FindControl<ListBox>("LogListBox");
        if (logListBox != null)
        {
            logListBox.Bind(ItemsControl.ItemsSourceProperty,
                new Binding("Logs") { Source = ConductorLogService.Instance });
        }

        // Test log to verify the panel is working
        ConductorLogService.Instance.LogInfo($"Activity Log Panel loaded - {ConductorLogService.Instance.Logs.Count} logs captured", "ActivityLogPanel");
    }

    private void OnClearClicked(object? sender, RoutedEventArgs e)
    {
        ConductorLogService.Instance.Clear();
    }

    private void OnCollapseClicked(object? sender, RoutedEventArgs e)
    {
        // This will be handled by the parent shell to collapse the footer
        // For now, just log the action
        ConductorLogService.Instance.LogInfo("Activity log collapsed", "UI");
    }
}

