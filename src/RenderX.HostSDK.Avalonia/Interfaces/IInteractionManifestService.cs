using RenderX.HostSDK.Avalonia.Models;

namespace RenderX.HostSDK.Avalonia.Interfaces;

/// <summary>
/// Provider interface for interaction manifest resolution.
/// </summary>
public interface IInteractionManifestProvider
{
    /// <summary>
    /// Resolve an interaction key to a route.
    /// </summary>
    /// <param name="key">The interaction key.</param>
    /// <returns>The route for the interaction.</returns>
    Route ResolveInteraction(string key);
}

/// <summary>
/// Service for resolving interaction routes.
/// </summary>
public interface IInteractionManifestService
{
    /// <summary>
    /// Resolve an interaction key to a route.
    /// </summary>
    /// <param name="key">The interaction key.</param>
    /// <returns>The route for the interaction.</returns>
    Route ResolveInteraction(string key);

    /// <summary>
    /// Set a custom interaction manifest provider (host-side only).
    /// </summary>
    /// <param name="provider">The provider to use for resolution.</param>
    void SetInteractionManifestProvider(IInteractionManifestProvider provider);
}

