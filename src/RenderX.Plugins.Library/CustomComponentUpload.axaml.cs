using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.IO;
using System.Text.Json;

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
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

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
            ValidateAndDisplayFile(_selectedFilePath);
        }
    }

    private void ValidateAndDisplayFile(string filePath)
    {
        try
        {
            // Check file exists
            if (!File.Exists(filePath))
            {
                ShowError("File not found");
                return;
            }

            // Check file size
            var fileInfo = new FileInfo(filePath);
            if (fileInfo.Length > MaxFileSizeBytes)
            {
                ShowError($"File size exceeds 5 MB limit ({fileInfo.Length / (1024 * 1024)} MB)");
                _selectedFilePath = null;
                return;
            }

            // Validate JSON
            var jsonContent = File.ReadAllText(filePath);
            try
            {
                JsonDocument.Parse(jsonContent);
            }
            catch (JsonException ex)
            {
                ShowError($"Invalid JSON: {ex.Message}");
                _selectedFilePath = null;
                return;
            }

            // Display file name
            var fileNameText = this.FindControl<TextBlock>("FileNameText");
            if (fileNameText != null)
            {
                fileNameText.Text = Path.GetFileName(filePath);
                fileNameText.Foreground = new Avalonia.Media.SolidColorBrush(Avalonia.Media.Color.Parse("#10b981"));
            }

            ClearError();
        }
        catch (Exception ex)
        {
            ShowError($"Error reading file: {ex.Message}");
            _selectedFilePath = null;
        }
    }

    private void OnUploadClick(object? sender, RoutedEventArgs e)
    {
        var nameInput = this.FindControl<TextBox>("ComponentNameInput");
        var descriptionInput = this.FindControl<TextBox>("DescriptionInput");

        // Validate inputs
        if (string.IsNullOrWhiteSpace(_selectedFilePath))
        {
            ShowError("Please select a file");
            return;
        }

        if (nameInput == null || string.IsNullOrWhiteSpace(nameInput.Text))
        {
            ShowError("Please enter a component name");
            return;
        }

        if (descriptionInput == null || string.IsNullOrWhiteSpace(descriptionInput.Text))
        {
            ShowError("Please enter a component description");
            return;
        }

        // Upload logic would be implemented here
        RaiseEvent(new RoutedEventArgs(ComponentUploadedEvent));

        // Clear form
        ClearForm();
    }

    private void ShowError(string message)
    {
        var errorText = this.FindControl<TextBlock>("ErrorMessage");
        if (errorText == null)
        {
            // Create error message display if it doesn't exist
            var uploadButton = this.FindControl<Button>("BrowseButton");
            if (uploadButton?.Parent is StackPanel panel)
            {
                errorText = new TextBlock
                {
                    Text = message,
                    FontSize = 10,
                    Foreground = new Avalonia.Media.SolidColorBrush(Avalonia.Media.Color.Parse("#ef4444")),
                    Margin = new Thickness(0, 4, 0, 0)
                };
                panel.Children.Add(errorText);
            }
        }
        else
        {
            errorText.Text = message;
            errorText.IsVisible = true;
        }
    }

    private void ClearError()
    {
        var errorText = this.FindControl<TextBlock>("ErrorMessage");
        if (errorText != null)
        {
            errorText.IsVisible = false;
        }
    }

    private void ClearForm()
    {
        _selectedFilePath = null;

        var fileNameText = this.FindControl<TextBlock>("FileNameText");
        if (fileNameText != null)
        {
            fileNameText.Text = "No file selected";
            fileNameText.Foreground = new Avalonia.Media.SolidColorBrush(Avalonia.Media.Color.Parse("#999"));
        }

        var nameInput = this.FindControl<TextBox>("ComponentNameInput");
        if (nameInput != null)
        {
            nameInput.Text = "";
        }

        var descriptionInput = this.FindControl<TextBox>("DescriptionInput");
        if (descriptionInput != null)
        {
            descriptionInput.Text = "";
        }

        ClearError();
    }
}

