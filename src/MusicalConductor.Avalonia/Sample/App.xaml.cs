using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Extensions;

namespace MusicalConductor.Sample;

public partial class App : Application
{
    private IServiceProvider? _serviceProvider;

    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public override void OnFrameworkInitializationCompleted()
    {
        // Setup dependency injection
        var services = new ServiceCollection();

        // Add logging
        services.AddLogging(builder =>
        {
            builder.AddConsole();
            builder.SetMinimumLevel(LogLevel.Information);
        });

        // Add MusicalConductor
        services.AddMusicalConductor(options =>
        {
            options.EnableDebugLogging = true;
            options.OperationTimeoutMs = 30000;
        });

        _serviceProvider = services.BuildServiceProvider();

        if (ApplicationLifetime is IClassicDesktopApplicationLifetime desktop)
        {
            desktop.MainWindow = new MainWindow(
                _serviceProvider.GetRequiredService<MusicalConductor.Avalonia.Interfaces.IConductorClient>(),
                _serviceProvider.GetRequiredService<ILogger<MainWindow>>()
            );
        }

        base.OnFrameworkInitializationCompleted();
    }
}

