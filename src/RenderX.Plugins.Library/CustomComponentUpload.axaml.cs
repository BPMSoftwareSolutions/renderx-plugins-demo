using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.Library;

/// <summary>
/// Custom component upload - allows uploading custom components
/// </summary>
public partial class CustomComponentUpload : UserControl
{
    public static readonly RoutedEvent<RoutedEventArgs> ComponentUploadedEvent =
        RoutedEvent.Register<CustomComponentUpload, RoutedEventArgs>(
            nameof(ComponentUploaded),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? ComponentUploaded
    {
        add => AddHandler(ComponentUploadedEvent, value);
        remove => RemoveHandler(ComponentUploadedEvent, value);
    }

    private string? _selectedFilePath;

    public CustomComponentUpload()
    {
        InitializeComponent();
    }

    private async void OnBrowseClick(object? sender, RoutedEventArgs e)
    {
        var dialog = new OpenFileDialog
        {
            Title = "Select Component File",
            Filters = new System.Collections.Generic.List<FileDialogFilter>
            {
                new FileDialogFilter { Name = "JSON Files", Extensions = new System.Collections.Generic.List<string> { "json" } },
                new FileDialogFilter { Name = "All Files", Extensions = new System.Collections.Generic.List<string> { "*" } }
            }
        };

        var result = await dialog.ShowAsync(new Window());
        if (result != null && result.Length > 0)
        {
            _selectedFilePath = result[0];
            var fileNameText = this.FindControl<TextBlock>("FileNameText");
            if (fileNameText != null)
            {
                fileNameText.Text = System.IO.Path.GetFileName(_selectedFilePath);
            }
        }
    }

    private void OnUploadClick(object? sender, RoutedEventArgs e)
    {
        var nameInput = this.FindControl<TextBox>("ComponentNameInput");
        var descriptionInput = this.FindControl<TextBox>("DescriptionInput");

        if (string.IsNullOrWhiteSpace(_selectedFilePath) || 
            nameInput == null || string.IsNullOrWhiteSpace(nameInput.Text) ||
            descriptionInput == null || string.IsNullOrWhiteSpace(descriptionInput.Text))
        {
            return;
        }

        // Upload logic would be implemented here
        RaiseEvent(new RoutedEventArgs(ComponentUploadedEvent));
    }
}

