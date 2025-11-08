using RenderX.HostSDK.Avalonia.Models;

namespace RenderX.HostSDK.Avalonia.Interfaces;

/// <summary>
/// API for accessing and managing the component inventory.
/// </summary>
public interface IInventoryAPI
{
    /// <summary>
    /// List all components in the inventory.
    /// </summary>
    /// <returns>A read-only list of component summaries.</returns>
    Task<IReadOnlyList<ComponentSummary>> ListComponentsAsync();

    /// <summary>
    /// Get a specific component by its ID.
    /// </summary>
    /// <param name="id">The component ID to retrieve.</param>
    /// <returns>The component if found, otherwise null.</returns>
    Task<Component?> GetComponentByIdAsync(string id);

    /// <summary>
    /// Register a callback to be notified when the inventory changes.
    /// </summary>
    /// <param name="callback">The callback to invoke with the updated component list.</param>
    /// <returns>A disposable that unsubscribes when disposed.</returns>
    IDisposable OnInventoryChanged(Action<IReadOnlyList<ComponentSummary>> callback);
}

