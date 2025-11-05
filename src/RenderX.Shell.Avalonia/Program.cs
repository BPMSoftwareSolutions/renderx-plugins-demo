using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Avalonia.ReactiveUI;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Core.Conductor;
using RenderX.Shell.Avalonia.Core.Events;
using RenderX.Shell.Avalonia.Core.Manifests;
using RenderX.Shell.Avalonia.Core.Plugins;
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

    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public override async void OnFrameworkInitializationCompleted()
    {
        // Build and start the host
        _host = CreateHostBuilder().Build();
        await _host.StartAsync();

        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            var mainWindowViewModel = _host.Services.GetRequiredService<MainWindowViewModel>();
            desktop.MainWindow = new MainWindow
            {
                DataContext = mainWindowViewModel
            };
        }

        base.OnFrameworkInitializationCompleted();
    }

    private static IHostBuilder CreateHostBuilder()
    {
        return Host.CreateDefaultBuilder()
            .ConfigureServices((context, services) =>
            {
                // Core services
                services.AddSingleton<IConductor, AvaloniaMusicalConductor>();
                services.AddSingleton<IEventRouter, AvaloniaEventRouter>();
                services.AddSingleton<IPluginManager, AvaloniaPluginManager>();
                services.AddSingleton<IManifestLoader, JsonManifestLoader>();

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
                })
                .UseUrls("http://localhost:5000");
            });
    }
}
