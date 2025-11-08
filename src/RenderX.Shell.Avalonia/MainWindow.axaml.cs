using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using RenderX.Shell.Avalonia.UI.ViewModels;
using RenderX.Shell.Avalonia.UI.Views;
using System;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia;

public partial class MainWindow : Window
{
    private sealed class NoopObserver<T> : IObserver<T>
    {
        public void OnCompleted() { }
        public void OnError(Exception error) { }
        public void OnNext(T value) { }
    }

    public MainWindow()
    {
        InitializeComponent();

        // Global keyboard shortcut for diagnostics (Ctrl+Shift+D)
        KeyDown += OnKeyDown;

        // Initialize WebView when window loads
        Loaded += OnWindowLoaded;
    }

    private async void OnWindowLoaded(object? sender, RoutedEventArgs e)
    {
        try
        {
            var webViewHost = this.FindControl<WebViewHost>("WebViewHost");
            if (webViewHost != null)
            {
                // Pass the parent window to WebViewHost for proper bounds calculation
                await webViewHost.InitializeWebViewAsync(this);

                // Simulate async frontend load to ensure fallback UI is visible briefly
                await Task.Delay(1500);

                // Update ViewModel to indicate WebView is loaded
                if (DataContext is MainWindowViewModel viewModel)
                {
                    viewModel.WebViewLoaded = true;
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error initializing WebView: {ex.Message}");
        }
    }

    private void OnKeyDown(object? sender, KeyEventArgs e)
    {
        if (DataContext is MainWindowViewModel viewModel)
        {
            // Ctrl+Shift+D or Cmd+Shift+D
            if ((e.KeyModifiers.HasFlag(KeyModifiers.Control) || e.KeyModifiers.HasFlag(KeyModifiers.Meta))
                && e.KeyModifiers.HasFlag(KeyModifiers.Shift)
                && e.Key == Key.D)
            {
                e.Handled = true;
                viewModel.ToggleDiagnosticsCommand.Execute().Subscribe(new NoopObserver<System.Reactive.Unit>());
            }
        }
    }
}
