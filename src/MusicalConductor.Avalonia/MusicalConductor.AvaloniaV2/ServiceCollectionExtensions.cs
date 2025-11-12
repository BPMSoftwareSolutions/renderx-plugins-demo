using Avalonia.Threading;
using Microsoft.Extensions.DependencyInjection;
using MusicalConductor.Core.Extensions;
using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.AvaloniaV2;

/// <summary>
/// Extension methods for integrating MusicalConductor with Avalonia applications.
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddMusicalConductorAvalonia(
        this IServiceCollection services,
        Action<MusicalConductorAvaloniaOptions>? configure = null)
    {
        if (services == null) throw new ArgumentNullException(nameof(services));

        var options = new MusicalConductorAvaloniaOptions();
        configure?.Invoke(options);
        services.AddSingleton(options);

        // Register Core services
        services.AddMusicalConductorCore(coreOptions =>
        {
            coreOptions.EnableDebugLogging = options.EnableDebugLogging;
            coreOptions.MaxConcurrentSequences = options.MaxConcurrentSequences;
            coreOptions.OperationTimeoutMs = options.OperationTimeoutMs;
        });

        // Register Avalonia-specific services
        services.AddSingleton<IAvaloniaEventDispatcher, AvaloniaEventDispatcher>();

        return services;
    }
}

public class MusicalConductorAvaloniaOptions
{
    public bool EnableDebugLogging { get; set; }
    public int MaxConcurrentSequences { get; set; } = 100;
    public int OperationTimeoutMs { get; set; } = 30000;
    public bool EnableUIThreadMarshalling { get; set; } = true;
    public bool EnableEventLogging { get; set; }
}

public interface IAvaloniaEventDispatcher
{
    void Dispatch(Action action);
    Task DispatchAsync(Func<Task> action);
    bool IsUIThread { get; }
}

internal class AvaloniaEventDispatcher : IAvaloniaEventDispatcher
{
    public bool IsUIThread => Dispatcher.UIThread.CheckAccess();

    public void Dispatch(Action action)
    {
        if (action == null) throw new ArgumentNullException(nameof(action));
        if (IsUIThread) action();
        else Dispatcher.UIThread.Post(action);
    }

    public async Task DispatchAsync(Func<Task> action)
    {
        if (action == null) throw new ArgumentNullException(nameof(action));
        if (IsUIThread)
        {
            await action();
            return;
        }

        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        Dispatcher.UIThread.Post(async () =>
        {
            try
            {
                await action();
                tcs.TrySetResult(true);
            }
            catch (Exception ex)
            {
                tcs.TrySetException(ex);
            }
        });
        await tcs.Task;
    }
}

