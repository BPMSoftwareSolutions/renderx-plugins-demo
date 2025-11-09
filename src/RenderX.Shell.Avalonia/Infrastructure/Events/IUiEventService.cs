using Avalonia;
using System;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Events;

/// <summary>
/// Service for wiring UI events from manifest (uiEvents.json).
/// Avalonia counterpart to web version's wireUiEvents() function.
/// </summary>
public interface IUiEventService : IDisposable
{
    /// <summary>
    /// Load and wire UI events from the manifest file.
    /// </summary>
    /// <param name="manifestPath">Path to uiEvents.json manifest file.</param>
    Task WireEventsAsync(string manifestPath);

    /// <summary>
    /// Register event handlers on the target visual (typically MainWindow).
    /// Must be called after WireEventsAsync().
    /// </summary>
    /// <param name="targetVisual">Visual element to attach event handlers to (typically MainWindow)</param>
    void RegisterHandlers(Visual targetVisual);

    /// <summary>
    /// Unwire all registered event handlers.
    /// </summary>
    void UnwireAll();
}
