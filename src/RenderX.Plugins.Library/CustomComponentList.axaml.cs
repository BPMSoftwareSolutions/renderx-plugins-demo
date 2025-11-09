using Avalonia.Controls;
using Avalonia.Interactivity;
using System.Collections.ObjectModel;
using System.Linq;

namespace RenderX.Plugins.Library;

public partial class CustomComponentList : UserControl
{
    public CustomComponentList()
    {
        InitializeComponent();
        InitializeComponents();
    }

    private void InitializeComponents()
    {
        // Initialize with sample data for demonstration
        var components = new ObservableCollection<CustomComponentItem>
        {
            new CustomComponentItem
            {
                Id = "comp-001",
                Name = "Custom Button",
                Description = "A custom button component with advanced styling",
                UploadDate = "Nov 8, 2025",
                FileSize = "2.5 KB"
            },
            new CustomComponentItem
            {
                Id = "comp-002",
                Name = "Data Grid",
                Description = "Advanced data grid with sorting and filtering",
                UploadDate = "Nov 7, 2025",
                FileSize = "5.2 KB"
            },
            new CustomComponentItem
            {
                Id = "comp-003",
                Name = "Chart Widget",
                Description = "Interactive chart component for data visualization",
                UploadDate = "Nov 6, 2025",
                FileSize = "8.1 KB"
            }
        };

        if (this.FindControl<ItemsControl>("ComponentsItemsControl") is ItemsControl itemsControl)
        {
            itemsControl.ItemsSource = components;
        }

        UpdateStorageInfo(components);
    }

    private void UpdateStorageInfo(ObservableCollection<CustomComponentItem> components)
    {
        // Calculate total storage
        double totalSize = 0;
        foreach (var component in components)
        {
            // Parse size (e.g., "2.5 KB" -> 2.5)
            if (double.TryParse(component.FileSize.Replace(" KB", ""), out var size))
            {
                totalSize += size;
            }
        }

        const double maxStorage = 100.0; // 100 MB
        double usagePercent = (totalSize / maxStorage) * 100;

        // Update storage info
        if (this.FindControl<TextBlock>("StorageInfo") is TextBlock storageInfo)
        {
            storageInfo.Text = $"Storage: {totalSize:F1} MB / {maxStorage} MB ({usagePercent:F0}%)";
        }

        // Show warning if above 80%
        if (this.FindControl<Border>("StorageWarning") is Border warning)
        {
            warning.IsVisible = usagePercent > 80;
        }

        // Show/hide empty state
        if (this.FindControl<Border>("EmptyState") is Border emptyState)
        {
            emptyState.IsVisible = components.Count == 0;
        }
    }

    private void OnRemoveClick(object? sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.Tag is string componentId)
        {
            // Find and remove the component
            if (this.FindControl<ItemsControl>("ComponentsItemsControl") is ItemsControl itemsControl)
            {
                if (itemsControl.ItemsSource is ObservableCollection<CustomComponentItem> components)
                {
                    var componentToRemove = components.FirstOrDefault(c => c.Id == componentId);
                    if (componentToRemove != null)
                    {
                        components.Remove(componentToRemove);
                        UpdateStorageInfo(components);
                    }
                }
            }
        }
    }
}

/// <summary>
/// Represents a custom component item in the list
/// </summary>
public class CustomComponentItem
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string UploadDate { get; set; } = string.Empty;
    public string FileSize { get; set; } = string.Empty;
}

