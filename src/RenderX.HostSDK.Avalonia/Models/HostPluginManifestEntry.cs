namespace RenderX.HostSDK.Avalonia.Models;

/// <summary>
/// Runtime entry information for a plugin.
/// </summary>
public class HostPluginRuntimeEntry
{
    /// <summary>
    /// Module path for the plugin.
    /// </summary>
    public required string Module { get; set; }

    /// <summary>
    /// Export name from the module.
    /// </summary>
    public required string Export { get; set; }
}

/// <summary>
/// Manifest entry for a single plugin.
/// </summary>
public class HostPluginManifestEntry
{
    /// <summary>
    /// Unique identifier for the plugin.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Display title for the plugin.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Description of the plugin's functionality.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Runtime configuration for the plugin.
    /// </summary>
    public HostPluginRuntimeEntry? Runtime { get; set; }
}

/// <summary>
/// Complete plugin manifest containing all registered plugins.
/// </summary>
public class HostPluginManifest
{
    /// <summary>
    /// List of all plugins in the manifest.
    /// </summary>
    public required List<HostPluginManifestEntry> Plugins { get; set; }
}

