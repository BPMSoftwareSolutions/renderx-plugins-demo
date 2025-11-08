namespace RenderX.HostSDK.Avalonia.Models;

/// <summary>
/// Performance configuration for a topic.
/// </summary>
public class TopicPerformanceConfig
{
    /// <summary>
    /// Throttle interval in milliseconds.
    /// </summary>
    public int? ThrottleMs { get; set; }

    /// <summary>
    /// Debounce interval in milliseconds.
    /// </summary>
    public int? DebounceMs { get; set; }

    /// <summary>
    /// Deduplication window in milliseconds.
    /// </summary>
    public int? DedupeWindowMs { get; set; }
}

/// <summary>
/// Complete definition of a topic including routes and configuration.
/// </summary>
public class TopicDefinition
{
    /// <summary>
    /// Routes that handle this topic.
    /// </summary>
    public required List<Route> Routes { get; set; }

    /// <summary>
    /// Optional JSON schema for payload validation.
    /// </summary>
    public object? PayloadSchema { get; set; }

    /// <summary>
    /// Visibility level of the topic (public or internal).
    /// </summary>
    public string? Visibility { get; set; }

    /// <summary>
    /// Keys used for correlation tracking.
    /// </summary>
    public List<string>? CorrelationKeys { get; set; }

    /// <summary>
    /// Performance configuration for the topic.
    /// </summary>
    public TopicPerformanceConfig? Perf { get; set; }

    /// <summary>
    /// Additional notes or documentation.
    /// </summary>
    public string? Notes { get; set; }
}

