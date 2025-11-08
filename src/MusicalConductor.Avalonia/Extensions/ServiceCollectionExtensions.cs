using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Client;
using MusicalConductor.Avalonia.Engine;
using MusicalConductor.Avalonia.Interfaces;

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
        // Register the Jint engine host as a singleton
        services.AddSingleton<JintEngineHost>(provider =>
        {
            var logger = provider.GetRequiredService<ILogger<JintEngineHost>>();
            var opts = provider.GetService<MusicalConductorOptions>();
            return new JintEngineHost(logger, opts);
        });

        // Register the conductor client as a singleton
        services.AddSingleton<IConductorClient>(provider =>
        {
            var engine = provider.GetRequiredService<JintEngineHost>();
            var logger = provider.GetRequiredService<ILogger<ConductorClient>>();
            return new ConductorClient(engine, logger);
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

