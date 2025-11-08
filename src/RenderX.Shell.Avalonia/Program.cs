using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Avalonia.ReactiveUI;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Extensions;
using RenderX.HostSDK.Avalonia.Extensions;
using RenderX.Shell.Avalonia.Core;
using RenderX.Shell.Avalonia.Core.Manifests;
using RenderX.Shell.Avalonia.Infrastructure.Api.Endpoints;
using RenderX.Shell.Avalonia.Infrastructure.Api.Services;
using RenderX.Shell.Avalonia.Infrastructure.Configuration;
using RenderX.Shell.Avalonia.Infrastructure.Bridge;
using RenderX.Shell.Avalonia.UI.ViewModels;
using System;

namespace RenderX.Shell.Avalonia;

class Program
{
    // Initialization code. Don't use any Avalonia, third-party APIs or any
    // SynchronizationContext-reliant code before AppMain is called: things aren't initialized
    // yet and stuff might break.
    [STAThread]
    public static void Main(string[] args) => BuildAvaloniaApp()
        .StartWithClassicDesktopLifetime(args);

    // Avalonia configuration, don't remove; also used by visual designer.
    public static AppBuilder BuildAvaloniaApp()
        => AppBuilder.Configure<App>()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace()
            .UseReactiveUI();
}

public partial class App : Application
{
    private IHost? _host;

    /// <summary>
    /// Service provider for dependency injection
    /// </summary>
    public IServiceProvider ServiceProvider => _host?.Services ?? throw new InvalidOperationException("Host not initialized");

    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    private static void Log(string message)
    {
        try
        {
            var ts = DateTime.Now.ToString("HH:mm:ss.fff");
            var line = $"[{ts}] {message}{Environment.NewLine}";
            var path = System.IO.Path.Combine(AppContext.BaseDirectory ?? "", "startup.log");
            System.IO.File.AppendAllText(path, line);
        }
        catch { /* ignore logging errors */ }
    }

    public override async void OnFrameworkInitializationCompleted()
    {
        Log("OnFrameworkInitializationCompleted: begin");
        // Build the host (services are available even if StartAsync fails)
        try
        {
            _host = CreateHostBuilder().Build();
            Log("Host built successfully");
        }
        catch (Exception ex)
        {
            Log($"Host build failed: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Host build failed: {ex.Message}");
        }

        // Always create and show the MainWindow so the app starts even if hosting fails
        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            try
            {
                Log("Creating MainWindow...");
                MainWindowViewModel? mainWindowViewModel = null;
                try
                {
                    mainWindowViewModel = _host?.Services.GetService(typeof(MainWindowViewModel)) as MainWindowViewModel;
                }
                catch (Exception ex)
                {
                    Log($"Resolving MainWindowViewModel failed: {ex.Message}");
                    // ignore resolving errors; we'll create the window without a DataContext
                }

                desktop.MainWindow = new MainWindow();
                if (mainWindowViewModel is not null)
                {
                    desktop.MainWindow.DataContext = mainWindowViewModel;
                    Log("MainWindow DataContext set");
                }
                Log("MainWindow created");
            }
            catch (Exception ex)
            {
                Log($"Failed to create MainWindow: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Failed to create MainWindow: {ex.Message}");
                desktop.MainWindow = new MainWindow();
            }
        }
        else
        {
            Log("ApplicationLifetime is not IClassicDesktopStyleApplicationLifetime");
        }

        // Start the host in the background; if it fails, log and continue
        try
        {
            if (_host != null)
            {
                await _host.StartAsync();
                Log("Host started successfully");
            }
            else
            {
                Log("Host is null, skipping StartAsync");
            }
        }
        catch (Exception ex)
        {
            Log($"Host start failed: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Host start failed: {ex.Message}");
        }

        Log("OnFrameworkInitializationCompleted: end");
        base.OnFrameworkInitializationCompleted();
    }

    private static IHostBuilder CreateHostBuilder()
    {
        return Host.CreateDefaultBuilder()
            .ConfigureServices((context, services) =>
            {
                // SDK services - RenderX.HostSDK.Avalonia and MusicalConductor.Avalonia
                // These are registered by the SDKs themselves via extension methods
                services.AddRenderXHostSdk();
                services.AddMusicalConductor();

                // Manifest loader
                services.AddSingleton<IManifestLoader, JsonManifestLoader>();

                // Thin Host Layer - unified wrapper around SDKs
                services.AddSingleton<IThinHostLayer, ThinHostLayer>();

                // API Services
                services.AddSingleton<IPluginDiscoveryService, PluginDiscoveryService>();
                services.AddSingleton<ITelemetryService, TelemetryService>();
                services.AddSingleton<IConfigurationService, ConfigurationService>();

                // Bridge services
                services.AddSingleton<IWebViewBridgeService, WebViewBridgeService>();

                // ASP.NET Core API
                services.AddControllers();
                services.AddCors(options =>
                {
                    options.AddPolicy("AllowAll", builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
                });

                // Configuration
                services.Configure<RenderXConfiguration>(context.Configuration.GetSection("RenderX"));

                // ViewModels
                services.AddTransient<MainWindowViewModel>();

                // Logging
                services.AddLogging(builder =>
                {
                    builder.AddConsole();
                    builder.SetMinimumLevel(LogLevel.Information);
                });
            })
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.Configure((context, app) =>
                {
                    // Configure ASP.NET Core pipeline
                    app.UseRouting();
                    app.UseCors("AllowAll");

                    app.UseEndpoints(endpoints =>
                    {
                        // Map API endpoints
                        endpoints.MapPluginEndpoints();
                        endpoints.MapTelemetryEndpoints();
                        endpoints.MapConfigurationEndpoints();
                        endpoints.MapSequenceEndpoints();
                    });
                });

                // Bind API to env var if provided; otherwise use an ephemeral port to avoid collisions
                var apiUrl = Environment.GetEnvironmentVariable("RENDERX_API_URL");
                if (string.IsNullOrWhiteSpace(apiUrl))
                {
                    apiUrl = "http://127.0.0.1:0";
                }
                webBuilder.UseUrls(apiUrl);
            });
    }
}
