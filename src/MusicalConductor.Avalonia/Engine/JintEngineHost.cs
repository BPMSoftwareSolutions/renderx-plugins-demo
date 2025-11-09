using Jint;
using Jint.Native;
using Jint.Runtime;
using Microsoft.Extensions.Logging;
using System.Linq;

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

    // Shim object exposed to JS as `console` that supports varargs methods
    private sealed class ConsoleShim
    {
        private readonly Action<LogLevel, object?[]> _sink;
        public ConsoleShim(Action<LogLevel, object?[]> sink) => _sink = sink;
        public void log(params object?[] args) => _sink(LogLevel.Information, args);
        public void info(params object?[] args) => _sink(LogLevel.Information, args);
        public void warn(params object?[] args) => _sink(LogLevel.Warning, args);
        public void error(params object?[] args) => _sink(LogLevel.Error, args);
    }


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

        // Console shim with params varargs methods to match browser semantics
        _engine.SetValue("console", new ConsoleShim((lvl, arr) => LogWithIconPreservation(lvl, arr)));

        _logger.LogInformation("✅ Browser stubs initialized");
    }

    /// <summary>
    /// Log with icon preservation - don't add our own prefix if message already has an icon from ConductorLogger.ts
    /// </summary>
    private void LogWithIconPreservation(LogLevel level, object?[] args)
    {
        args ??= Array.Empty<object?>();

        // Handle console styling tokens like %c and drop the corresponding style args
        string first = args.Length > 0 ? args[0]?.ToString() ?? string.Empty : string.Empty;
        int styleTokenCount = 0;
        if (!string.IsNullOrEmpty(first))
        {
            // Count occurrences of %c in the first argument and strip them
            int idx = 0;
            while (true)
            {
                var found = first.IndexOf("%c", idx, StringComparison.Ordinal);
                if (found < 0) break;
                styleTokenCount++;
                idx = found + 2;
            }
            if (styleTokenCount > 0)
            {


                first = first.Replace("%c", "");
            }
        }

        // Rebuild message skipping style args immediately following the first arg
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(first)) parts.Add(first);
        for (int i = 1 + styleTokenCount; i < args.Length; i++)
        {
            parts.Add(args[i]?.ToString() ?? string.Empty);
        }
        var message = string.Join(" ", parts.Where(p => !string.IsNullOrEmpty(p))).Trim();

        // Preserve icons from JavaScript - don't add our own prefix if message already has an icon
        var hasIcon = HasEmoji(message);

        if (hasIcon)
        {
            _logger.Log(level, "{Message}", message);
        }
        else
        {
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
    /// Return true if the message contains any common emoji we use to signal categories.
    /// This ignores leading console style tokens like %c.
    /// </summary>
    private bool HasEmoji(string message)
    {
        if (string.IsNullOrEmpty(message)) return false;
        var trimmed = message.TrimStart();

        // Common emoji used across the web logs (expanded set for parity)
        var commonEmojis = new[]
        {
            "🎼","🎵","🥁","🔧","🧩","🎭","📡","🎽","🧠","🔍","📊","🎯","✅",
            "🧭","⏱️","📦","🔄","📄","📂","📚","🎬","🖼️","📥","🧪","🚀","🧹","🔌",
            "⏭","↪️","🧭","📐","🎨","🚌","%c✅" // include styled token variant
        };
        // If message starts with any emoji or contains them anywhere, consider present
        return commonEmojis.Any(e => trimmed.StartsWith(e, StringComparison.Ordinal) || trimmed.Contains(e, StringComparison.Ordinal));
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
    /// Evaluate arbitrary JavaScript in the hosted engine (primarily for tests).
    /// </summary>
    public void Eval(string script)
    {
        if (string.IsNullOrWhiteSpace(script)) return;
        _engine.Execute(script);
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

