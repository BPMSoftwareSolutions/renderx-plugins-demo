namespace RenderX.HostSDK.Avalonia.Models;

/// <summary>
/// Definition of a CSS class in the registry.
/// </summary>
public class CssClassDef
{
    /// <summary>
    /// Name of the CSS class.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// CSS rules for the class.
    /// </summary>
    public required string Rules { get; set; }

    /// <summary>
    /// Optional source identifier (e.g., plugin ID).
    /// </summary>
    public string? Source { get; set; }

    /// <summary>
    /// Additional metadata for the CSS class.
    /// </summary>
    public Dictionary<string, object>? Metadata { get; set; }
}

