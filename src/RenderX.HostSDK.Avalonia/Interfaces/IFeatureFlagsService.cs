using RenderX.HostSDK.Avalonia.Models;

namespace RenderX.HostSDK.Avalonia.Interfaces;

/// <summary>
/// Service for managing feature flags.
/// </summary>
public interface IFeatureFlagsService
{
    /// <summary>
    /// Check if a feature flag is enabled.
    /// </summary>
    /// <param name="id">The flag identifier.</param>
    /// <returns>True if the flag is enabled, false otherwise.</returns>
    bool IsFlagEnabled(string id);

    /// <summary>
    /// Get metadata for a specific flag.
    /// </summary>
    /// <param name="id">The flag identifier.</param>
    /// <returns>The flag metadata if found, otherwise null.</returns>
    FlagMeta? GetFlagMeta(string id);

    /// <summary>
    /// Get all flags and their metadata.
    /// </summary>
    /// <returns>A read-only dictionary of all flags.</returns>
    IReadOnlyDictionary<string, FlagMeta> GetAllFlags();
}

/// <summary>
/// Provider interface for extensible feature flag sources.
/// </summary>
public interface IFlagsProvider
{
    /// <summary>
    /// Check if a feature flag is enabled.
    /// </summary>
    /// <param name="id">The flag identifier.</param>
    /// <returns>True if the flag is enabled, false otherwise.</returns>
    bool IsFlagEnabled(string id);

    /// <summary>
    /// Get metadata for a specific flag.
    /// </summary>
    /// <param name="id">The flag identifier.</param>
    /// <returns>The flag metadata if found, otherwise null.</returns>
    FlagMeta? GetFlagMeta(string id);

    /// <summary>
    /// Get all flags and their metadata.
    /// </summary>
    /// <returns>A dictionary of all flags.</returns>
    Dictionary<string, FlagMeta> GetAllFlags();
}

