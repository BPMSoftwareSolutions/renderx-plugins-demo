using Microsoft.Extensions.Logging;

namespace MusicalConductor.Core.Resources;

/// <summary>
/// ResourceOwnershipTracker - Maintains ownership graph for resources
/// Tracks which sequences own which resources and their relationships
/// </summary>
public class ResourceOwnershipTracker
{
    public class OwnershipRecord
    {
        public string OwnerId { get; set; } = string.Empty;
        public List<string> OwnedResources { get; set; } = new();
        public DateTime AcquiredAt { get; set; }
    }

    private readonly Dictionary<string, OwnershipRecord> _ownershipGraph = new();
    private readonly ILogger<ResourceOwnershipTracker> _logger;
    private readonly object _lock = new();

    public ResourceOwnershipTracker(ILogger<ResourceOwnershipTracker> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Track ownership of a resource
    /// </summary>
    public void TrackOwnership(string ownerId, string resourceId)
    {
        lock (_lock)
        {
            if (!_ownershipGraph.TryGetValue(ownerId, out var record))
            {
                record = new OwnershipRecord
                {
                    OwnerId = ownerId,
                    AcquiredAt = DateTime.UtcNow
                };
                _ownershipGraph[ownerId] = record;
            }

            if (!record.OwnedResources.Contains(resourceId))
            {
                record.OwnedResources.Add(resourceId);

                _logger.LogDebug(
                    "🔗 ResourceOwnershipTracker: Owner {OwnerId} now owns resource {ResourceId}",
                    ownerId,
                    resourceId);
            }
        }
    }

    /// <summary>
    /// Remove ownership of a resource
    /// </summary>
    public void RemoveOwnership(string ownerId, string resourceId)
    {
        lock (_lock)
        {
            if (_ownershipGraph.TryGetValue(ownerId, out var record))
            {
                record.OwnedResources.Remove(resourceId);
                _logger.LogDebug("🔗 ResourceOwnershipTracker: Owner {OwnerId} released resource {ResourceId}", ownerId, resourceId);
            }
        }
    }

    /// <summary>
    /// Get resources owned by an owner
    /// </summary>
    public IReadOnlyList<string> GetOwnedResources(string ownerId)
    {
        lock (_lock)
        {
            if (_ownershipGraph.TryGetValue(ownerId, out var record))
            {
                return record.OwnedResources.AsReadOnly();
            }
            return new List<string>().AsReadOnly();
        }
    }

    /// <summary>
    /// Get all ownership records
    /// </summary>
    public IReadOnlyList<OwnershipRecord> GetAllOwnershipRecords()
    {
        lock (_lock)
        {
            return _ownershipGraph.Values.ToList().AsReadOnly();
        }
    }

    /// <summary>
    /// Clear all ownership records
    /// </summary>
    public void Clear()
    {
        lock (_lock)
        {
            var count = _ownershipGraph.Count;
            _ownershipGraph.Clear();
            _logger.LogInformation("🔗 ResourceOwnershipTracker: Cleared {OwnershipCount} ownership records", count);
        }
    }

    /// <summary>
    /// Get ownership graph statistics
    /// </summary>
    public (int OwnerCount, int TotalResources) GetStatistics()
    {
        lock (_lock)
        {
            var ownerCount = _ownershipGraph.Count;
            var totalResources = _ownershipGraph.Values.Sum(r => r.OwnedResources.Count);
            _logger.LogDebug("🔗 ResourceOwnershipTracker: Statistics - Owners: {OwnerCount}, Total Resources: {TotalResources}", ownerCount, totalResources);
            return (ownerCount, totalResources);
        }
    }

    /// <summary>
    /// Log ownership lifecycle
    /// </summary>
    public void LogOwnershipStart(string ownerId)
    {
        _logger.LogDebug("🔗 ResourceOwnershipTracker: Starting ownership tracking for {OwnerId}", ownerId);
    }

    /// <summary>
    /// Log ownership lifecycle completion
    /// </summary>
    public void LogOwnershipComplete(string ownerId, int resourceCount)
    {
        _logger.LogDebug("🔗 ResourceOwnershipTracker: Ownership tracking completed for {OwnerId} - Resources: {ResourceCount}", ownerId, resourceCount);
    }
}

