using RenderX.HostSDK.Avalonia.Models;

namespace RenderX.HostSDK.Avalonia.Interfaces;

/// <summary>
/// Service for accessing the plugin manifest.
/// </summary>
public interface IPluginManifestService
{
    /// <summary>
    /// Get the complete plugin manifest.
    /// </summary>
    /// <returns>The plugin manifest.</returns>
    Task<HostPluginManifest> GetPluginManifestAsync();

    /// <summary>
    /// Get the cached plugin manifest synchronously.
    /// </summary>
    /// <returns>The cached manifest if available, otherwise null.</returns>
    HostPluginManifest? GetCachedPluginManifest();

    /// <summary>
    /// Set the plugin manifest (host-side only).
    /// </summary>
    /// <param name="manifest">The manifest to set.</param>
    void SetPluginManifest(HostPluginManifest manifest);
}

