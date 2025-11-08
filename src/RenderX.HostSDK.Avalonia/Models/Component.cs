namespace RenderX.HostSDK.Avalonia.Models;

/// <summary>
/// Full component definition including JSON data and metadata.
/// </summary>
public class Component
{
    /// <summary>
    /// Unique identifier for the component.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Display name of the component.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// JSON representation of the component.
    /// </summary>
    public object? Json { get; set; }

    /// <summary>
    /// Optional tags for categorizing the component.
    /// </summary>
    public List<string>? Tags { get; set; }

    /// <summary>
    /// Additional metadata for the component.
    /// </summary>
    public Dictionary<string, object>? Metadata { get; set; }
}

