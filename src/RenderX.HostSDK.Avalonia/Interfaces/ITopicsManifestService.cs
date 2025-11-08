using RenderX.HostSDK.Avalonia.Models;

namespace RenderX.HostSDK.Avalonia.Interfaces;

/// <summary>
/// Provider interface for topics manifest.
/// </summary>
public interface ITopicsManifestProvider
{
    /// <summary>
    /// Initialize the topics manifest provider.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task InitAsync();

    /// <summary>
    /// Get the definition for a specific topic.
    /// </summary>
    /// <param name="key">The topic key.</param>
    /// <returns>The topic definition if found, otherwise null.</returns>
    TopicDefinition? GetTopicDef(string key);

    /// <summary>
    /// Get all topics in the manifest.
    /// </summary>
    /// <returns>A dictionary of all topics.</returns>
    Dictionary<string, TopicDefinition> GetTopicsMap();

    /// <summary>
    /// Get statistics about the topics manifest.
    /// </summary>
    /// <returns>Statistics including loaded status and topic count.</returns>
    (bool Loaded, int TopicCount) GetStats();
}

/// <summary>
/// Service for accessing the topics manifest.
/// </summary>
public interface ITopicsManifestService
{
    /// <summary>
    /// Initialize the topics manifest.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task InitTopicsManifestAsync();

    /// <summary>
    /// Get the definition for a specific topic.
    /// </summary>
    /// <param name="key">The topic key.</param>
    /// <returns>The topic definition if found, otherwise null.</returns>
    TopicDefinition? GetTopicDef(string key);

    /// <summary>
    /// Get all topics in the manifest.
    /// </summary>
    /// <returns>A read-only dictionary of all topics.</returns>
    IReadOnlyDictionary<string, TopicDefinition> GetTopicsMap();

    /// <summary>
    /// Get statistics about the topics manifest.
    /// </summary>
    /// <returns>Statistics including loaded status and topic count.</returns>
    (bool Loaded, int TopicCount) GetStats();

    /// <summary>
    /// Set a custom topics manifest provider (host-side only).
    /// </summary>
    /// <param name="provider">The provider to use.</param>
    void SetTopicsManifestProvider(ITopicsManifestProvider provider);
}

