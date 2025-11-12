using Microsoft.Extensions.DependencyInjection;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;

namespace MusicalConductor.Core.Extensions;

/// <summary>
/// Configuration options for MusicalConductor.Core.
/// </summary>
public class MusicalConductorCoreOptions
{
    /// <summary>
    /// Enable debug logging.
    /// </summary>
    public bool EnableDebugLogging { get; set; }

    /// <summary>
    /// Maximum number of concurrent sequences.
    /// </summary>
    public int MaxConcurrentSequences { get; set; } = 100;

    /// <summary>
    /// Operation timeout in milliseconds.
    /// </summary>
    public int OperationTimeoutMs { get; set; } = 30000;
}

/// <summary>
/// Extension methods for registering MusicalConductor.Core services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Add MusicalConductor.Core services to the DI container.
    /// </summary>
    /// <param name=\"services\">Service collection</param>
    /// <param name=\"configure\">Configuration action</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddMusicalConductorCore(
        this IServiceCollection services,
        Action<MusicalConductorCoreOptions>? configure = null)
    {
        if (services == null)
            throw new ArgumentNullException(nameof(services));

        var options = new MusicalConductorCoreOptions();
        configure?.Invoke(options);

        // Register options
        services.AddSingleton(options);

        // Register core services
        services.AddSingleton<IEventBus, EventBus>();
        services.AddSingleton<ISequenceRegistry, SequenceRegistry>();
        services.AddSingleton<IPluginManager, PluginManager>();
        services.AddSingleton<IExecutionQueue, ExecutionQueue>();
        services.AddSingleton<SequenceExecutor>();
        services.AddSingleton<IConductor, Conductor>();
        services.AddSingleton<IConductorClient, ConductorClient>();

        return services;
    }

    /// <summary>
    /// Add MusicalConductor.Core services with custom configuration.
    /// </summary>
    /// <param name=\"services\">Service collection</param>
    /// <param name=\"enableDebugLogging\">Enable debug logging</param>
    /// <returns>Service collection for chaining</returns>
    public static IServiceCollection AddMusicalConductorCore(
        this IServiceCollection services,
        bool enableDebugLogging)
    {
        return services.AddMusicalConductorCore(options =>
        {
            options.EnableDebugLogging = enableDebugLogging;
        });
    }
}

