using Microsoft.Extensions.Logging;

namespace MusicalConductor.Core.Resources;

/// <summary>
/// ResourceManager - Tracks resource allocations and releases
/// Manages resource lifecycle and ownership tracking
/// </summary>
public class ResourceManager
{
    public class ResourceAllocation
    {
        public string ResourceId { get; set; } = string.Empty;
        public string Owner { get; set; } = string.Empty;
        public DateTime AllocatedAt { get; set; }
        public DateTime? ReleasedAt { get; set; }
        public bool IsActive { get; set; }
    }

    private readonly Dictionary<string, ResourceAllocation> _allocations = new();
    private readonly ILogger<ResourceManager> _logger;
    private readonly object _lock = new();

    public ResourceManager(ILogger<ResourceManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Allocate a resource to an owner
    /// </summary>
    public void AllocateResource(string resourceId, string owner)
    {
        lock (_lock)
        {
            _allocations[resourceId] = new ResourceAllocation
            {
                ResourceId = resourceId,
                Owner = owner,
                AllocatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _logger.LogDebug(
                "📦 ResourceManager: Allocated resource {ResourceId} to {Owner}",
                resourceId,
                owner);
        }
    }

    /// <summary>
    /// Release a resource
    /// </summary>
    public void ReleaseResource(string resourceId)
    {
        lock (_lock)
        {
            if (_allocations.TryGetValue(resourceId, out var allocation))
            {
                allocation.ReleasedAt = DateTime.UtcNow;
                allocation.IsActive = false;

                _logger.LogDebug(
                    "📦 ResourceManager: Released resource {ResourceId} (owner={Owner})",
                    resourceId,
                    allocation.Owner);
            }
        }
    }

    /// <summary>
    /// Get resource allocation info
    /// </summary>
    public ResourceAllocation? GetAllocation(string resourceId)
    {
        lock (_lock)
        {
            _allocations.TryGetValue(resourceId, out var allocation);
            return allocation;
        }
    }

    /// <summary>
    /// Get all active allocations
    /// </summary>
    public IReadOnlyList<ResourceAllocation> GetActiveAllocations()
    {
        lock (_lock)
        {
            var active = _allocations.Values.Where(a => a.IsActive).ToList().AsReadOnly();
            _logger.LogDebug("📦 ResourceManager: Retrieved {ActiveCount} active allocations", active.Count);
            return active;
        }
    }

    /// <summary>
    /// Clear all allocations
    /// </summary>
    public void Clear()
    {
        lock (_lock)
        {
            var count = _allocations.Count;
            _allocations.Clear();
            _logger.LogInformation("📦 ResourceManager: Cleared {AllocationCount} allocations", count);
        }
    }

    /// <summary>
    /// Get resource lifecycle status
    /// </summary>
    public string GetResourceStatus(string resourceId)
    {
        lock (_lock)
        {
            if (_allocations.TryGetValue(resourceId, out var allocation))
            {
                var status = allocation.IsActive ? "ACTIVE" : "RELEASED";
                _logger.LogDebug("📦 ResourceManager: Resource {ResourceId} status: {Status}", resourceId, status);
                return status;
            }

            _logger.LogWarning("📦 ResourceManager: Resource {ResourceId} not found", resourceId);
            return "NOT_FOUND";
        }
    }
}

