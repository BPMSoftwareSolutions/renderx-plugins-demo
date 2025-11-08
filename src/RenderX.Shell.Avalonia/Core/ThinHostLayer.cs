using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using MusicalConductor.Avalonia.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core;

/// <summary>
/// Unified wrapper around RenderX.HostSDK.Avalonia and MusicalConductor.Avalonia SDKs.
/// Provides a single point of access to all host services and APIs.
/// </summary>
public interface IThinHostLayer
{
    /// <summary>
    /// Event router for pub/sub messaging with replay cache
    /// </summary>
    IEventRouter EventRouter { get; }

    /// <summary>
    /// Main conductor for orchestrating plugin sequences
    /// </summary>
    IConductorClient Conductor { get; }

    /// <summary>
    /// Initialize the thin host layer and all SDKs
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    Task InitializeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Shutdown the thin host layer and all SDKs
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    Task ShutdownAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Implementation of IThinHostLayer that wraps both SDKs
/// </summary>
public class ThinHostLayer : IThinHostLayer
{
    private readonly IEventRouter _eventRouter;
    private readonly IConductorClient _conductor;
    private readonly ILogger<ThinHostLayer> _logger;
    private bool _initialized;

    /// <summary>
    /// Initialize ThinHostLayer with SDK services via dependency injection
    /// </summary>
    /// <param name="eventRouter">Event router service from RenderX.HostSDK.Avalonia</param>
    /// <param name="conductor">Conductor client from MusicalConductor.Avalonia</param>
    /// <param name="logger">Logger service</param>
    public ThinHostLayer(
        IEventRouter eventRouter,
        IConductorClient conductor,
        ILogger<ThinHostLayer> logger)
    {
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _initialized = false;
    }

    /// <summary>
    /// Event router for pub/sub messaging with replay cache
    /// </summary>
    public IEventRouter EventRouter => _eventRouter;

    /// <summary>
    /// Main conductor for orchestrating plugin sequences
    /// </summary>
    public IConductorClient Conductor => _conductor;

    /// <summary>
    /// Initialize the thin host layer and all SDKs
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        if (_initialized)
        {
            _logger.LogWarning("ThinHostLayer is already initialized");
            return;
        }

        try
        {
            _logger.LogInformation("Initializing ThinHostLayer...");

            // SDKs are already initialized via DI (RenderX.HostSDK.Avalonia and MusicalConductor.Avalonia)
            // Just mark as initialized and log
            _logger.LogDebug("SDK services are ready via dependency injection");

            _initialized = true;
            _logger.LogInformation("ThinHostLayer initialized successfully");
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize ThinHostLayer");
            throw;
        }
    }

    /// <summary>
    /// Shutdown the thin host layer and all SDKs
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    public async Task ShutdownAsync(CancellationToken cancellationToken = default)
    {
        if (!_initialized)
        {
            _logger.LogWarning("ThinHostLayer is not initialized");
            return;
        }

        try
        {
            _logger.LogInformation("Shutting down ThinHostLayer...");

            // Reset event router
            _logger.LogDebug("Resetting EventRouter...");
            _eventRouter.Reset();
            _logger.LogDebug("EventRouter reset successfully");

            _initialized = false;
            _logger.LogInformation("ThinHostLayer shut down successfully");
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to shutdown ThinHostLayer");
            throw;
        }
    }
}

