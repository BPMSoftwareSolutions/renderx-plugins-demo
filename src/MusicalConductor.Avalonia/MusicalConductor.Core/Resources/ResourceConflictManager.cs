using Microsoft.Extensions.Logging;

namespace MusicalConductor.Core.Resources;

/// <summary>
/// ResourceConflictManager - Resolves ownership contention for resources
/// Handles conflict resolution when multiple sequences claim the same resource
/// </summary>
public class ResourceConflictManager
{
    private readonly ILogger<ResourceConflictManager> _logger;
    private readonly object _lock = new();

    public ResourceConflictManager(ILogger<ResourceConflictManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Resolve conflict between two resource owners
    /// </summary>
    public string ResolveConflict(string resourceId, string currentOwner, string requestingOwner)
    {
        lock (_lock)
        {
            _logger.LogWarning(
                "⚠️ ResourceConflictManager: Conflict detected for resource {ResourceId} (current={CurrentOwner}, requesting={RequestingOwner})",
                resourceId,
                currentOwner,
                requestingOwner);

            // Priority: requesting owner takes precedence (FIFO)
            _logger.LogInformation("📦 ResourceConflictManager: Conflict resolved - ownership transferred from {OldOwner} to {NewOwner}", currentOwner, requestingOwner);
            return requestingOwner;
        }
    }

    /// <summary>
    /// Log conflict resolution lifecycle
    /// </summary>
    public void LogConflictStart(string resourceId)
    {
        _logger.LogDebug("📦 ResourceConflictManager: Starting conflict resolution for resource {ResourceId}", resourceId);
    }

    /// <summary>
    /// Log conflict resolution completion
    /// </summary>
    public void LogConflictComplete(string resourceId, string winner)
    {
        _logger.LogDebug("📦 ResourceConflictManager: Conflict resolution completed for resource {ResourceId} - Winner: {Winner}", resourceId, winner);
    }
}

