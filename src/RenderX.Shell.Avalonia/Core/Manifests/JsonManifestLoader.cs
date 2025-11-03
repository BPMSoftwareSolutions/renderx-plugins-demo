using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core.Manifests;

/// <summary>
/// JSON-based manifest loader implementation
/// </summary>
public class JsonManifestLoader : IManifestLoader
{
    private readonly ILogger<JsonManifestLoader> _logger;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly ConcurrentDictionary<string, object> _cache;

    public JsonManifestLoader(ILogger<JsonManifestLoader> logger)
    {
        _logger = logger;
        _cache = new ConcurrentDictionary<string, object>();
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true,
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<T> LoadManifestAsync<T>(string manifestPath) where T : class
    {
        if (_cache.TryGetValue(manifestPath, out var cached) && cached is T cachedResult)
        {
            return cachedResult;
        }

        try
        {
            _logger.LogDebug("Loading manifest from {ManifestPath}", manifestPath);

            if (!File.Exists(manifestPath))
            {
                throw new FileNotFoundException($"Manifest file not found: {manifestPath}");
            }

            var json = await File.ReadAllTextAsync(manifestPath);
            var manifest = JsonSerializer.Deserialize<T>(json, _jsonOptions);

            if (manifest == null)
                throw new InvalidOperationException($"Failed to deserialize manifest from {manifestPath}");

            // TODO: Validate manifest using FluentValidation
            // This will be implemented in task 1.5

            _cache[manifestPath] = manifest;
            _logger.LogInformation("Successfully loaded manifest from {ManifestPath}", manifestPath);

            return manifest;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load manifest from {ManifestPath}", manifestPath);
            throw;
        }
    }

    public async Task<T> LoadManifestAsync<T>(string manifestPath, T fallback) where T : class
    {
        try
        {
            return await LoadManifestAsync<T>(manifestPath);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load manifest from {ManifestPath}, using fallback", manifestPath);
            return fallback;
        }
    }

    public void ClearCache()
    {
        _logger.LogDebug("Clearing manifest cache");
        _cache.Clear();
    }
}
