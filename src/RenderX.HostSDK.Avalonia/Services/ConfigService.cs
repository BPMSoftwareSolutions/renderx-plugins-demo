using Jint;
using Jint.Native;
using Jint.Runtime;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using System.Collections.Concurrent;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Implementation of the Config Service for managing configuration values.
/// Bridges to the JavaScript Config API implementation via Jint.
/// </summary>
public class ConfigService : IConfigService, IDisposable
{
    private readonly HostSdkEngineHost _engineHost;
    private readonly ILogger<ConfigService> _logger;
    private readonly ConcurrentDictionary<string, string> _configCache;
    private bool _disposed;

    /// <summary>
    /// Initializes a new instance of the ConfigService.
    /// </summary>
    /// <param name="engineHost">The Host SDK engine host.</param>
    /// <param name="logger">Logger instance.</param>
    public ConfigService(HostSdkEngineHost engineHost, ILogger<ConfigService> logger)
    {
        _engineHost = engineHost ?? throw new ArgumentNullException(nameof(engineHost));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _configCache = new ConcurrentDictionary<string, string>();

        _logger.LogInformation("🔧 ConfigService initialized");
    }

    /// <inheritdoc/>
    public string? GetConfigValue(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or whitespace.", nameof(key));

        _logger.LogDebug("🔍 Getting config value for key: {Key}", key);

        try
        {
            // Check cache first
            if (_configCache.TryGetValue(key, out var cachedValue))
            {
                _logger.LogDebug("✅ Config value found in cache: {Key}", key);
                return cachedValue;
            }

            // Call the JavaScript config.get method
            var jsResult = _engineHost.GetGlobalObject($"window.RenderX.config.get('{key}')");

            if (jsResult.IsNull() || jsResult.IsUndefined())
            {
                _logger.LogWarning("⚠️ Config value not found for key: {Key}", key);
                return null;
            }

            var value = jsResult.ToString();
            _configCache.TryAdd(key, value);

            _logger.LogInformation("✅ Retrieved config value for key: {Key}", key);
            return value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get config value for key: {Key}", key);
            return null;
        }
    }

    /// <inheritdoc/>
    public bool HasConfigValue(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or whitespace.", nameof(key));

        _logger.LogDebug("🔍 Checking if config key exists: {Key}", key);

        try
        {
            // Call the JavaScript config.has method
            var jsResult = _engineHost.GetGlobalObject($"window.RenderX.config.has('{key}')");

            var exists = jsResult.IsBoolean() && jsResult.AsBoolean();
            _logger.LogInformation("✅ Config key '{Key}' exists: {Exists}", key, exists);

            return exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to check if config key exists: {Key}", key);
            return false;
        }
    }

    /// <inheritdoc/>
    public void SetConfigValue(string key, string value)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or whitespace.", nameof(key));

        if (value == null)
            throw new ArgumentNullException(nameof(value));

        _logger.LogDebug("📝 Setting config value for key: {Key}", key);

        try
        {
            // Update cache
            _configCache.AddOrUpdate(key, value, (_, _) => value);

            // Call the JavaScript config.set method
            var jsKey = _engineHost.ConvertToJsValue(key);
            var jsValue = _engineHost.ConvertToJsValue(value);
            _engineHost.Execute($"window.RenderX.config.set('{key}', '{value}')");

            _logger.LogInformation("✅ Set config value for key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to set config value for key: {Key}", key);
            throw;
        }
    }

    /// <inheritdoc/>
    public void RemoveConfigValue(string key)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Key cannot be null or whitespace.", nameof(key));

        _logger.LogDebug("🗑️ Removing config value for key: {Key}", key);

        try
        {
            // Remove from cache
            _configCache.TryRemove(key, out _);

            // Call the JavaScript config.remove method
            _engineHost.Execute($"window.RenderX.config.remove('{key}')");

            _logger.LogInformation("✅ Removed config value for key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to remove config value for key: {Key}", key);
            throw;
        }
    }

    /// <summary>
    /// Initialize configuration from a dictionary.
    /// </summary>
    /// <param name="config">Dictionary of configuration values.</param>
    public void InitConfig(Dictionary<string, string> config)
    {
        if (config == null)
            throw new ArgumentNullException(nameof(config));

        _logger.LogInformation("🔧 Initializing config with {Count} values", config.Count);

        try
        {
            foreach (var kvp in config)
            {
                SetConfigValue(kvp.Key, kvp.Value);
            }

            _logger.LogInformation("✅ Config initialized successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to initialize config");
            throw;
        }
    }

    public void Dispose()
    {
        if (_disposed) return;

        _configCache.Clear();
        _disposed = true;
        _logger.LogInformation("🛑 ConfigService disposed");
    }
}

