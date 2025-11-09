using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Avalonia.ReactiveUI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Extensions;
using RenderX.HostSDK.Avalonia.Extensions;
using RenderX.Shell.Avalonia.Core;
using RenderX.Shell.Avalonia.Infrastructure.Configuration;
using RenderX.Shell.Avalonia.UI.ViewModels;
using RenderX.Shell.Avalonia.Infrastructure.Plugins;
using Serilog;
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

                // Thin Host Layer - unified wrapper around SDKs
                services.AddSingleton<IThinHostLayer, ThinHostLayer>();

                // Plugin loader - manifest-agnostic slot-to-control mapping
                services.AddSingleton<IPluginLoader, PluginLoader>();

                // UI Event Service - manifest-driven keyboard shortcuts (ADR-0037)
                services.AddSingleton<Infrastructure.Events.IUiEventService, Infrastructure.Events.UiEventService>();

                // Configuration
                services.Configure<RenderXConfiguration>(context.Configuration.GetSection("RenderX"));

                // ViewModels
                services.AddTransient<MainWindowViewModel>();

                // Logging - Configure Serilog with file output
                var logDirectory = System.IO.Path.Combine(AppContext.BaseDirectory ?? "", ".logs");
                System.IO.Directory.CreateDirectory(logDirectory);
                
                var logFileName = $"renderx-{DateTime.Now:yyyyMMdd-HHmmss}.log";
                var logFilePath = System.IO.Path.Combine(logDirectory, logFileName);

                Serilog.Log.Logger = new LoggerConfiguration()
                    .MinimumLevel.Information()
                    .WriteTo.Console(
                        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}")
                    .WriteTo.File(
                        logFilePath,
                        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz}] [{Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}",
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: 7,
                        shared: true,
                        flushToDiskInterval: TimeSpan.FromSeconds(1))
                    .CreateLogger();

                services.AddLogging(builder =>
                {
                    builder.ClearProviders();
                    builder.AddSerilog(Serilog.Log.Logger, dispose: true);
                });
            });
    }
}
