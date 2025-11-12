# MusicalConductor Avalonia.NET Integration Guide

## Quick Start

### 1. Add NuGet Package

```bash
dotnet add package MusicalConductor.Avalonia
```

### 2. Register Services

In your `App.xaml.cs`:

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Extensions;

public partial class App : Application
{
    private IServiceProvider? _serviceProvider;

    public override void OnFrameworkInitializationCompleted()
    {
        var services = new ServiceCollection();

        // Add logging
        services.AddLogging(builder =>
        {
            builder.AddConsole();
            builder.SetMinimumLevel(LogLevel.Information);
        });

        // Add MusicalConductor
        services.AddMusicalConductor(options =>
        {
            options.EnableDebugLogging = true;
        });

        _serviceProvider = services.BuildServiceProvider();

        if (ApplicationLifetime is IClassicDesktopApplicationLifetime desktop)
        {
            desktop.MainWindow = new MainWindow(
                _serviceProvider.GetRequiredService<IConductorClient>(),
                _serviceProvider.GetRequiredService<ILogger<MainWindow>>()
            );
        }

        base.OnFrameworkInitializationCompleted();
    }
}
```

### 3. Use in Your Window

```csharp
using MusicalConductor.Avalonia.Interfaces;

public partial class MainWindow : Window
{
    private readonly IConductorClient _conductor;

    public MainWindow(IConductorClient conductor)
    {
        _conductor = conductor;
        InitializeComponent();
    }

    private void PlaySequence_Click(object? sender, RoutedEventArgs e)
    {
        var requestId = _conductor.Play(
            pluginId: \"my-plugin\",
            sequenceId: \"my-sequence\",
            context: new { message = \"Hello!\" }
        );

        Console.WriteLine($\"Sequence started: {requestId}\");
    }

    private void SetupSubscriptions()
    {
        _conductor.On(\"sequence:completed\", (data) =>
        {
            Console.WriteLine($\"Sequence completed: {data}\");
        });

        _conductor.On(\"sequence:failed\", (data) =>
        {
            Console.WriteLine($\"Sequence failed: {data}\");
        });
    }
}
```

## API Reference

### IConductorClient

#### Play(pluginId, sequenceId, context?, priority?)

Play a sequence with optional context and priority.

```csharp
var requestId = conductor.Play(
    pluginId: \"my-plugin\",
    sequenceId: \"my-sequence\",
    context: new { userId = 123 },
    priority: \"HIGH\"
);
```

**Parameters:**
- `pluginId` (string): Plugin that owns the sequence
- `sequenceId` (string): Sequence to play
- `context` (object?, optional): Data passed to handlers
- `priority` (string?, optional): Execution priority

**Returns:** Request ID for tracking

#### On(eventName, callback, context?)

Subscribe to an event.

```csharp
var unsubscribe = conductor.On(\"beat:executed\", (data) =>
{
    Console.WriteLine($\"Beat executed: {data}\");
});

// Later: unsubscribe
unsubscribe();
```

**Parameters:**
- `eventName` (string): Event to listen for
- `callback` (Action<object?>): Function to call
- `context` (object?, optional): Callback context

**Returns:** Unsubscribe function

#### Off(eventName, callback)

Unsubscribe from an event.

```csharp
conductor.Off(\"beat:executed\", myCallback);
```

#### GetStatus()

Get current conductor status.

```csharp
var status = conductor.GetStatus();
Console.WriteLine(status);
```

**Returns:** Status object with statistics, sequences, plugins

#### GetStatistics()

Get conductor statistics.

```csharp
var stats = conductor.GetStatistics();
Console.WriteLine($\"Executions: {stats}\");
```

**Returns:** Statistics object

#### RegisterCIAPlugins()

Register CIA-compliant plugins.

```csharp
await conductor.RegisterCIAPlugins();
```

## Common Events

### sequence:started
Fired when a sequence starts playing.

```csharp
conductor.On(\"sequence:started\", (data) =>
{
    Console.WriteLine($\"Sequence started: {data}\");
});
```

### sequence:completed
Fired when a sequence completes successfully.

```csharp
conductor.On(\"sequence:completed\", (data) =>
{
    Console.WriteLine($\"Sequence completed: {data}\");
});
```

### sequence:failed
Fired when a sequence fails.

```csharp
conductor.On(\"sequence:failed\", (data) =>
{
    Console.WriteLine($\"Sequence failed: {data}\");
});
```

### beat:executed
Fired when a beat (individual event) is executed.

```csharp
conductor.On(\"beat:executed\", (data) =>
{
    Console.WriteLine($\"Beat executed: {data}\");
});
```

## Configuration

### MusicalConductorOptions

```csharp
services.AddMusicalConductor(options =>
{
    // Enable debug logging
    options.EnableDebugLogging = true;

    // Timeout for operations (ms)
    options.OperationTimeoutMs = 30000;

    // Max concurrent sequences
    options.MaxConcurrentSequences = 100;

    // Custom bundle path (optional)
    options.CustomBundlePath = \"/path/to/bundle.js\";
});
```

## Error Handling

```csharp
try
{
    var requestId = conductor.Play(\"plugin\", \"sequence\");
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($\"Conductor error: {ex.Message}\");
}
catch (Exception ex)
{
    Console.WriteLine($\"Unexpected error: {ex.Message}\");
}
```

## Troubleshooting

### Bundle Not Found
**Error:** \"MusicalConductor bundle not found\"

**Solution:** Ensure `conductor-bundle.js` is in the Resources folder or specify `CustomBundlePath` in options.

### Method Not Found
**Error:** \"Method play not found on conductor\"

**Solution:** Ensure the conductor bundle is loaded correctly. Check logs for bundle loading errors.

### Timeout
**Error:** Operation timed out

**Solution:** Increase `OperationTimeoutMs` in options or check for long-running sequences.

## Performance Tips

1. **Reuse IConductorClient:** Don't create new instances for each call
2. **Batch Operations:** Group related plays together
3. **Async Subscriptions:** Use async callbacks for long-running operations
4. **Monitor Memory:** Watch for memory leaks in long-running apps

## Next Steps

- See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture
- Check [Sample App](Sample/) for complete example
- Review [API Reference](#api-reference) for all methods

