using System.Text.Json;
using RenderX.ManifestGenerator.Models;

namespace RenderX.ManifestGenerator.Generators;

/// <summary>
/// Generates layout manifest from layout configuration.
/// Equivalent to web's generate-layout-manifest.js
/// </summary>
public class LayoutManifestGenerator
{
    private readonly string _shellDir;
    private readonly JsonSerializerOptions _jsonOptions;

    public LayoutManifestGenerator(string shellDir, JsonSerializerOptions jsonOptions)
    {
        _shellDir = shellDir;
        _jsonOptions = jsonOptions;
    }

    public async Task<LayoutManifest> GenerateAsync()
    {
        // Try to read existing layout-manifest.json
        var layoutPath = Path.Combine(_shellDir, "layout-manifest.json");
        
        if (File.Exists(layoutPath))
        {
            try
            {
                var json = await File.ReadAllTextAsync(layoutPath);
                var manifest = JsonSerializer.Deserialize<LayoutManifest>(json, _jsonOptions);
                
                if (manifest != null)
                {
                    manifest.Generated = DateTime.UtcNow;
                    return manifest;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"   ⚠️  Failed to read existing layout manifest: {ex.Message}");
            }
        }

        // Return default layout if no existing manifest
        return new LayoutManifest
        {
            Generated = DateTime.UtcNow,
            Slots = new List<LayoutSlot>
            {
                new LayoutSlot { Id = "header", PluginId = "HeaderPlugin", Position = "top" },
                new LayoutSlot { Id = "library", PluginId = "LibraryPlugin", Position = "left" },
                new LayoutSlot { Id = "canvas", PluginId = "CanvasPlugin", Position = "center" },
                new LayoutSlot { Id = "controlPanel", PluginId = "ControlPanelPlugin", Position = "right" }
            }
        };
    }
}

