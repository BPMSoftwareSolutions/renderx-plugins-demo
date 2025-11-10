using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Layout;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

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

    private async void OnRemoveClick(object? sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.Tag is string componentId)
        {
            // Find the component to get its name for confirmation
            if (this.FindControl<ItemsControl>("ComponentsItemsControl") is ItemsControl itemsControl)
            {
                if (itemsControl.ItemsSource is ObservableCollection<CustomComponentItem> components)
                {
                    var componentToRemove = components.FirstOrDefault(c => c.Id == componentId);
                    if (componentToRemove != null)
                    {
                        // Show confirmation dialog
                        var confirmMessage = $"Are you sure you want to remove \"{componentToRemove.Name}\"?";
                        var result = await ShowConfirmationDialog(confirmMessage);

                        if (result)
                        {
                            components.Remove(componentToRemove);
                            UpdateStorageInfo(components);
                        }
                    }
                }
            }
        }
    }

    private async Task<bool> ShowConfirmationDialog(string message)
    {
        // Create a simple confirmation dialog
        var window = new Window
        {
            Title = "Confirm Removal",
            Width = 400,
            Height = 150,
            WindowStartupLocation = WindowStartupLocation.CenterOwner,
            CanResize = false
        };

        var panel = new StackPanel { Spacing = 12, Padding = new Thickness(16) };

        var messageBlock = new TextBlock
        {
            Text = message,
            TextWrapping = TextWrapping.Wrap,
            Foreground = new Avalonia.Media.SolidColorBrush(Avalonia.Media.Color.Parse("#374151"))
        };
        panel.Children.Add(messageBlock);

        var buttonPanel = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8, HorizontalAlignment = HorizontalAlignment.Right };

        var cancelButton = new Button
        {
            Content = "Cancel",
            Padding = new Thickness(12, 6),
            Background = new Avalonia.Media.SolidColorBrush(Avalonia.Media.Color.Parse("#e5e7eb")),
            Foreground = new Avalonia.Media.SolidColorBrush(Avalonia.Media.Color.Parse("#374151"))
        };

        var removeButton = new Button
        {
            Content = "Remove",
            Padding = new Thickness(12, 6),
            Background = new Avalonia.Media.SolidColorBrush(Avalonia.Media.Color.Parse("#ef4444")),
            Foreground = new Avalonia.Media.SolidColorBrush(Avalonia.Media.Color.Parse("#ffffff"))
        };

        bool result = false;

        cancelButton.Click += (s, e) => window.Close();
        removeButton.Click += (s, e) => { result = true; window.Close(); };

        buttonPanel.Children.Add(cancelButton);
        buttonPanel.Children.Add(removeButton);
        panel.Children.Add(buttonPanel);

        window.Content = panel;
        await window.ShowDialog(this.FindAncestorOfType<Window>() ?? new Window());

        return result;
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

