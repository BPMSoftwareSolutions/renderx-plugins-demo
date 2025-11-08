using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core.Handlers;

/// <summary>
/// Base class for implementing handlers.
/// </summary>
public abstract class HandlerBase : IHandler
{
    public string Name { get; }

    protected HandlerBase(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Handler name cannot be empty", nameof(name));
        Name = name;
    }

    /// <summary>
    /// Execute the handler. Override this method in derived classes.
    /// </summary>
    public abstract Task Execute(IHandlerContext context, object? data);

    /// <summary>
    /// Log information.
    /// </summary>
    protected void LogInfo(IHandlerContext context, string message)
    {
        context.Logger.Info($"[{Name}] {message}");
    }

    /// <summary>
    /// Log warning.
    /// </summary>
    protected void LogWarning(IHandlerContext context, string message)
    {
        context.Logger.Warn($"[{Name}] {message}");
    }

    /// <summary>
    /// Log error.
    /// </summary>
    protected void LogError(IHandlerContext context, string message, Exception? ex = null)
    {
        if (ex != null)
            context.Logger.Error($"[{Name}] {message}: {ex.Message}", ex);
        else
            context.Logger.Error($"[{Name}] {message}");
    }

    /// <summary>
    /// Play a nested sequence.
    /// </summary>
    protected string PlaySequence(
        IHandlerContext context,
        string pluginId,
        string sequenceId,
        object? data = null,
        SequencePriority priority = SequencePriority.NORMAL)
    {
        return context.Conductor.Play(pluginId, sequenceId, data, priority);
    }
}

