using Jint;
using Jint.Native;
using Microsoft.Extensions.Logging;
using System.Reflection;

namespace RenderX.HostSDK.Avalonia.Engine;

/// <summary>
/// Extended Jint engine host for RenderX Host SDK.
/// Provides access to Host SDK JavaScript APIs and type conversion utilities.
/// </summary>
public class HostSdkEngineHost : IDisposable
{
    private readonly Jint.Engine _engine;
    private readonly ILogger<HostSdkEngineHost> _logger;
    private JsValue _hostSdkGlobal = JsValue.Undefined;
    private bool _disposed;

    /// <summary>
    /// Initializes a new instance of the HostSdkEngineHost.
    /// </summary>
    /// <param name="logger">Logger instance.</param>
    public HostSdkEngineHost(ILogger<HostSdkEngineHost> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _engine = new Jint.Engine(options =>
        {
            options.TimeoutInterval(TimeSpan.FromSeconds(30));
            options.MaxStatements(100000);
        });

        InitializeBrowserStubs();
        LoadHostSdkBundle();
    }

    /// <summary>
    /// Initialize browser API stubs (window, document, console).
    /// </summary>
    private void InitializeBrowserStubs()
    {
        _logger.LogInformation("🌐 Initializing browser API stubs for Host SDK");

        // Create window object
        _engine.Execute("var window = {};");

        // Create console object with logging
        _engine.SetValue("console", new
        {
            log = new Action<object?>(msg => _logger.LogInformation("JS: {Message}", msg)),
            warn = new Action<object?>(msg => _logger.LogWarning("JS: {Message}", msg)),
            error = new Action<object?>(msg => _logger.LogError("JS: {Message}", msg)),
            info = new Action<object?>(msg => _logger.LogInformation("JS: {Message}", msg)),
            debug = new Action<object?>(msg => _logger.LogDebug("JS: {Message}", msg))
        });

        // Create minimal document stub
        _engine.Execute("var document = { createElement: function() { return {}; } };");

        _logger.LogInformation("✅ Browser stubs initialized");
    }

