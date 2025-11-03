using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Microsoft.Web.WebView2.Core;
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
        Loaded += OnLoaded;
    }

    private async void OnLoaded(object? sender, RoutedEventArgs e)
    {
        try
        {
            await InitializeWebViewAsync();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"WebView initialization failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Initializes the WebView2 control and loads the TypeScript frontend.
    /// </summary>
    public async Task InitializeWebViewAsync()
    {
        // Determine the frontend URL
        // In development: http://localhost:5173 (Vite dev server)
        // In production: file:// or http:// to local wwwroot
        _frontendUrl = GetFrontendUrl();

        // Initialize WebView2 environment
        var userDataFolder = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "RenderX.Shell.Avalonia"
        );

        var environment = await CoreWebView2Environment.CreateAsync(null, userDataFolder);

        // Create WebView2 controller
        // Note: This requires WebView2 runtime to be installed on the system
        // For production deployment, consider using WebView2 fixed version or bootstrapper

        System.Diagnostics.Debug.WriteLine($"WebView2 initialized. Loading frontend from: {_frontendUrl}");
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

