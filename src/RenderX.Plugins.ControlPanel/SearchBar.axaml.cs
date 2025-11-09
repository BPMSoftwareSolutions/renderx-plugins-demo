using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using System;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Search bar component for filtering and searching
/// </summary>
public partial class SearchBar : UserControl
{
    public static readonly StyledProperty<string> SearchTextProperty =
        AvaloniaProperty.Register<SearchBar, string>(
            nameof(SearchText),
            string.Empty);

    public string SearchText
    {
        get => GetValue(SearchTextProperty);
        set => SetValue(SearchTextProperty, value);
    }

    public event EventHandler? SearchTextChanged;
    public event EventHandler? ClearRequested;

    public SearchBar()
    {
        InitializeComponent();
    }

    private void OnSearchTextChanged(object? sender, TextChangedEventArgs e)
    {
        var input = this.FindControl<TextBox>("SearchInput");
        var clearButton = this.FindControl<Button>("ClearButton");

        if (input != null)
        {
            SearchText = input.Text ?? string.Empty;
            
            if (clearButton != null)
            {
                clearButton.IsVisible = !string.IsNullOrEmpty(SearchText);
            }

            SearchTextChanged?.Invoke(this, e);
        }
    }

    private void OnClearClick(object? sender, RoutedEventArgs e)
    {
        var input = this.FindControl<TextBox>("SearchInput");
        if (input != null)
        {
            input.Text = string.Empty;
        }

        ClearRequested?.Invoke(this, e);
    }
}

