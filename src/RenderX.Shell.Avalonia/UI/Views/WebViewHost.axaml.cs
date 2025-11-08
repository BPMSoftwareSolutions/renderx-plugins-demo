using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System;
using System.IO;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.UI.Views;

/// <summary>
/// WebViewHost integrates the TypeScript RenderX frontend into the Avalonia shell.
/// It loads the compiled frontend from wwwroot and provides IPC bridges for backend communication.
/// </summary>
public partial class WebViewHost : UserControl
{
    private CoreWebView2? _webView;
    private string? _frontendUrl;

    public WebViewHost()
    {
        InitializeComponent();
        // NOTE: Do NOT initialize WebView here. Let the parent window handle it
        // to avoid double initialization and timing issues.
    }

    /// <summary>
    /// Initializes the WebView2 control and loads the TypeScript frontend.
    /// This method should be called from the parent window after it has loaded.
    /// </summary>
    public async Task InitializeWebViewAsync(Window parentWindow)
    {
        try
        {
            // Determine the frontend URL
            // In development: http://localhost:5173 (Vite dev server)
            // In production: load from local wwwroot via a secure virtual host mapping
            _frontendUrl = GetFrontendUrl();
            System.Diagnostics.Debug.WriteLine($"Frontend URL determined: {_frontendUrl}");

            System.Diagnostics.Debug.WriteLine("Getting native window handle");

            // Get the native HWND of the Avalonia window
            var topLevel = TopLevel.GetTopLevel(parentWindow);
            if (topLevel == null)
            {
                throw new InvalidOperationException("TopLevel window not found");
            }

            var platformHandle = topLevel.TryGetPlatformHandle();
            if (platformHandle == null)
            {
                throw new InvalidOperationException("Platform handle not found");
            }

            var hwnd = platformHandle.Handle;
            System.Diagnostics.Debug.WriteLine($"Native HWND obtained: {hwnd}");

            // Initialize WebView2 environment
            var userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "RenderX.Shell.Avalonia"
            );

            System.Diagnostics.Debug.WriteLine($"Creating WebView2 environment with user data folder: {userDataFolder}");
            var environment = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
            System.Diagnostics.Debug.WriteLine("WebView2 environment created successfully");

            // Create WebView2 controller with the native HWND
            var controller = await environment.CreateCoreWebView2ControllerAsync(hwnd);
            if (controller == null)
            {
                throw new InvalidOperationException("Failed to create WebView2 controller");
            }

            _webView = controller.CoreWebView2;
            System.Diagnostics.Debug.WriteLine("WebView2 controller created successfully");

            // Improve visuals
            controller.DefaultBackgroundColor = System.Drawing.Color.White;

            // If we're loading from local files, use a virtual host mapping so absolute
            // asset paths like "/assets/..." resolve correctly under a stable origin.
            if (!string.IsNullOrEmpty(_frontendUrl) && _frontendUrl.StartsWith("file:///", StringComparison.OrdinalIgnoreCase))
            {
                var localIndexPath = new Uri(_frontendUrl).LocalPath;
                var folder = Path.GetDirectoryName(localIndexPath);
                if (!string.IsNullOrEmpty(folder) && Directory.Exists(folder))
                {
                    const string host = "appassets";
                    _webView.SetVirtualHostNameToFolderMapping(host, folder, CoreWebView2HostResourceAccessKind.Allow);
                    _frontendUrl = $"https://{host}/" + Path.GetFileName(localIndexPath);
                    System.Diagnostics.Debug.WriteLine($"Applied virtual host mapping: {host} -> {folder}");
                }
            }

            // Set the bounds of the WebView2 control to fill the entire window
            // Use the parent window's bounds directly
            var windowBounds = parentWindow.Bounds;
            controller.Bounds = new System.Drawing.Rectangle(
                0,
                0,
                (int)windowBounds.Width,
                (int)windowBounds.Height
            );
            System.Diagnostics.Debug.WriteLine($"WebView2 bounds set to: {controller.Bounds}");

            // Basic navigation diagnostics
            _webView.NavigationStarting += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine($"NavigationStarting: {e.Uri}");
            };
            _webView.NavigationCompleted += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine($"NavigationCompleted: success={e.IsSuccess}, status={e.HttpStatusCode}, uri={_webView.Source}");
            };

            // Navigate to the frontend URL
            System.Diagnostics.Debug.WriteLine($"Navigating to: {_frontendUrl}");
            _webView.Navigate(_frontendUrl);

            System.Diagnostics.Debug.WriteLine("WebView2 initialized and navigating to frontend");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"WebView2 initialization error: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    /// <summary>
    /// Determines the frontend URL based on environment and available assets.
    /// </summary>
    private string GetFrontendUrl()
    {
        // Check if we're in development mode (Vite dev server running)
        if (IsViteDevServerRunning())
        {
            return "http://localhost:5173";
        }

        // Check if wwwroot has built assets
        var wwwrootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot");
        if (Directory.Exists(wwwrootPath) && HasIndexHtml(wwwrootPath))
        {
            return $"file:///{wwwrootPath}/index.html";
        }

        // Fallback: try to load from dist directory (for development)
        var distPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "dist");
        if (Directory.Exists(distPath) && HasIndexHtml(distPath))
        {
            return $"file:///{distPath}/index.html";
        }

        throw new InvalidOperationException(
            "Could not find RenderX frontend assets. " +
            "Ensure TypeScript build completed successfully or Vite dev server is running."
        );
    }

    private bool IsViteDevServerRunning()
    {
        try
        {
            using var client = new System.Net.Http.HttpClient { Timeout = TimeSpan.FromSeconds(1) };
            var response = client.GetAsync("http://localhost:5173").Result;
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private bool HasIndexHtml(string path)
    {
        return File.Exists(Path.Combine(path, "index.html"));
    }

    /// <summary>
    /// Sends a message to the TypeScript frontend via postMessage.
    /// </summary>
    public async Task SendMessageToFrontendAsync(string message)
    {
        if (_webView == null)
        {
            throw new InvalidOperationException("WebView not initialized");
        }

        // Execute JavaScript to post message to the frontend
        var script = $@"
            window.postMessage({{
                source: 'dotnet-host',
                message: {System.Text.Json.JsonSerializer.Serialize(message)}
            }}, '*');
        ";

        await _webView.ExecuteScriptAsync(script);
    }

    /// <summary>
    /// Registers a handler for messages from the TypeScript frontend.
    /// Note: Message handling is typically done via window.postMessage and addEventListener
    /// in the frontend, with the backend listening via WebView2 script execution.
    /// </summary>
    public void RegisterMessageHandler(string channelName, Action<string> handler)
    {
        if (_webView == null)
        {
            throw new InvalidOperationException("WebView not initialized");
        }

        // For now, this is a placeholder for future message routing implementation.
        // In practice, the frontend will use window.postMessage to communicate with the host,
        // and the host can listen via WebView2's script execution capabilities.
        System.Diagnostics.Debug.WriteLine($"Message handler registered for channel: {channelName}");
    }
}

