using Jint;
using Jint.Native;
using Jint.Runtime;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Models;
using System.Collections.Concurrent;
using System.Text.Json;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Implementation of the Feature Flags Service for managing feature flags.
/// Bridges to the JavaScript Feature Flags API implementation via Jint.
/// </summary>
public class FeatureFlagsService : IFeatureFlagsService, IDisposable
{
    private readonly HostSdkEngineHost _engineHost;
    private readonly ILogger<FeatureFlagsService> _logger;
    private readonly ConcurrentDictionary<string, bool> _flagOverrides;
    private readonly List<(string FlagId, DateTime Timestamp)> _usageLog;
    private IFlagsProvider? _provider;
    private bool _disposed;

    // Built-in default flags
    private static readonly Dictionary<string, FlagMeta> DefaultFlags = new()
    {
        ["lint.topics.runtime-validate"] = new FlagMeta
        {
            Status = FlagStatus.Off,
            Created = "2024-01-01",
            Description = "Runtime validation of topic payloads"
        }
    };

    /// <summary>
    /// Initializes a new instance of the FeatureFlagsService.
    /// </summary>
    /// <param name="engineHost">The Host SDK engine host.</param>
    /// <param name="logger">Logger instance.</param>
    public FeatureFlagsService(HostSdkEngineHost engineHost, ILogger<FeatureFlagsService> logger)
    {
        _engineHost = engineHost ?? throw new ArgumentNullException(nameof(engineHost));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _flagOverrides = new ConcurrentDictionary<string, bool>();
        _usageLog = new List<(string, DateTime)>();

        _logger.LogInformation("🚩 FeatureFlagsService initialized");
    }

    /// <inheritdoc/>
    public bool IsFlagEnabled(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Flag ID cannot be null or whitespace.", nameof(id));

        _logger.LogDebug("🚩 Checking if flag is enabled: {FlagId}", id);

        try
        {
            // Log usage
            lock (_usageLog)
            {
                _usageLog.Add((id, DateTime.UtcNow));
            }

            // Check test overrides first (highest priority)
            if (_flagOverrides.TryGetValue(id, out var overrideValue))
            {
                _logger.LogDebug("✅ Flag '{FlagId}' override found: {Enabled}", id, overrideValue);
                return overrideValue;
            }

            // Check custom provider
            if (_provider != null)
            {
                var providerResult = _provider.IsFlagEnabled(id);
                _logger.LogDebug("✅ Flag '{FlagId}' from provider: {Enabled}", id, providerResult);
                return providerResult;
            }

            // Call the JavaScript featureFlags.isFlagEnabled method
            var jsResult = _engineHost.GetGlobalObject($"window.RenderX.featureFlags.isFlagEnabled('{id}')");

            if (jsResult.IsNull() || jsResult.IsUndefined())
            {
                // Fall back to built-in defaults
                var defaultEnabled = DefaultFlags.ContainsKey(id) && DefaultFlags[id].Status == FlagStatus.On;
                _logger.LogDebug("✅ Flag '{FlagId}' from defaults: {Enabled}", id, defaultEnabled);
                return defaultEnabled;
            }

            var enabled = jsResult.IsBoolean() && jsResult.AsBoolean();
            _logger.LogInformation("✅ Flag '{FlagId}' enabled: {Enabled}", id, enabled);
            return enabled;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to check if flag is enabled: {FlagId}", id);
            return false;
        }
    }

