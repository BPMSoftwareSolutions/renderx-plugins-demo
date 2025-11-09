using Jint;
using Jint.Native;
using Jint.Runtime;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Logging;

namespace MusicalConductor.Avalonia.Engine;

/// <summary>
/// Hosts the MusicalConductor JavaScript engine using Jint.
/// Manages engine initialization, bundle loading, and browser API stubs.
/// </summary>
public class JintEngineHost : IDisposable
{
    private readonly Jint.Engine _engine;
    private readonly ILogger<JintEngineHost> _logger;
    private readonly MusicalConductor.Avalonia.Extensions.MusicalConductorOptions? _options;
    private readonly ConductorLogger? _conductorLogger;
    private JsValue _conductorInstance = JsValue.Undefined;
    private bool _disposed;

    public JintEngineHost(
        ILogger<JintEngineHost> logger,
        MusicalConductor.Avalonia.Extensions.MusicalConductorOptions? options = null,
        ConductorLogger? conductorLogger = null)
    {
        _logger = logger;
        _options = options;
        _conductorLogger = conductorLogger;
        _engine = new Jint.Engine(options =>
        {
            options.TimeoutInterval(TimeSpan.FromSeconds(30));
            options.MaxStatements(100000);
        });

        InitializeBrowserStubs();
        LoadConductorBundle();
        SubscribeToConductorEvents();
    }

    /// <summary>
    /// Initialize browser API stubs (window, document, console).
    /// Console stubs preserve icons from JavaScript (ConductorLogger.ts) instead of adding redundant prefixes.
    /// </summary>
    private void InitializeBrowserStubs()
    {
        _logger.LogInformation("🌐 Initializing browser API stubs for Jint engine");

        // Minimal stubs sufficient for compilation and simple runtime
        _engine.SetValue("window", new object());
        _engine.SetValue("document", new object());
        _engine.SetValue("console", new
        {
            log = new Action<object?[]>(args => LogWithIconPreservation(LogLevel.Information, args)),
            info = new Action<object?[]>(args => LogWithIconPreservation(LogLevel.Information, args)),
            warn = new Action<object?[]>(args => LogWithIconPreservation(LogLevel.Warning, args)),
            error = new Action<object?[]>(args => LogWithIconPreservation(LogLevel.Error, args))
        });

        _logger.LogInformation("✅ Browser stubs initialized");
    }

    /// <summary>
    /// Log with icon preservation - don't add our own prefix if message already has an icon from ConductorLogger.ts
    /// </summary>
    private void LogWithIconPreservation(LogLevel level, object?[] args)
    {
        var message = string.Join(" ", (args ?? Array.Empty<object?>()).Select(a => a?.ToString()));

        // Preserve icons from JavaScript - don't add our own prefix if message already has an icon
        // Icons are typically emoji which are represented as surrogate pairs in UTF-16
        var hasIcon = message.Length > 0 && (char.IsHighSurrogate(message[0]) || IsCommonEmoji(message));

        if (hasIcon)
        {
            // Message already has an icon from ConductorLogger.ts, preserve it as-is
            _logger.Log(level, "{Message}", message);
        }
        else
        {
            // No icon detected, add default based on level
            var icon = level switch
            {
                LogLevel.Warning => "⚠️",
                LogLevel.Error => "❌",
                _ => "🎼"
            };
            _logger.Log(level, "{Icon} [JS] {Message}", icon, message);
        }
    }

    /// <summary>
    /// Check if the message starts with a common emoji used in ConductorLogger
    /// </summary>
    private bool IsCommonEmoji(string message)
    {
        if (string.IsNullOrEmpty(message)) return false;

        // Check for common emoji prefixes used in ConductorLogger
        var commonEmojis = new[] { "🎼", "🎵", "🥁", "🔧", "🧩", "🎭", "📡", "🎽", "🧠", "🔍", "📊", "🎯", "✅" };
        return commonEmojis.Any(emoji => message.StartsWith(emoji));
    }



    /// <summary>
    /// Load the MusicalConductor JavaScript bundle.
    /// </summary>
    private void LoadConductorBundle()
    {
        _logger.LogInformation("📦 Loading MusicalConductor bundle into Jint engine");

        try
        {
            // Load the compiled conductor bundle
            var bundleScript = GetBundleScript();
            _engine.Execute(bundleScript);

            // Get the conductor instance from the global scope
            _conductorInstance = _engine.GetValue("MusicalConductor");

            if (_conductorInstance.IsUndefined() || _conductorInstance.IsNull())
            {
                throw new InvalidOperationException("MusicalConductor not found in bundle");
            }

            _logger.LogInformation("✅ MusicalConductor bundle loaded successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to load MusicalConductor bundle");
            throw;
        }
    }

