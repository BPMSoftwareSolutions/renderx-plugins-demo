using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using Microsoft.Web.WebView2.Core;
using System;
using System.IO;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Minimal;

public partial class MainWindow : Window
{
    private CoreWebView2? _webView;

    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnWindowLoaded;
    }

    private async void OnWindowLoaded(object? sender, RoutedEventArgs e)
    {
        try
        {
            Log("MainWindow loaded, initializing WebView2...");
            await InitializeWebViewAsync();
        }
        catch (Exception ex)
        {
            Log($"Error initializing WebView: {ex.Message}");
            Log($"Stack trace: {ex.StackTrace}");
            ShowError($"WebView2 initialization failed: {ex.Message}");
        }
    }

    private async Task InitializeWebViewAsync()
    {
        try
        {
            Log("Getting TopLevel window...");
            var topLevel = TopLevel.GetTopLevel(this);
            if (topLevel == null)
            {
                throw new InvalidOperationException("TopLevel window not found");
            }

            Log("Getting platform handle...");
            var platformHandle = topLevel.TryGetPlatformHandle();
            if (platformHandle == null)
            {
                throw new InvalidOperationException("Platform handle not found");
            }

            var hwnd = platformHandle.Handle;
            Log($"Native HWND obtained: {hwnd}");

            // Initialize WebView2 environment
            var userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "RenderX.Shell.Avalonia.Minimal"
            );

            Log($"Creating WebView2 environment with user data folder: {userDataFolder}");
            var environment = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
            Log("WebView2 environment created successfully");

            // Create WebView2 controller
            Log("Creating WebView2 controller...");
            var controller = await environment.CreateCoreWebView2ControllerAsync(hwnd);
            if (controller == null)
            {
                throw new InvalidOperationException("Failed to create WebView2 controller");
            }

            _webView = controller.CoreWebView2;
            Log("WebView2 controller created successfully");

            // Set bounds to fill the window
            var windowBounds = this.Bounds;
            controller.Bounds = new System.Drawing.Rectangle(
                0,
                0,
                (int)windowBounds.Width,
                (int)windowBounds.Height
            );
            Log($"WebView2 bounds set to: {controller.Bounds}");

            // Get the test.html path
            var testHtmlPath = Path.Combine(AppContext.BaseDirectory, "test.html");
            if (!File.Exists(testHtmlPath))
            {
                throw new FileNotFoundException($"test.html not found at: {testHtmlPath}");
            }

            var fileUrl = $"file:///{testHtmlPath}";
            Log($"Navigating to: {fileUrl}");
            _webView.Navigate(fileUrl);

            Log("WebView2 initialized and navigating to test.html");

            // Hide loading indicator
            var loadingIndicator = this.FindControl<TextBlock>("LoadingIndicator");
            if (loadingIndicator != null)
            {
                loadingIndicator.IsVisible = false;
            }
        }
        catch (Exception ex)
        {
            Log($"WebView2 initialization error: {ex.Message}");
            throw;
        }
    }

    private void ShowError(string message)
    {
        var loadingIndicator = this.FindControl<TextBlock>("LoadingIndicator");
        if (loadingIndicator != null)
        {
            loadingIndicator.Text = message;
            loadingIndicator.Foreground = new SolidColorBrush(Colors.Red);
        }
    }

    private static void Log(string message)
    {
        try
        {
            var ts = DateTime.Now.ToString("HH:mm:ss.fff");
            var line = $"[{ts}] {message}{Environment.NewLine}";
            var path = Path.Combine(AppContext.BaseDirectory ?? "", "minimal-webview2.log");
            File.AppendAllText(path, line);
            System.Diagnostics.Debug.WriteLine(line);
        }
        catch { /* ignore logging errors */ }
    }
}

