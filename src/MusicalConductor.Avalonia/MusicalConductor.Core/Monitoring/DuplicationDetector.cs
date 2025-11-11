using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace MusicalConductor.Core.Monitoring;

/// <summary>
/// DuplicationDetector - Content hash and duplication prevention
/// Detects duplicate sequences and content using content hashing
/// </summary>
public class DuplicationDetector
{
    private readonly Dictionary<string, string> _contentHashes = new();
    private readonly ILogger<DuplicationDetector> _logger;
    private readonly object _lock = new();

    public DuplicationDetector(ILogger<DuplicationDetector> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Register content and check for duplication
    /// </summary>
    public bool RegisterContent(string contentId, string content)
    {
        lock (_lock)
        {
            var hash = ComputeHash(content);

            if (_contentHashes.TryGetValue(contentId, out var existingHash))
            {
                if (existingHash == hash)
                {
                    _logger.LogDebug(
                        "🔍 DuplicationDetector: Content {ContentId} matches existing hash (no change)",
                        contentId);
                    return false;
                }

                _logger.LogInformation(
                    "🔍 DuplicationDetector: Content {ContentId} hash updated (old={OldHash}, new={NewHash})",
                    contentId,
                    existingHash.Substring(0, 8),
                    hash.Substring(0, 8));

                _contentHashes[contentId] = hash;
                return true;
            }

            _contentHashes[contentId] = hash;

            _logger.LogDebug(
                "🔍 DuplicationDetector: Registered new content {ContentId} with hash {Hash}",
                contentId,
                hash.Substring(0, 8));

            return true;
        }
    }

    /// <summary>
    /// Check if content is duplicate
    /// </summary>
    public bool IsDuplicate(string contentId, string content)
    {
        lock (_lock)
        {
            if (!_contentHashes.TryGetValue(contentId, out var existingHash))
            {
                return false;
            }

            var hash = ComputeHash(content);
            var isDuplicate = hash == existingHash;

            if (isDuplicate)
            {
                _logger.LogDebug("🔍 DuplicationDetector: Duplicate content detected for {ContentId}", contentId);
            }

            return isDuplicate;
        }
    }

    /// <summary>
    /// Get content hash
    /// </summary>
    public string GetContentHash(string content)
    {
        return ComputeHash(content);
    }

    /// <summary>
    /// Clear all registered content
    /// </summary>
    public void Clear()
    {
        lock (_lock)
        {
            _contentHashes.Clear();
            _logger.LogInformation("🧹 DuplicationDetector: All content hashes cleared");
        }
    }

    /// <summary>
    /// Get duplication statistics
    /// </summary>
    public int GetRegisteredContentCount()
    {
        lock (_lock)
        {
            var count = _contentHashes.Count;
            _logger.LogDebug("🔍 DuplicationDetector: Total registered content: {Count}", count);
            return count;
        }
    }

    /// <summary>
    /// Log duplication detection lifecycle
    /// </summary>
    public void LogDetectionStart(string contentId)
    {
        _logger.LogDebug("🔍 DuplicationDetector: Starting duplication check for {ContentId}", contentId);
    }

    /// <summary>
    /// Log duplication detection completion
    /// </summary>
    public void LogDetectionComplete(string contentId, bool isDuplicate)
    {
        var status = isDuplicate ? "DUPLICATE" : "UNIQUE";
        _logger.LogDebug("🔍 DuplicationDetector: Duplication check completed for {ContentId} - Status: {Status}", contentId, status);
    }

    /// <summary>
    /// Compute SHA256 hash of content
    /// </summary>
    private string ComputeHash(string content)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(content));
            return Convert.ToHexString(hashedBytes);
        }
    }
}

