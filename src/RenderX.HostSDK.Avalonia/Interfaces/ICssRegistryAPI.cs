using RenderX.HostSDK.Avalonia.Models;

namespace RenderX.HostSDK.Avalonia.Interfaces;

/// <summary>
/// API for managing CSS classes in the registry.
/// </summary>
public interface ICssRegistryAPI
{
    /// <summary>
    /// Check if a CSS class exists in the registry.
    /// </summary>
    /// <param name="name">The CSS class name to check.</param>
    /// <returns>True if the class exists, false otherwise.</returns>
    Task<bool> HasClassAsync(string name);

    /// <summary>
    /// Create a new CSS class in the registry.
    /// </summary>
    /// <param name="def">The CSS class definition to create.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CreateClassAsync(CssClassDef def);

    /// <summary>
    /// Update an existing CSS class in the registry.
    /// </summary>
    /// <param name="name">The name of the class to update.</param>
    /// <param name="def">The updated CSS class definition.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateClassAsync(string name, CssClassDef def);

    /// <summary>
    /// Register a callback to be notified when CSS classes change.
    /// </summary>
    /// <param name="callback">The callback to invoke with the updated class list.</param>
    /// <returns>A disposable that unsubscribes when disposed.</returns>
    IDisposable OnCssChanged(Action<IReadOnlyList<CssClassDef>> callback);
}