    /// <inheritdoc/>
    public FlagMeta? GetFlagMeta(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Flag ID cannot be null or whitespace.", nameof(id));

        _logger.LogDebug("🚩 Getting flag metadata: {FlagId}", id);

        try
        {
            // Check custom provider
            if (_provider != null)
            {
                var providerMeta = _provider.GetFlagMeta(id);
                if (providerMeta != null)
                {
                    _logger.LogDebug("✅ Flag metadata from provider: {FlagId}", id);
                    return providerMeta;
                }
            }

            // Call the JavaScript featureFlags.getFlagMeta method
            var jsResult = _engineHost.GetGlobalObject($"window.RenderX.featureFlags.getFlagMeta('{id}')");

            if (jsResult.IsNull() || jsResult.IsUndefined())
            {
                // Fall back to built-in defaults
                if (DefaultFlags.TryGetValue(id, out var defaultMeta))
                {
                    _logger.LogDebug("✅ Flag metadata from defaults: {FlagId}", id);
                    return defaultMeta;
                }

                _logger.LogWarning("⚠️ Flag metadata not found: {FlagId}", id);
                return null;
            }

            var meta = jsResult.ToObject() as FlagMeta ?? new FlagMeta { Created = DateTime.UtcNow.ToString("O") };
            _logger.LogInformation("✅ Retrieved flag metadata: {FlagId}", id);
            return meta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get flag metadata: {FlagId}", id);
            return null;
        }
    }

    /// <inheritdoc/>
    public IReadOnlyDictionary<string, FlagMeta> GetAllFlags()
    {
        _logger.LogDebug("🚩 Getting all flags");

        try
        {
            var allFlags = new Dictionary<string, FlagMeta>(DefaultFlags);

            // Check custom provider
            if (_provider != null)
            {
                var providerFlags = _provider.GetAllFlags();
                foreach (var kvp in providerFlags)
                {
                    allFlags[kvp.Key] = kvp.Value;
                }
            }

            // Call the JavaScript featureFlags.getAllFlags method
            var jsResult = _engineHost.GetGlobalObject("window.RenderX.featureFlags.getAllFlags()");

            if (jsResult.IsObject())
            {
                var jsObj = jsResult.AsObject();
                var properties = jsObj.GetOwnProperties();
                foreach (var prop in properties)
                {
                    var key = prop.Key.ToString();
                    var value = jsObj.Get(key);
                    if (!value.IsNull() && !value.IsUndefined())
                    {
                        var meta = value.ToObject() as FlagMeta ?? new FlagMeta { Created = DateTime.UtcNow.ToString("O") };
                        allFlags[key] = meta;
                    }
                }
            }

            _logger.LogInformation("✅ Retrieved {Count} flags", allFlags.Count);
            return allFlags;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get all flags");
            return DefaultFlags;
        }
    }

    /// <summary>
    /// Set a custom feature flags provider.
    /// </summary>
    /// <param name="provider">The provider instance.</param>
    public void SetFeatureFlagsProvider(IFlagsProvider provider)
    {
        _logger.LogInformation("🔧 Setting custom feature flags provider");
        _provider = provider;
    }

    /// <summary>
    /// Set a flag override for testing.
    /// </summary>
    /// <param name="id">The flag ID.</param>
    /// <param name="enabled">Whether the flag should be enabled.</param>
    public void SetFlagOverride(string id, bool enabled)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Flag ID cannot be null or whitespace.", nameof(id));

        _logger.LogInformation("🚩 Setting flag override: {FlagId} = {Enabled}", id, enabled);
        _flagOverrides.AddOrUpdate(id, enabled, (_, _) => enabled);
    }

    /// <summary>
    /// Clear all flag overrides.
    /// </summary>
    public void ClearFlagOverrides()
    {
        _logger.LogInformation("🚩 Clearing all flag overrides");
        _flagOverrides.Clear();
    }

    /// <summary>
    /// Get the usage log of flag checks.
    /// </summary>
    /// <returns>List of flag usage events.</returns>
    public IReadOnlyList<(string FlagId, DateTime Timestamp)> GetUsageLog()
    {
        lock (_usageLog)
        {
            return _usageLog.AsReadOnly();
        }
    }

    public void Dispose()
    {
        if (_disposed) return;

        _flagOverrides.Clear();
        lock (_usageLog)
        {
            _usageLog.Clear();
        }
        _disposed = true;
        _logger.LogInformation("🛑 FeatureFlagsService disposed");
    }
}