    /// <summary>
    /// Get the conductor bundle script (from embedded resource or file).
    /// </summary>
    private string GetBundleScript()
    {
        // 1) Environment variable override
        var envPath = Environment.GetEnvironmentVariable("MC_BUNDLE_PATH");
        if (!string.IsNullOrWhiteSpace(envPath) && File.Exists(envPath))
        {
            _logger.LogInformation("📦 Loading MusicalConductor bundle from MC_BUNDLE_PATH: {Path}", envPath);
            return File.ReadAllText(envPath);
        }

        // 2) Options override
        var optPath = _options?.CustomBundlePath;
        if (!string.IsNullOrWhiteSpace(optPath) && File.Exists(optPath))
        {
            _logger.LogInformation("📦 Loading MusicalConductor bundle from options.CustomBundlePath: {Path}", optPath);
            return File.ReadAllText(optPath);
        }

        // 3) Embedded resource fallback

        // Try to load from embedded resource first
        var assembly = typeof(JintEngineHost).Assembly;
        var resourceName = "MusicalConductor.Avalonia.Resources.conductor-bundle.js";

        using (var stream = assembly.GetManifestResourceStream(resourceName))
        {
            if (stream != null)
            {
                using (var reader = new StreamReader(stream))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        // Fallback: load from file
        var bundlePath = Path.Combine(AppContext.BaseDirectory, "conductor-bundle.js");
        if (File.Exists(bundlePath))
        {
            return File.ReadAllText(bundlePath);
        }

        throw new FileNotFoundException($"MusicalConductor bundle not found at {bundlePath}");
    }

    /// <summary>
    /// Call a method on the conductor instance.
    /// </summary>
    public JsValue CallMethod(string methodName, params JsValue[] args)
    {
        if (_conductorInstance.IsUndefined())
        {
            throw new InvalidOperationException("Conductor not initialized");
        }

        var method = _conductorInstance.AsObject().Get(methodName);
        if (method.IsNull() || method.IsUndefined())
        {
            throw new InvalidOperationException($"Method {methodName} not found on conductor");
        }

        return _engine.Invoke(method, _conductorInstance, args);
    }

    /// <summary>
    /// Get a property from the conductor instance.
    /// </summary>
    public JsValue GetProperty(string propertyName)
    {
        if (_conductorInstance.IsUndefined())
        {
            throw new InvalidOperationException("Conductor not initialized");
        }

        return _conductorInstance.AsObject().Get(propertyName);
    }

    /// <summary>
    /// Execute arbitrary JavaScript code.
    /// </summary>
    public JsValue Execute(string code)
    {
        return _engine.Evaluate(code);
    }

    /// <summary>
    /// Convert a .NET object to a JsValue using the underlying engine.
    /// </summary>
    public JsValue FromObject(object? value)
    {
        return JsValue.FromObject(_engine, value);
    }

    /// <summary>
    /// Subscribe ConductorLogger to Musical Conductor events from the JavaScript EventBus.
    /// This enables hierarchical logging with contextual icons matching the web version.
    /// </summary>
    private void SubscribeToConductorEvents()
    {
        if (_conductorLogger == null)
        {
            _logger.LogDebug("ConductorLogger not provided, skipping event subscriptions");
            return;
        }

        try
        {
            // Get EventBus from the conductor instance
            var eventBusJs = _conductorInstance.AsObject().Get("eventBus");

            if (eventBusJs.IsNull() || eventBusJs.IsUndefined())
            {
                _logger.LogWarning("⚠️ EventBus not found on MusicalConductor instance, cannot subscribe ConductorLogger");
                return;
            }

            // Create adapter to bridge JavaScript EventBus to .NET IEventBus
            var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            var adapterLogger = loggerFactory.CreateLogger<JintEventBusAdapter>();
            var eventBusAdapter = new JintEventBusAdapter(_engine, eventBusJs, adapterLogger);

            // Subscribe ConductorLogger to events
            _conductorLogger.SubscribeToEvents(eventBusAdapter);

            _logger.LogInformation("✅ ConductorLogger subscribed to Musical Conductor events");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to subscribe ConductorLogger to Musical Conductor events");
        }
    }

    public void Dispose()
    {
        if (_disposed) return;

        _engine?.Dispose();
        _disposed = true;
        _logger.LogInformation("🛑 Jint engine disposed");
    }
}

