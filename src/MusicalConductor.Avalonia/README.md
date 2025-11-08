# MusicalConductor Avalonia.NET Integration

Embed the MusicalConductor orchestration engine in your Avalonia.NET desktop applications using the Jint JavaScript engine.

## Features

✅ **Single-Process Deployment** - No external Node.js dependency  
✅ **Small Footprint** - Only +5-10MB (Jint NuGet package)  
✅ **Fast Performance** - Direct method calls (~0.5-2ms latency)  
✅ **Cross-Platform** - Works on Windows, Linux, macOS  
✅ **Easy Integration** - Simple DI registration and API  
✅ **Full Reuse** - 100% code reuse from TypeScript conductor  
✅ **Comprehensive Logging** - Integrated with .NET ILogger  

## Quick Start

### 1. Install Package

```bash
dotnet add package MusicalConductor.Avalonia
```

### 2. Register Services

```csharp
using MusicalConductor.Avalonia.Extensions;

services.AddMusicalConductor(options =>
{
    options.EnableDebugLogging = true;
});
```

### 3. Use in Your App

```csharp
public partial class MainWindow : Window
{
    private readonly IConductorClient _conductor;

    public MainWindow(IConductorClient conductor)
    {
        _conductor = conductor;
        InitializeComponent();
    }

    private void PlaySequence()
    {
        var requestId = _conductor.Play(
            pluginId: \"my-plugin\",
            sequenceId: \"my-sequence\",
            context: new { message = \"Hello!\" }
        );

        _conductor.On(\"sequence:completed\", (data) =>
        {
            Console.WriteLine(\"Sequence completed!\");
        });
    }
}
```

## Architecture

```
Avalonia App (C#)
    ↓
IConductorClient Interface
    ↓
ConductorClient Implementation
    ↓
JintEngineHost (Jint Engine)
    ↓
MusicalConductor (JavaScript Bundle)
    ↓
EventBus + Plugins
```

## Project Structure

```
tools/avalonia-integration/
├── MusicalConductor.Avalonia.csproj    # Main project file
├── Interfaces/
│   └── IConductorClient.cs              # Public API interface
├── Engine/
│   └── JintEngineHost.cs                # Jint engine host
├── Client/
│   └── ConductorClient.cs               # Client implementation
├── Extensions/
│   └── ServiceCollectionExtensions.cs   # DI registration
├── Sample/
│   ├── SampleApp.csproj                 # Sample app project
│   ├── App.xaml.cs                      # App entry point
│   └── MainWindow.xaml.cs               # Sample window
├── ARCHITECTURE.md                      # Architecture guide
├── INTEGRATION_GUIDE.md                 # Integration guide
└── README.md                            # This file
```

## API Reference

### IConductorClient

- **Play(pluginId, sequenceId, context?, priority?)** - Execute a sequence
- **On(eventName, callback, context?)** - Subscribe to an event
- **Off(eventName, callback)** - Unsubscribe from an event
- **GetStatus()** - Get conductor status
- **GetStatistics()** - Get execution statistics
- **RegisterCIAPlugins()** - Register CIA-compliant plugins

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed API documentation.

## Configuration

```csharp
services.AddMusicalConductor(options =>
{
    // Enable debug logging (default: false)
    options.EnableDebugLogging = true;

    // Timeout for operations in ms (default: 30000)
    options.OperationTimeoutMs = 30000;

    // Max concurrent sequences (default: 100)
    options.MaxConcurrentSequences = 100;

    // Custom bundle path (optional)
    options.CustomBundlePath = \"/path/to/bundle.js\";
});
```

## Performance

| Metric | Value |
|--------|-------|
| Startup Time | 100-200ms |
| Play() Latency | 0.5-2ms |
| Memory Footprint | +20-30MB |
| Deployment Size | +5-10MB |

## Comparison: Node.js IPC vs Jint

| Criterion | Node.js IPC | Jint |
|-----------|-------------|------|
| Deployment Size | +150MB | +5-10MB |
| Startup Time | 2-3s | 100-200ms |
| Play() Latency | 5-10ms | 0.5-2ms |
| Single Process | ❌ | ✅ |
| Error Recovery | Complex | Simple |
| Debugging | Separate logs | Unified |

**Recommendation:** Use Jint for better performance, smaller footprint, and simpler deployment.

## Common Events

- `sequence:started` - Sequence started playing
- `sequence:completed` - Sequence completed successfully
- `sequence:failed` - Sequence failed
- `beat:executed` - Individual beat executed

## Troubleshooting

### Bundle Not Found
Ensure `conductor-bundle.js` is in the Resources folder or specify `CustomBundlePath`.

### Method Not Found
Check logs for bundle loading errors. Ensure the bundle is valid JavaScript.

### Timeout
Increase `OperationTimeoutMs` in options or check for long-running sequences.

## Documentation

- [Architecture Guide](ARCHITECTURE.md) - Detailed architecture and design
- [Integration Guide](INTEGRATION_GUIDE.md) - Complete API reference and examples
- [Sample App](Sample/) - Working example application

## Requirements

- .NET 8.0 or later
- Avalonia 11.0 or later
- Windows, Linux, or macOS

## License

MIT - See LICENSE file

## Support

For issues, questions, or contributions, please visit:
https://github.com/BPMSoftwareSolutions/MusicalConductor

## Roadmap

- [ ] ClearScript support for Windows-only builds
- [ ] .NET plugin system
- [ ] Improved async/await bridging
- [ ] Enhanced debugging support
- [ ] Performance optimizations

