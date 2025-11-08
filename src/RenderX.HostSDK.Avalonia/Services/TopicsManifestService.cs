using Jint;
using Jint.Native;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Models;
using System.Collections.Concurrent;
using System.Text.Json;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Service for accessing the topics manifest. Supports provider pattern and in-memory cache.
/// </summary>
public class TopicsManifestService : ITopicsManifestService
{
    private readonly HostSdkEngineHost _engineHost;
    private readonly ILogger<TopicsManifestService> _logger;

    private ITopicsManifestProvider? _provider;

    private readonly ConcurrentDictionary<string, TopicDefinition> _topics = new();
    private volatile bool _loaded;

    public TopicsManifestService(HostSdkEngineHost engineHost, ILogger<TopicsManifestService> logger)
    {
        _engineHost = engineHost;
        _logger = logger;
    }

    public async Task InitTopicsManifestAsync()
    {
        if (_provider != null)
        {
            try
            {
                await _provider.InitAsync().ConfigureAwait(false);
                _loaded = _provider.GetStats().Loaded;
                _logger.LogInformation("Topics manifest provider initialized (Loaded={Loaded}, Count={Count})", _loaded, _provider.GetStats().TopicCount);
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Topics manifest provider InitAsync failed; continuing with fallback caches");
            }
        }

        // Fallback: try to read topics from JS if exposed
        try
        {
            var js = _engineHost.Execute("window?.RenderX?.getTopicsMap?.() || undefined");
            if (!js.IsUndefined() && !js.IsNull())
            {
                var obj = _engineHost.ConvertFromJsValue(js);
                if (obj is not null)
                {
                    var map = JsonSerializer.Deserialize<Dictionary<string, TopicDefinition>>(JsonSerializer.Serialize(obj));
                    if (map != null)
                    {
                        _topics.Clear();
                        foreach (var kvp in map)
                        {
                            _topics[kvp.Key] = kvp.Value;
                        }
                        _loaded = true;
                        _logger.LogInformation("Topics manifest initialized from JS bridge with {Count} topics", _topics.Count);
                        return;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "JS topics manifest bridge failed during init");
        }

        // Final fallback: empty
        _loaded = true;
        _logger.LogInformation("Topics manifest initialized with empty set (fallback)");
    }

    public TopicDefinition? GetTopicDef(string key)
    {
        if (_provider != null)
        {
            try { return _provider.GetTopicDef(key); } catch { return null; }
        }
        if (_topics.TryGetValue(key, out var def)) return def;
        return null;
    }

    public IReadOnlyDictionary<string, TopicDefinition> GetTopicsMap()
    {
        if (_provider != null)
        {
            try { return _provider.GetTopicsMap(); } catch { return new Dictionary<string, TopicDefinition>(); }
        }
        return _topics;
    }

    public (bool Loaded, int TopicCount) GetStats()
    {
        if (_provider != null)
        {
            try { return _provider.GetStats(); } catch { return (false, 0); }
        }
        return (_loaded, _topics.Count);
    }

    public void SetTopicsManifestProvider(ITopicsManifestProvider provider)
    {
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));
        _logger.LogInformation("Topics manifest provider set: {Type}", provider.GetType().Name);
    }

    // Optional utility: load topics manifest from a JSON file (host-side convenience)
    public async Task LoadTopicsManifestFromFileAsync(string path)
    {
        if (string.IsNullOrWhiteSpace(path)) throw new ArgumentNullException(nameof(path));
        var json = await File.ReadAllTextAsync(path).ConfigureAwait(false);
        var manifest = JsonSerializer.Deserialize<Dictionary<string, TopicDefinition>>(json) ?? new();
        _topics.Clear();
        foreach (var kvp in manifest)
        {
            _topics[kvp.Key] = kvp.Value;
        }
        _loaded = true;
        _logger.LogInformation("Loaded topics manifest from file {Path} with {Count} topics", path, _topics.Count);

        try
        {
            // Best effort: expose to JS for interop if desired by other components
            var js = JsonSerializer.Serialize(_topics);
            _engineHost.Execute($"(function(){{ try{{ window.RenderX = window.RenderX||{{}}; window.RenderX.__topics = JSON.parse('{EscapeForJsString(js)}'); }}catch(_){{}} }})()");
        }
        catch { /* ignore */ }
    }

    private static string EscapeForJsString(string s)
    {
        return s.Replace("\\", "\\\\").Replace("'", "\\'");
    }
}