    /// <summary>
    /// Load the Host SDK JavaScript bundle from embedded resources.
    /// </summary>
    private void LoadHostSdkBundle()
    {
        _logger.LogInformation("📦 Loading Host SDK bundle");

        try
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "RenderX.HostSDK.Avalonia.Resources.host-sdk-bundle.js";

            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
            {
                _logger.LogWarning("⚠️ Host SDK bundle not found in embedded resources. Using stub.");
                InitializeStubHostSdk();
                return;
            }

            using var reader = new StreamReader(stream);
            var bundleCode = reader.ReadToEnd();

            _engine.Execute(bundleCode);
            _logger.LogInformation("✅ Host SDK bundle loaded successfully");

            // Ensure required APIs exist; fill any missing with safe stubs (non-promise to avoid microtask hangs)
            _engine.Execute(@"
                if (typeof window === 'undefined') { window = {}; }
                window.RenderX = window.RenderX || {};
                window.RenderX.EventRouter = window.RenderX.EventRouter || {
                    subscribe: function() { return function() {}; },
                    publish: function() { /* no-op */ }
                };
                window.RenderX.inventory = window.RenderX.inventory || {
                    listComponents: function() { return []; },
                    getComponentById: function() { return null; },
                    onInventoryChanged: function() { return function() {}; }
                };
                window.RenderX.cssRegistry = window.RenderX.cssRegistry || {
                    hasClass: function() { return false; },
                    createClass: function() { /* no-op */ },
                    updateClass: function() { /* no-op */ },
                    onCssChanged: function() { return function() {}; }
                };
                window.RenderX.config = window.RenderX.config || {
                    get: function() { return undefined; },
                    has: function() { return false; }
                };
                window.RenderX.featureFlags = window.RenderX.featureFlags || {
                    isFlagEnabled: function() { return false; },
                    getFlagMeta: function() { return undefined; },
                    getAllFlags: function() { return {}; }
                };
            ");

            // Get reference to window.RenderX (after augmentation)
            _hostSdkGlobal = _engine.Evaluate("window.RenderX");
            if (_hostSdkGlobal.IsUndefined() || _hostSdkGlobal.IsNull())
            {
                _logger.LogWarning("⚠️ window.RenderX not defined after bundle execution; falling back to stub.");
                InitializeStubHostSdk();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to load Host SDK bundle");
            InitializeStubHostSdk();
        }
    }

    /// <summary>
    /// Initialize a stub Host SDK for when the bundle is not available.
    /// </summary>
    private void InitializeStubHostSdk()
    {
        _logger.LogInformation("🔧 Initializing stub Host SDK");
        _engine.Execute(@"
            window.RenderX = {
                EventRouter: {
                    subscribe: function() { return function() {}; },
                    publish: function() { /* no-op */ }
                },
                inventory: {
                    listComponents: function() { return []; },
                    getComponentById: function() { return null; },
                    onInventoryChanged: function() { return function() {}; }
                },
                cssRegistry: {
                    hasClass: function() { return false; },
                    createClass: function() { /* no-op */ },
                    updateClass: function() { /* no-op */ },
                    onCssChanged: function() { return function() {}; }
                },
                config: {
                    get: function() { return undefined; },
                    has: function() { return false; }
                },
                featureFlags: {
                    isFlagEnabled: function() { return false; },
                    getFlagMeta: function() { return undefined; },
                    getAllFlags: function() { return {}; }
                }
            };
        ");
        _hostSdkGlobal = _engine.Evaluate("window.RenderX");
    }

    /// <summary>
    /// Call a method on the EventRouter.
    /// </summary>
    /// <param name="methodName">The method name to call.</param>
    /// <param name="args">Arguments to pass to the method.</param>
    /// <returns>The result of the method call.</returns>
    public JsValue CallEventRouterMethod(string methodName, params object[] args)
    {
        var eventRouter = GetGlobalObject("window.RenderX.EventRouter");
        if (eventRouter.IsUndefined())
        {
            throw new InvalidOperationException("EventRouter not available");
        }

        var method = eventRouter.AsObject().Get(methodName);
        if (method.IsNull() || method.IsUndefined())
        {
            throw new InvalidOperationException($"EventRouter.{methodName} not found");
        }

        var jsArgs = args.Select(ConvertToJsValue).ToArray();
        return _engine.Invoke(method, eventRouter, jsArgs);
    }

    /// <summary>
    /// Call a method on the Inventory API.
    /// </summary>
    /// <param name="methodName">The method name to call.</param>
    /// <param name="args">Arguments to pass to the method.</param>
    /// <returns>The result of the method call.</returns>
    public JsValue CallInventoryMethod(string methodName, params object[] args)
    {
        var inventory = GetGlobalObject("window.RenderX.inventory");
        if (inventory.IsUndefined())
        {
            throw new InvalidOperationException("Inventory API not available");
        }

        var method = inventory.AsObject().Get(methodName);
        if (method.IsNull() || method.IsUndefined())
        {
            throw new InvalidOperationException($"Inventory.{methodName} not found");
        }

        var jsArgs = args.Select(ConvertToJsValue).ToArray();
        return _engine.Invoke(method, inventory, jsArgs);
    }

    /// <summary>
    /// Call a method on the CSS Registry API.
    /// </summary>
    /// <param name="methodName">The method name to call.</param>
    /// <param name="args">Arguments to pass to the method.</param>
    /// <returns>The result of the method call.</returns>
    public JsValue CallCssRegistryMethod(string methodName, params object[] args)
    {
        var cssRegistry = GetGlobalObject("window.RenderX.cssRegistry");
        if (cssRegistry.IsUndefined())
        {
            throw new InvalidOperationException("CSS Registry API not available");
        }

        var method = cssRegistry.AsObject().Get(methodName);
        if (method.IsNull() || method.IsUndefined())
        {
            throw new InvalidOperationException($"CssRegistry.{methodName} not found");
        }

        var jsArgs = args.Select(ConvertToJsValue).ToArray();
        return _engine.Invoke(method, cssRegistry, jsArgs);
    }

    /// <summary>
    /// Call a method on the Config API.
    /// </summary>
    /// <param name="methodName">The method name to call.</param>
    /// <param name="args">Arguments to pass to the method.</param>
    /// <returns>The result of the method call.</returns>
    public JsValue CallConfigMethod(string methodName, params object[] args)
    {
        var config = GetGlobalObject("window.RenderX.config");
        if (config.IsUndefined())
        {
            throw new InvalidOperationException("Config API not available");
        }

        var method = config.AsObject().Get(methodName);
        if (method.IsNull() || method.IsUndefined())
        {
            throw new InvalidOperationException($"Config.{methodName} not found");
        }

        var jsArgs = args.Select(ConvertToJsValue).ToArray();
        return _engine.Invoke(method, config, jsArgs);
    }

    /// <summary>
    /// Call a method on the Feature Flags API.
    /// </summary>
    /// <param name="methodName">The method name to call.</param>
    /// <param name="args">Arguments to pass to the method.</param>
    /// <returns>The result of the method call.</returns>
    public JsValue CallFeatureFlagsMethod(string methodName, params object[] args)
    {
        var featureFlags = GetGlobalObject("window.RenderX.featureFlags");
        if (featureFlags.IsUndefined())
        {
            throw new InvalidOperationException("Feature Flags API not available");
        }

        var method = featureFlags.AsObject().Get(methodName);
        if (method.IsNull() || method.IsUndefined())
        {
            throw new InvalidOperationException($"FeatureFlags.{methodName} not found");
        }

        var jsArgs = args.Select(ConvertToJsValue).ToArray();
        return _engine.Invoke(method, featureFlags, jsArgs);
    }

    /// <summary>
    /// Get a global object by path (e.g., "window.RenderX.inventory").
    /// </summary>
    /// <param name="path">The dot-separated path to the object.</param>
    /// <returns>The JavaScript value at the path.</returns>
    public JsValue GetGlobalObject(string path)
    {
        return _engine.Evaluate(path);
    }

    /// <summary>
    /// Convert a .NET object to a JsValue.
    /// </summary>
    /// <param name="obj">The object to convert.</param>
    /// <returns>The JavaScript value.</returns>
    public JsValue ConvertToJsValue(object? obj)
    {
        return JsValue.FromObject(_engine, obj);
    }

    /// <summary>
    /// Convert a JsValue to a .NET object of type T.
    /// </summary>
    /// <typeparam name="T">The target type.</typeparam>
    /// <param name="value">The JavaScript value to convert.</param>
    /// <returns>The converted .NET object.</returns>
    public T? ConvertFromJsValue<T>(JsValue value)
    {
        return value.ToObject() is T result ? result : default;
    }

    /// <summary>
    /// Convert a JsValue to a .NET object.
    /// </summary>
    /// <param name="value">The JavaScript value to convert.</param>
    /// <returns>The converted .NET object.</returns>
    public object? ConvertFromJsValue(JsValue value)
    {
        return value.ToObject();
    }

    /// <summary>
    /// Execute arbitrary JavaScript code.
    /// </summary>
    /// <param name="code">The JavaScript code to execute.</param>
    /// <returns>The result of the execution.</returns>
    public JsValue Execute(string code)
    {
        return _engine.Evaluate(code);
    }

    /// <summary>
    /// Get the underlying Jint engine.
    /// </summary>
    public Jint.Engine Engine => _engine;

    public void Dispose()
    {
        if (_disposed) return;

        _engine?.Dispose();
        _disposed = true;
        _logger.LogInformation("🛑 HostSdkEngineHost disposed");
    }
}

