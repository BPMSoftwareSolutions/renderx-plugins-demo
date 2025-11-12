using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Client;
using MusicalConductor.Avalonia.Engine;
using MusicalConductor.Avalonia.Interfaces;
using MusicalConductor.Avalonia.Logging;
using MusicalConductor.Core.Extensions;

namespace MusicalConductor.Avalonia.Extensions;

/// <summary>
/// Extension methods for registering MusicalConductor services in the DI container.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Add MusicalConductor services to the dependency injection container.
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddMusicalConductor(this IServiceCollection services)
    {
        // Register MusicalConductor.Core services first (IEventBus, IConductor, etc.)
        services.AddMusicalConductorCore();

        // Register ConductorLogger as a singleton
        services.AddSingleton<ConductorLogger>(provider =>
        {
            var logger = provider.GetRequiredService<ILogger<ConductorLogger>>();
            var opts = provider.GetService<MusicalConductorOptions>();
            var enabled = opts?.EnableHierarchicalLogging ?? true;
            return new ConductorLogger(logger, enabled);
        });

        // Register the Jint engine host as a singleton (kept for backward compatibility, but not used for sequence execution)
        services.AddSingleton<JintEngineHost>(provider =>
        {
            var logger = provider.GetRequiredService<ILogger<JintEngineHost>>();
            var opts = provider.GetService<MusicalConductorOptions>();
            var conductorLogger = provider.GetRequiredService<ConductorLogger>();
            return new JintEngineHost(logger, opts, conductorLogger);
        });

        // Register the conductor client as a singleton - NOW USING NATIVE .NET CONDUCTOR
        services.AddSingleton<IConductorClient>(provider =>
        {
            var conductor = provider.GetRequiredService<Core.Interfaces.IConductor>();
            var logger = provider.GetRequiredService<ILogger<ConductorClient>>();
            return new ConductorClient(conductor, logger);
        });

        return services;
    }

    /// <summary>
    /// Add MusicalConductor services with custom configuration.
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="configure">Configuration action</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddMusicalConductor(
        this IServiceCollection services,
        Action<MusicalConductorOptions> configure)
    {
        var options = new MusicalConductorOptions();
        configure(options);

        services.AddSingleton(options);
        return services.AddMusicalConductor();
    }
}

/// <summary>
/// Configuration options for MusicalConductor.
/// </summary>
public class MusicalConductorOptions
{
    /// <summary>
    /// Enable debug logging (default: false).
    /// </summary>
    public bool EnableDebugLogging { get; set; } = false;

    /// <summary>
    /// Enable hierarchical logging with contextual icons (default: true).
    /// When enabled, ConductorLogger will subscribe to Musical Conductor events
    /// and log them with proper indentation and emoji icons matching the web version.
    /// </summary>
    public bool EnableHierarchicalLogging { get; set; } = true;

    /// <summary>
    /// Timeout for conductor operations in milliseconds (default: 30000).
    /// </summary>
    public int OperationTimeoutMs { get; set; } = 30000;

    /// <summary>
    /// Maximum number of concurrent sequences (default: 100).
    /// </summary>
    public int MaxConcurrentSequences { get; set; } = 100;

    /// <summary>
    /// Path to custom conductor bundle (if not using embedded resource).
    /// </summary>
    public string? CustomBundlePath { get; set; }
}

