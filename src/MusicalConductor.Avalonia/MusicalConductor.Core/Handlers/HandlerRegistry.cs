using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core.Handlers;

/// <summary>
/// Registry for managing handlers in a plugin.
/// </summary>
public class HandlerRegistry
{
    private readonly Dictionary<string, IHandler> _handlers = new();

    /// <summary>
    /// Register a handler.
    /// </summary>
    public void Register(IHandler handler)
    {
        if (handler == null)
            throw new ArgumentNullException(nameof(handler));

        if (_handlers.ContainsKey(handler.Name))
            throw new InvalidOperationException($"Handler '{handler.Name}' is already registered");

        _handlers[handler.Name] = handler;
    }

    /// <summary>
    /// Register multiple handlers.
    /// </summary>
    public void RegisterMany(params IHandler[] handlers)
    {
        foreach (var handler in handlers)
            Register(handler);
    }

    /// <summary>
    /// Get a handler by name.
    /// </summary>
    public IHandler? Get(string name)
    {
        _handlers.TryGetValue(name, out var handler);
        return handler;
    }

    /// <summary>
    /// Get all registered handlers.
    /// </summary>
    public IEnumerable<IHandler> GetAll() => _handlers.Values;

    /// <summary>
    /// Get all handlers as a dictionary.
    /// </summary>
    public Dictionary<string, IHandler> GetAllAsDictionary() => new(_handlers);

    /// <summary>
    /// Check if a handler is registered.
    /// </summary>
    public bool Has(string name) => _handlers.ContainsKey(name);

    /// <summary>
    /// Unregister a handler.
    /// </summary>
    public bool Unregister(string name) => _handlers.Remove(name);

    /// <summary>
    /// Clear all handlers.
    /// </summary>
    public void Clear() => _handlers.Clear();

    /// <summary>
    /// Get the count of registered handlers.
    /// </summary>
    public int Count => _handlers.Count;
}

