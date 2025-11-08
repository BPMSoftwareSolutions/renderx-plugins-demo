using Jint;
using Jint.Native;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Models;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Service for resolving interaction routes. Supports provider override and best-effort JS bridge.
/// </summary>
public class InteractionManifestService : IInteractionManifestService
{
    private readonly HostSdkEngineHost _engineHost;
    private readonly ILogger<InteractionManifestService> _logger;

    private IInteractionManifestProvider? _provider;

    public InteractionManifestService(HostSdkEngineHost engineHost, ILogger<InteractionManifestService> logger)
    {
        _engineHost = engineHost;
        _logger = logger;
    }

    public Route ResolveInteraction(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) throw new ArgumentNullException(nameof(key));

        // Provider takes precedence
        if (_provider is not null)
        {
            var route = _provider.ResolveInteraction(key);
            _logger.LogDebug("Resolved interaction '{Key}' via provider: {@Route}", key, route);
            return route;
        }

        // Bridge to JS if available
        try
        {
            // Try window.RenderX.resolveInteraction(key) first
            JsValue result = JsValue.Undefined;
            try { result = _engineHost.Execute($"window?.RenderX?.resolveInteraction?.('{EscapeForJsString(key)}')"); } catch { }
            if (result.IsUndefined() || result.IsNull())
            {
                try { result = _engineHost.Execute($"typeof resolveInteraction==='function' ? resolveInteraction('{EscapeForJsString(key)}') : undefined"); } catch { }
            }

            if (!result.IsUndefined() && !result.IsNull())
            {
                var obj = _engineHost.ConvertFromJsValue(result);
                if (obj is not null)
                {
                    // Map to Route
                    var route = System.Text.Json.JsonSerializer.Deserialize<Route>(
                        System.Text.Json.JsonSerializer.Serialize(obj))
                        ?? throw new KeyNotFoundException($"Interaction route for '{key}' not found");
                    _logger.LogDebug("Resolved interaction '{Key}' via JS bridge: {@Route}", key, route);
                    return route;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Interaction resolution via JS bridge failed");
        }

        throw new KeyNotFoundException($"Interaction route for '{key}' not found");
    }

    public void SetInteractionManifestProvider(IInteractionManifestProvider provider)
    {
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));
        _logger.LogInformation("Interaction manifest provider set: {Type}", provider.GetType().Name);

        // Optional: expose in JS for interop
        try
        {
            _engineHost.Execute("window.RenderX = window.RenderX || {};");
            // We do not marshal the provider to JS; provider is .NET-side only.
        }
        catch { /* ignore */ }
    }

    private static string EscapeForJsString(string s)
    {
        return s.Replace("\\", "\\\\").Replace("'", "\\'");
    }
}

