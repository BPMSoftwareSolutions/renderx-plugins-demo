namespace RenderX.HostSDK.Avalonia.Interfaces;

/// <summary>
/// Service for accessing configuration values.
/// </summary>
public interface IConfigService
{
    /// <summary>
    /// Get a configuration value by key.
    /// </summary>
    /// <param name="key">The configuration key.</param>
    /// <returns>The configuration value if found, otherwise null.</returns>
    string? GetConfigValue(string key);

    /// <summary>
    /// Check if a configuration key exists.
    /// </summary>
    /// <param name="key">The configuration key to check.</param>
    /// <returns>True if the key exists, false otherwise.</returns>
    bool HasConfigValue(string key);

    /// <summary>
    /// Set a configuration value (host-side only).
    /// </summary>
    /// <param name="key">The configuration key.</param>
    /// <param name="value">The configuration value.</param>
    void SetConfigValue(string key, string value);

    /// <summary>
    /// Remove a configuration value (host-side only).
    /// </summary>
    /// <param name="key">The configuration key to remove.</param>
    void RemoveConfigValue(string key);
}

