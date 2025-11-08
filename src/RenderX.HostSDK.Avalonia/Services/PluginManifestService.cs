using Jint;
using Jint.Native;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Models;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Service for accessing the plugin manifest with optional JS bridge via HostSdkEngineHost.
/// </summary>
public class PluginManifestService : IPluginManifestService
{
    private readonly HostSdkEngineHost _engineHost;
    private readonly ILogger<PluginManifestService> _logger;
    private readonly object _lock = new();

    private HostPluginManifest? _cached;

    public PluginManifestService(HostSdkEngineHost engineHost, ILogger<PluginManifestService> logger)
    {
        _engineHost = engineHost;
        _logger = logger;
    }

    public Task<HostPluginManifest> GetPluginManifestAsync()
    {
        lock (_lock)
        {
            if (_cached is not null)
            {
                return Task.FromResult(_cached);
            }
        }

        // Try bridge to JS (best-effort)
        try
        {
            // Prefer a global accessor if exposed by the bundle
            // Attempts in this order:
            // 1) window.RenderX.getPluginManifest()
            // 2) getPluginManifest()
            JsValue result = JsValue.Undefined;
            try { result = _engineHost.Execute("window?.RenderX?.getPluginManifest?.()") ; } catch { }
            if (result.IsUndefined() || result.IsNull())
            {
                try { result = _engineHost.Execute("typeof getPluginManifest==='function' ? getPluginManifest() : undefined"); } catch { }
            }

            if (!result.IsUndefined() && !result.IsNull())
            {
                var manifestObj = _engineHost.ConvertFromJsValue(result);
                if (manifestObj is not null)
                {
                    // Best-effort POCO mapping
                    var manifest = System.Text.Json.JsonSerializer.Deserialize<HostPluginManifest>(
                        System.Text.Json.JsonSerializer.Serialize(manifestObj))
                        ?? new HostPluginManifest { Plugins = new() };

                    lock (_lock) { _cached = manifest; }
                    return Task.FromResult(manifest);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Plugin manifest JS bridge failed; falling back to empty manifest");
        }

        // Fallback: empty manifest
        var empty = new HostPluginManifest { Plugins = new() };
        lock (_lock) { _cached = empty; }
        return Task.FromResult(empty);
    }

    public HostPluginManifest? GetCachedPluginManifest()
    {
        lock (_lock)
        {
            return _cached;
        }
    }

    public void SetPluginManifest(HostPluginManifest manifest)
    {
        if (manifest is null) throw new ArgumentNullException(nameof(manifest));
        lock (_lock)
        {
            _cached = manifest;
        }

        // Best-effort: push to JS side if function exists
        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(manifest);
            // Create a plain object from JSON in JS context and setRenderX pluginManifest if available
            _engineHost.Execute($"(function(){{ try{{ window.RenderX = window.RenderX||{{}}; window.RenderX.pluginManifest = JSON.parse('{EscapeForJsString(json)}'); if(typeof window.RenderX.setPluginManifest==='function') window.RenderX.setPluginManifest(window.RenderX.pluginManifest); }}catch(_){{}} }})()");
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to push plugin manifest into JS context");
        }
    }

    private static string EscapeForJsString(string s)
    {
        return s.Replace("\\", "\\\\").Replace("'", "\\'");
    }
}

