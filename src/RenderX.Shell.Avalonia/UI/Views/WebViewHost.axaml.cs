using Avalonia;
using Avalonia.Controls;
using Microsoft.Web.WebView2.Core;
using System;
using System.IO;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.UI.Views;

/// <summary>
/// WebViewHost - thin wrapper that hosts the TypeScript frontend via WebView2.
/// The frontend (React SPA) renders all UI via plugins mounted to slots.
/// </summary>
public partial class WebViewHost : UserControl
{
    private CoreWebView2Controller? _controller;

    public WebViewHost()
    {
        InitializeComponent();
    }

    /// <summary>
    /// Initialize WebView2 and load the frontend.
    /// Called from MainWindow after it's loaded.
    /// </summary>
    public async Task InitializeWebViewAsync(Window parentWindow)
    {
        try
        {
            // Get the native HWND
            var topLevel = TopLevel.GetTopLevel(parentWindow);
            if (topLevel?.TryGetPlatformHandle() is not { } platformHandle)
            {
                throw new InvalidOperationException("Cannot get platform handle");
            }

            var hwnd = platformHandle.Handle;

            // Create WebView2 environment
            var userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "RenderX.Shell.Avalonia"
            );
            var environment = await CoreWebView2Environment.CreateAsync(null, userDataFolder);

            // Create controller
            _controller = await environment.CreateCoreWebView2ControllerAsync(hwnd);
            if (_controller == null)
                throw new InvalidOperationException("Failed to create WebView2 controller");

            var webView = _controller.CoreWebView2;
            _controller.DefaultBackgroundColor = System.Drawing.Color.White;
            _controller.IsVisible = true;

            // Set bounds to fill parent window
            var bounds = parentWindow.Bounds;
            _controller.Bounds = new System.Drawing.Rectangle(0, 0, (int)bounds.Width, (int)bounds.Height);

            // Keep sized with window
            parentWindow.GetObservable(Window.ClientSizeProperty).Subscribe(size =>
            {
                if (_controller != null)
                    _controller.Bounds = new System.Drawing.Rectangle(0, 0, (int)size.Width, (int)size.Height);
            });

            // Determine frontend URL
            var frontendUrl = GetFrontendUrl();

            // Virtual host mapping for local files
            if (frontendUrl.StartsWith("file:///", StringComparison.OrdinalIgnoreCase))
            {
                var localPath = new Uri(frontendUrl).LocalPath;
                var folder = Path.GetDirectoryName(localPath);
                if (!string.IsNullOrEmpty(folder) && Directory.Exists(folder))
                {
                    const string host = "appassets";
                    webView.SetVirtualHostNameToFolderMapping(host, folder, CoreWebView2HostResourceAccessKind.Allow);
                    frontendUrl = $"https://{host}/" + Path.GetFileName(localPath);
                }
            }

            // Navigate
            webView.Navigate(frontendUrl);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"WebView2 error: {ex.Message}");
            throw;
        }
    }

    private static string GetFrontendUrl()
    {
        // Try Vite dev server first
        try
        {
            using var client = new System.Net.Http.HttpClient { Timeout = TimeSpan.FromSeconds(1) };
            var response = client.GetAsync("http://localhost:5173").Result;
            if (response.IsSuccessStatusCode)
                return "http://localhost:5173";
        }
        catch { }

        // Try wwwroot
        var wwwrootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot");
        if (Directory.Exists(wwwrootPath) && File.Exists(Path.Combine(wwwrootPath, "index.html")))
            return $"file:///{wwwrootPath}/index.html";

        // Try dist
        var distPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "dist");
        if (Directory.Exists(distPath) && File.Exists(Path.Combine(distPath, "index.html")))
            return $"file:///{distPath}/index.html";

        throw new InvalidOperationException("Frontend assets not found");
    }
}

