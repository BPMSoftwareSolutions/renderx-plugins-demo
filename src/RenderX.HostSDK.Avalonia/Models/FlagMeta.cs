namespace RenderX.HostSDK.Avalonia.Models;

/// <summary>
/// Metadata for a feature flag.
/// </summary>
public class FlagMeta
{
    /// <summary>
    /// Current status of the flag.
    /// </summary>
    public FlagStatus Status { get; set; }

    /// <summary>
    /// ISO 8601 timestamp when the flag was created.
    /// </summary>
    public required string Created { get; set; }

    /// <summary>
    /// ISO 8601 timestamp when the flag was verified (optional).
    /// </summary>
    public string? Verified { get; set; }

    /// <summary>
    /// Description of what the flag controls.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Owner or team responsible for the flag.
    /// </summary>
    public string? Owner { get; set; }
}

